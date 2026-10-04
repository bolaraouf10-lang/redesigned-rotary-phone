import { DurableObject } from "cloudflare:workers";

/* =========================
   إعدادات
========================= */

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SESSION_FOREVER = 8640000000000000;
const PBKDF2_ITERATIONS = 100000;

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>الدردشة</title>

<style>
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif}
body{background:#e5ddd5;color:#111}
button,input{font:inherit}
button{cursor:pointer;border:0}
.hidden{display:none!important}

#auth{
 min-height:100vh;
 display:flex;
 align-items:center;
 justify-content:center;
 padding:20px;
 background:#075e54;
}

.auth-box{
 width:min(420px,100%);
 background:white;
 padding:25px;
 border-radius:16px;
 box-shadow:0 10px 40px #0004;
}

.auth-box h1{
 margin:0 0 20px;
 text-align:center;
 color:#075e54;
}

.auth-box input{
 width:100%;
 padding:13px;
 margin:7px 0;
 border:1px solid #ddd;
 border-radius:10px;
 outline:none;
}

.auth-box input:focus{border-color:#128c7e}

.auth-actions{
 display:flex;
 gap:8px;
 margin-top:10px;
}

.auth-actions button{
 flex:1;
 padding:12px;
 border-radius:10px;
 background:#128c7e;
 color:#fff;
}

#switchAuth{
 width:100%;
 margin-top:10px;
 background:none;
 color:#075e54;
}

#error{
 color:#c62828;
 text-align:center;
 min-height:22px;
 margin-top:10px;
}

#app{
 height:100vh;
 display:flex;
 overflow:hidden;
}

.sidebar{
 width:310px;
 background:#fff;
 border-left:1px solid #ddd;
 display:flex;
 flex-direction:column;
}

.side-head{
 background:#075e54;
 color:#fff;
 padding:15px;
}

.side-head-row{
 display:flex;
 justify-content:space-between;
 align-items:center;
 gap:8px;
}

.side-head h2{
 margin:0;
 font-size:19px;
}

.icon-btn{
 background:#ffffff22;
 color:white;
 width:38px;
 height:38px;
 border-radius:50%;
}

.search{
 padding:10px;
 background:#f0f2f5;
}

.search input{
 width:100%;
 padding:11px;
 border:0;
 border-radius:9px;
 outline:0;
}

#userList{
 overflow:auto;
 flex:1;
}

.user{
 display:flex;
 align-items:center;
 gap:10px;
 padding:12px;
 border-bottom:1px solid #eee;
 cursor:pointer;
}

.user:hover{background:#f5f5f5}
.user.active{background:#e7f7f4}

.avatar{
 width:43px;
 height:43px;
 border-radius:50%;
 background:#128c7e;
 color:#fff;
 display:flex;
 align-items:center;
 justify-content:center;
 font-weight:bold;
 flex-shrink:0;
}

.user-info{
 flex:1;
 min-width:0;
}

.user-name{
 font-weight:bold;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
}

.user-status{
 font-size:12px;
 color:#888;
 margin-top:4px;
}

.dot{
 width:9px;
 height:9px;
 border-radius:50%;
 background:#aaa;
}

.dot.online{background:#20c55a}

.chat{
 flex:1;
 display:flex;
 flex-direction:column;
 min-width:0;
}

.chat-head{
 height:64px;
 background:#075e54;
 color:#fff;
 display:flex;
 align-items:center;
 gap:10px;
 padding:10px 14px;
}

.chat-head .avatar{background:#128c7e}

.chat-title{
 flex:1;
 min-width:0;
}

.chat-title b{
 display:block;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
}

.chat-title small{opacity:.8}

.call-buttons{
 display:flex;
 gap:5px;
}

.call-buttons button{
 width:38px;
 height:38px;
 border-radius:50%;
 background:#ffffff22;
 color:#fff;
}

#messages{
 flex:1;
 overflow:auto;
 padding:15px;
 display:flex;
 flex-direction:column;
 gap:7px;
}

.empty{
 margin:auto;
 color:#777;
 text-align:center;
}

.msg{
 max-width:min(75%,520px);
 padding:8px 10px;
 border-radius:10px;
 position:relative;
 word-break:break-word;
 box-shadow:0 1px 2px #0001;
}

.msg.mine{
 align-self:flex-start;
 background:#d9ffc9;
 border-top-left-radius:3px;
}

.msg.theirs{
 align-self:flex-end;
 background:#fff;
 border-top-right-radius:3px;
}

.msg.deleted{
 color:#888;
 font-style:italic;
 background:#eee;
}

.msg-text{white-space:pre-wrap}

.msg-time{
 font-size:10px;
 color:#777;
 margin-top:4px;
 text-align:left;
}

.msg img,.msg video{
 max-width:100%;
 max-height:320px;
 border-radius:8px;
 display:block;
 margin-top:4px;
}

.msg audio{
 width:100%;
 max-width:300px;
 margin-top:4px;
}

.file-link{
 display:block;
 color:#075e54;
 font-weight:bold;
 text-decoration:none;
 padding:10px;
 background:#f1f1f1;
 border-radius:8px;
 margin-top:4px;
}

.typing{
 height:24px;
 padding:0 15px;
 color:#777;
 font-size:12px;
}

.composer{
 display:flex;
 gap:7px;
 padding:10px;
 background:#f0f2f5;
 align-items:center;
}

.composer input{
 flex:1;
 min-width:0;
 padding:12px;
 border:0;
 border-radius:20px;
 outline:none;
}

.composer button{
 width:42px;
 height:42px;
 border-radius:50%;
 background:#128c7e;
 color:#fff;
 flex-shrink:0;
}

.composer button.recording{
 background:#c62828;
}

#fileInput{display:none}

#settings{
 position:fixed;
 inset:0;
 background:#0007;
 display:flex;
 align-items:center;
 justify-content:center;
 padding:20px;
 z-index:50;
}

.modal{
 width:min(430px,100%);
 background:#fff;
 border-radius:15px;
 padding:20px;
}

.modal h2{margin-top:0}

.setting-row{
 display:flex;
 justify-content:space-between;
 align-items:center;
 padding:13px 0;
 border-bottom:1px solid #eee;
}

.danger{
 width:100%;
 padding:12px;
 background:#c62828;
 color:#fff;
 border-radius:9px;
 margin-top:15px;
}

.close{
 width:100%;
 padding:11px;
 background:#eee;
 border-radius:9px;
 margin-top:8px;
}

#callModal{
 position:fixed;
 inset:0;
 background:#000a;
 z-index:100;
 display:flex;
 align-items:center;
 justify-content:center;
 padding:15px;
}

.call-box{
 background:#111;
 width:min(600px,100%);
 border-radius:18px;
 overflow:hidden;
 color:white;
 text-align:center;
}

#remoteVideo{
 width:100%;
 max-height:70vh;
 background:#000;
 object-fit:contain;
}

#localVideo{
 position:absolute;
 width:120px;
 height:170px;
 object-fit:cover;
 bottom:20px;
 right:20px;
 background:#222;
 border-radius:10px;
}

.call-controls{
 padding:15px;
 display:flex;
 justify-content:center;
 gap:10px;
}

.call-controls button{
 padding:12px 18px;
 border-radius:25px;
 background:#333;
 color:#fff;
}

.call-controls .red{background:#c62828}

#incoming{
 position:fixed;
 inset:0;
 background:#0009;
 z-index:120;
 display:flex;
 align-items:center;
 justify-content:center;
}

.incoming-box{
 background:#fff;
 width:min(360px,90%);
 border-radius:18px;
 padding:25px;
 text-align:center;
}

.incoming-buttons{
 display:flex;
 gap:10px;
}

.incoming-buttons button{
 flex:1;
 padding:12px;
 border-radius:10px;
 background:#128c7e;
 color:#fff;
}

.incoming-buttons .reject{background:#c62828}

body.dark{
 background:#111;
 color:#eee;
}

body.dark .sidebar,
body.dark .modal,
body.dark .incoming-box{
 background:#1e1e1e;
 color:#eee;
}

body.dark .user:hover,
body.dark .user.active{background:#292929}

body.dark .composer,
body.dark .search{background:#222}

body.dark .composer input,
body.dark .search input{background:#333;color:#fff}

body.dark .msg.theirs{background:#292929;color:#fff}
body.dark .msg.mine{background:#164d35}
body.dark .file-link{background:#333;color:#8ee6d4}

@media(max-width:700px){
 .sidebar{width:180px}
 .msg{max-width:88%}
}

@media(max-width:430px){
 .sidebar{width:150px}
 .side-head h2{font-size:15px}
 .call-buttons button{width:32px;height:32px}
}
</style>
</head>

<body>

<div id="auth">
 <div class="auth-box">
  <h1 id="authTitle">إنشاء حساب</h1>

  <input id="username" maxlength="20" placeholder="اسم المستخدم">
  <input id="password" type="password" placeholder="كلمة المرور">

  <div class="auth-actions">
   <button id="registerBtn">إنشاء الحساب</button>
   <button id="loginBtn">دخول</button>
  </div>

  <button id="switchAuth">لديك حساب؟ تسجيل الدخول</button>
  <div id="error"></div>
 </div>
</div>

<div id="app" class="hidden">

 <aside class="sidebar">

  <div class="side-head">
   <div class="side-head-row">
    <h2>المستخدمون</h2>

    <div>
     <button class="icon-btn" id="settingsBtn">⚙️</button>
     <button class="icon-btn" id="logoutBtn">↪</button>
    </div>
   </div>
  </div>

  <div class="search">
   <input id="userSearch" placeholder="ابحث عن مستخدم...">
  </div>

  <div id="userList">
   <div class="empty">جاري تحميل المستخدمين...</div>
  </div>

 </aside>

 <main class="chat">

  <header class="chat-head">

   <div class="avatar" id="chatAvatar">?</div>

   <div class="chat-title">
    <b id="chatTitle">اختر مستخدمًا</b>
    <small id="chatStatus">غير متصل</small>
   </div>

   <div class="call-buttons">
    <button id="audioCallBtn" title="مكالمة صوتية">📞</button>
    <button id="videoCallBtn" title="مكالمة فيديو">📹</button>
   </div>

  </header>

  <div id="messages">
   <div class="empty">اختر مستخدمًا لبدء المحادثة</div>
  </div>

  <div class="typing" id="typing"></div>

  <div class="composer">

   <button id="fileBtn" title="ملف">📎</button>

   <button id="recordBtn" title="رسالة صوتية">🎙️</button>

   <input id="messageInput" placeholder="اكتب رسالة...">

   <button id="sendBtn">➤</button>

   <input id="fileInput" type="file">

  </div>

 </main>
</div>

<div id="settings" class="hidden">
 <div class="modal">

  <h2>الإعدادات</h2>

  <div class="setting-row">
   <span>الحساب</span>
   <b id="settingsUsername"></b>
  </div>

  <div class="setting-row">
   <span>الوضع الداكن</span>
   <input type="checkbox" id="darkMode">
  </div>

  <button class="danger" id="deleteAccountBtn">حذف الحساب نهائيًا</button>
  <button class="close" id="closeSettings">إغلاق</button>

 </div>
</div>

<div id="incoming" class="hidden">
 <div class="incoming-box">
  <h2 id="incomingTitle">مكالمة واردة</h2>
  <p id="incomingType"></p>

  <div class="incoming-buttons">
   <button id="acceptCall">قبول</button>
   <button class="reject" id="rejectCall">رفض</button>
  </div>
 </div>
</div>

<div id="callModal" class="hidden">

 <div class="call-box">

  <video id="remoteVideo" autoplay playsinline></video>
  <video id="localVideo" autoplay muted playsinline></video>
  <audio id="remoteAudio" autoplay></audio>

  <div id="callText">متصل...</div>

  <div class="call-controls">
   <button class="red" id="endCallBtn">إنهاء المكالمة</button>
   <button id="muteBtn">🎤 كتم</button>
   <button id="cameraBtn">📷 الكاميرا</button>
  </div>

 </div>

</div>

<script>
const $ = id => document.getElementById(id);

let token = localStorage.getItem("chatToken") || "";
let currentUser = localStorage.getItem("chatUser") || "";
let selectedUser = "";
let users = [];

let ws = null;
let reconnectTimer = null;
let shouldReconnect = true;

let registerMode = true;
let typingTimer = null;

let mediaRecorder = null;
let audioChunks = [];

let callPC = null;
let callStream = null;
let remoteStream = null;
let callTarget = "";
let callType = "audio";
let incomingCall = null;
let pendingCandidates = [];

const RTC_CONFIG = {
 iceServers: [
  {urls:"stun:stun.l.google.com:19302"},
  {urls:"stun:stun.cloudflare.com:3478"}
 ]
};

/* =========================
   أدوات
========================= */

function esc(v){
 return String(v ?? "")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");
}

function api(path, options = {}){
 options.headers = options.headers || {};
 options.headers["Content-Type"] = "application/json";

 return fetch(path, options);
}

function setError(msg){
 $("error").textContent = msg || "";
}

function showApp(){
 $("auth").classList.add("hidden");
 $("app").classList.remove("hidden");
 $("settingsUsername").textContent = currentUser;
}

function showAuth(){
 $("app").classList.add("hidden");
 $("auth").classList.remove("hidden");
}

function saveSession(t,u){
 token = t;
 currentUser = u;
 localStorage.setItem("chatToken", t);
 localStorage.setItem("chatUser", u);
}

function clearSession(){
 token = "";
 currentUser = "";
 selectedUser = "";

 localStorage.removeItem("chatToken");
 localStorage.removeItem("chatUser");
}

function formatTime(ts){
 try{
  return new Date(ts).toLocaleTimeString("ar-EG",{
   hour:"2-digit",
   minute:"2-digit"
  });
 }catch{
  return "";
 }
}

/* =========================
   تسجيل / دخول
========================= */

$("switchAuth").onclick = () => {
 registerMode = !registerMode;

 $("authTitle").textContent =
  registerMode ? "إنشاء حساب" : "تسجيل الدخول";

 $("registerBtn").style.display =
  registerMode ? "block" : "none";

 $("loginBtn").style.display =
  registerMode ? "none" : "block";

 $("switchAuth").textContent =
  registerMode
   ? "لديك حساب؟ تسجيل الدخول"
   : "ليس لديك حساب؟ إنشاء حساب";

 setError("");
};

$("registerBtn").onclick = () => auth("register");
$("loginBtn").onclick = () => auth("login");

$("password").addEventListener("keydown",e=>{
 if(e.key==="Enter"){
  auth(registerMode ? "register" : "login");
 }
});

async function auth(mode){

 const username = $("username").value.trim();
 const password = $("password").value;

 if(username.length < 3){
  setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
  return;
 }

 if(password.length < 6){
  setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
  return;
 }

 setError("جاري التنفيذ...");

 try{

  const r = await api(
   mode === "register" ? "/api/register" : "/api/login",
   {
    method:"POST",
    body:JSON.stringify({username,password})
   }
  );

  const data = await r.json().catch(()=>({}));

  if(!r.ok){
   setError(data.error || "حدث خطأ");
   return;
  }

  saveSession(data.token,data.username || username);

  $("username").value = "";
  $("password").value = "";

  setError("");

  showApp();
  await loadUsers();
  connectWS();

 }catch(e){
  setError("تعذر الاتصال بالخادم");
 }
}

async function restoreSession(){

 if(!token || !currentUser){
  showAuth();
  return;
 }

 try{

  const r = await api(
   "/api/me?token=" + encodeURIComponent(token),
   {method:"GET"}
  );

  if(!r.ok){
   clearSession();
   showAuth();
   return;
  }

  const data = await r.json();

  currentUser = data.username;
  localStorage.setItem("chatUser",currentUser);

  showApp();

  await loadUsers();
  connectWS();

 }catch{

  clearSession();
  showAuth();
 }
}

/* =========================
   المستخدمون + البحث
========================= */

async function loadUsers(){

 if(!token) return;

 try{

  const r = await fetch(
   "/api/users?token=" + encodeURIComponent(token),
   {cache:"no-store"}
  );

  if(r.status === 401){
   forceLogout();
   return;
  }

  const data = await r.json();

  users = Array.isArray(data.users) ? data.users : [];

  renderUsers();

 }catch{

  $("userList").innerHTML =
   '<div class="empty">تعذر تحميل المستخدمين</div>';
 }
}

function renderUsers(){

 const q = $("userSearch").value.trim().toLowerCase();

 let list = users.filter(u =>
  u.username !== currentUser &&
  u.username.toLowerCase().includes(q)
 );

 if(!list.length){
  $("userList").innerHTML =
   '<div class="empty">لا يوجد مستخدمون</div>';
  return;
 }

 $("userList").innerHTML = list.map(u=>{

  const active = u.username === selectedUser;
  const online = !!u.online;

  return \`
   <div class="user \${active ? "active" : ""}"
        data-user="\${esc(u.username)}">

    <div class="avatar">
     \${esc(u.username.charAt(0).toUpperCase())}
    </div>

    <div class="user-info">
     <div class="user-name">\${esc(u.username)}</div>

     <div class="user-status">
      \span class="dot \${online ? "online" : ""}"></span>
      \${online ? "متصل الآن" : "غير متصل"}
     </div>
    </div>

   </div>
  \`;
 }).join("");

 document.querySelectorAll(".user").forEach(el=>{
  el.onclick = ()=>{
   selectUser(el.dataset.user);
  };
 });
}

$("userSearch").oninput = renderUsers;

function selectUser(username){

 selectedUser = username;

 const u = users.find(x=>x.username === username);

 $("chatTitle").textContent = username;
 $("chatAvatar").textContent =
  username.charAt(0).toUpperCase();

 $("chatStatus").textContent =
  u && u.online ? "متصل الآن" : "غير متصل";

 renderUsers();
 loadHistory(username);
}

/* =========================
   WebSocket
========================= */

function connectWS(){

 if(!token || !shouldReconnect) return;

 if(ws &&
   (ws.readyState === WebSocket.OPEN ||
    ws.readyState === WebSocket.CONNECTING)){
  return;
 }

 const protocol =
  location.protocol === "https:" ? "wss:" : "ws:";

 ws = new WebSocket(
  protocol + "//" + location.host +
  "/ws?token=" + encodeURIComponent(token)
 );

 ws.onopen = ()=>{

  clearTimeout(reconnectTimer);

  $("chatStatus").textContent =
   selectedUser ? "متصل" : "متصل بالخادم";

  loadUsers();

  if(selectedUser){
   loadHistory(selectedUser);
  }
 };

 ws.onmessage = e=>{
  try{
   handleSocketMessage(JSON.parse(e.data));
  }catch{}
 };

 ws.onclose = ()=>{

  if(!shouldReconnect) return;

  $("chatStatus").textContent = "جاري إعادة الاتصال...";

  clearTimeout(reconnectTimer);

  reconnectTimer = setTimeout(
   connectWS,
   2000
  );
 };

 ws.onerror = ()=>{};
}

function sendWS(data){

 if(!ws || ws.readyState !== WebSocket.OPEN){
  return false;
 }

 ws.send(JSON.stringify(data));
 return true;
}

function handleSocketMessage(data){

 if(data.type === "users"){
  users = data.users || [];
  renderUsers();
  return;
 }

 if(data.type === "message"){
  if(
   data.message.sender === selectedUser ||
   data.message.receiver === selectedUser
  ){
   addMessage(data.message);
  }

  loadUsers();
  return;
 }

 if(data.type === "message_edited"){
  const el = document.querySelector(
   '[data-message-id="' + data.id + '"] .msg-text'
  );

  if(el){
   el.textContent = data.text;
  }

  return;
 }

 if(data.type === "message_deleted"){
  const el = document.querySelector(
   '[data-message-id="' + data.id + '"]'
  );

  if(el){
   el.classList.add("deleted");

   const t = el.querySelector(".msg-text");
   if(t) t.textContent = "تم حذف الرسالة";
  }

  return;
 }

 if(data.type === "message_read"){
  return;
 }

 if(data.type === "typing"){

  if(data.from !== selectedUser) return;

  $("typing").textContent =
   data.value ? "يكتب الآن..." : "";

  return;
 }

 if(data.type === "history"){
  renderMessages(data.messages || []);
  return;
 }

 if(data.type === "signal"){
  handleSignal(data.signal);
  return;
 }
}

/* =========================
   الرسائل
========================= */

async function loadHistory(username){

 if(!username) return;

 try{

  const r = await fetch(
   "/api/history?token=" +
   encodeURIComponent(token) +
   "&user=" +
   encodeURIComponent(username),
   {cache:"no-store"}
  );

  if(r.status === 401){
   forceLogout();
   return;
  }

  const data = await r.json();

  renderMessages(data.messages || []);

 }catch{

  $("messages").innerHTML =
   '<div class="empty">تعذر تحميل المحادثة</div>';
 }
}

function renderMessages(list){

 $("messages").innerHTML = "";

 if(!list.length){
  $("messages").innerHTML =
   '<div class="empty">لا توجد رسائل بعد</div>';
  return;
 }

 list.forEach(addMessage);

 scrollMessages();
}

function addMessage(m){

 if(!m) return;

 const exists =
  document.querySelector(
   '[data-message-id="' + m.id + '"]'
  );

 if(exists) return;

 const mine = m.sender === currentUser;

 const el = document.createElement("div");

 el.className =
  "msg " + (mine ? "mine" : "theirs") +
  (m.deleted_for_all ? " deleted" : "");

 el.dataset.messageId = m.id;

 let body = "";

 if(m.deleted_for_all){

  body = '<div class="msg-text">تم حذف الرسالة</div>';

 }else if(m.kind === "image" && m.file_id){

  body =
   '<img src="' +
   fileUrl(m.file_id) +
   '" alt="صورة">';

 }else if(m.kind === "video" && m.file_id){

  body =
   '<video controls src="' +
   fileUrl(m.file_id) +
   '"></video>';

 }else if(m.kind === "audio" && m.file_id){

  body =
   '<audio controls src="' +
   fileUrl(m.file_id) +
   '"></audio>';

 }else if(m.kind === "file" && m.file_id){

  body =
   '<a class="file-link" target="_blank" href="' +
   fileUrl(m.file_id) +
   '">📎 ' +
   esc(m.file_name || "ملف") +
   '</a>';

 }else{

  body =
   '<div class="msg-text">' +
   esc(m.text || "") +
   '</div>';
 }

 el.innerHTML =
  body +
  '<div class="msg-time">' +
  formatTime(m.created_at) +
  (m.edited_at ? " · تم التعديل" : "") +
  '</div>';

 $("messages").appendChild(el);
}

function fileUrl(id){
 return "/api/file?token=" +
  encodeURIComponent(token) +
  "&id=" +
  encodeURIComponent(id);
}

function scrollMessages(){
 $("messages").scrollTop =
  $("messages").scrollHeight;
}

$("sendBtn").onclick = sendText;

$("messageInput").addEventListener("keydown",e=>{
 if(e.key === "Enter" && !e.shiftKey){
  e.preventDefault();
  sendText();
 }
});

$("messageInput").addEventListener("input",()=>{

 if(!selectedUser) return;

 sendWS({
  type:"typing",
  to:selectedUser,
  value:true
 });

 clearTimeout(typingTimer);

 typingTimer = setTimeout(()=>{
  sendWS({
   type:"typing",
   to:selectedUser,
   value:false
  });
 },900);
});

function sendText(){

 const text = $("messageInput").value.trim();

 if(!text || !selectedUser) return;

 if(!sendWS({
  type:"message",
  to:selectedUser,
  text:text
 })){
  $("typing").textContent = "الاتصال غير متاح";
  setTimeout(()=> $("typing").textContent="",1500);
  return;
 }

 $("messageInput").value = "";

}

/* =========================
   رفع الملفات
========================= */

$("fileBtn").onclick = ()=>{
 if(!selectedUser){
  alert("اختر مستخدمًا أولًا");
  return;
 }

 $("fileInput").click();
};

$("fileInput").onchange = async ()=>{

 const file = $("fileInput").files[0];

 $("fileInput").value = "";

 if(!file || !selectedUser) return;

 await uploadFile(file);
};

async function uploadFile(file){

 if(file.size > ${MAX_FILE_SIZE}){
  alert("حجم الملف أكبر من 20 ميجابايت");
  return;
 }

 try{

  $("typing").textContent = "جاري إرسال الملف...";

  const r = await fetch(
   "/api/upload?token=" +
   encodeURIComponent(token) +
   "&to=" +
   encodeURIComponent(selectedUser) +
   "&name=" +
   encodeURIComponent(file.name) +
   "&mime=" +
   encodeURIComponent(file.type || "application/octet-stream"),
   {
    method:"POST",
    headers:{
     "Content-Type":"application/octet-stream"
    },
    body:file
   }
  );

  const data = await r.json().catch(()=>({}));

  $("typing").textContent = "";

  if(!r.ok){
   alert(data.error || "تعذر إرسال الملف");
   return;
  }

  addMessage(data.message);
  scrollMessages();

 }catch{
  $("typing").textContent = "";
  alert("تعذر الاتصال أثناء إرسال الملف");
 }
}

/* =========================
   الرسائل الصوتية
========================= */

$("recordBtn").onclick = async ()=>{

 if(mediaRecorder && mediaRecorder.state === "recording"){
  mediaRecorder.stop();
  return;
 }

 if(!selectedUser){
  alert("اختر مستخدمًا أولًا");
  return;
 }

 try{

  const stream =
   await navigator.mediaDevices.getUserMedia({
    audio:true
   });

  audioChunks = [];

  mediaRecorder =
   new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e=>{
   if(e.data.size){
    audioChunks.push(e.data);
   }
  };

  mediaRecorder.onstop = async ()=>{

   stream.getTracks().forEach(t=>t.stop());

   $("recordBtn").classList.remove("recording");

   const blob =
    new Blob(audioChunks,{
     type:mediaRecorder.mimeType || "audio/webm"
    });

   const file =
    new File(
     [blob],
     "voice-" + Date.now() + ".webm",
     {type:blob.type}
    );

   await uploadFile(file);
  };

  mediaRecorder.start();

  $("recordBtn").classList.add("recording");

 }catch{
  alert("تعذر تشغيل الميكروفون");
 }
};

/* =========================
   المكالمات
========================= */

$("audioCallBtn").onclick = ()=>{
 startCall("audio");
};

$("videoCallBtn").onclick = ()=>{
 startCall("video");
};

async function createPeer(){

 callPC = new RTCPeerConnection(RTC_CONFIG);

 remoteStream =
  new MediaStream();

 $("remoteVideo").srcObject =
  remoteStream;

 $("remoteAudio").srcObject =
  remoteStream;

 callPC.ontrack = e=>{

  e.streams[0].getTracks().forEach(track=>{
   remoteStream.addTrack(track);
  });

  $("remoteVideo").play().catch(()=>{});
  $("remoteAudio").play().catch(()=>{});
 };

 callPC.onicecandidate = e=>{

  if(e.candidate){

   sendWS({
    type:"signal",
    to:callTarget,
    signal:{
     type:"rtc_candidate",
     candidate:e.candidate
    }
   });
  }
 };

 callPC.onconnectionstatechange = ()=>{

  const state = callPC.connectionState;

  if(state === "connected"){
   $("callText").textContent = "متصل";
  }

  if(
   state === "failed" ||
   state === "disconnected" ||
   state === "closed"
  ){
   $("callText").textContent =
    "انقطع الاتصال";
  }
 };
}

async function startCall(type){

 if(!selectedUser){
  alert("اختر مستخدمًا أولًا");
  return;
 }

 const target = users.find(
  u=>u.username === selectedUser
 );

 if(!target || !target.online){
  alert("المستخدم غير متصل الآن");
  return;
 }

 try{

  callType = type;
  callTarget = selectedUser;

  pendingCandidates = [];

  callStream =
   await navigator.mediaDevices.getUserMedia({
    audio:true,
    video:type === "video"
   });

  $("localVideo").srcObject =
   callStream;

  $("localVideo").style.display =
   type === "video" ? "block" : "none";

  await createPeer();

  callStream.getTracks().forEach(track=>{
   callPC.addTrack(track,callStream);
  });

  const offer =
   await callPC.createOffer();

  await callPC.setLocalDescription(offer);

  sendWS({
   type:"signal",
   to:callTarget,
   signal:{
    type:"rtc_offer",
    callType:type,
    offer:offer
   }
  });

  $("callModal").classList.remove("hidden");
  $("callText").textContent = "جاري الاتصال...";

 }catch(e){

  endCall(false);
  alert("تعذر تشغيل المكالمة. تأكد من السماح بالكاميرا والميكروفون.");
 }
}

async function handleSignal(s){

 if(!s || !s.type) return;

 if(s.type === "rtc_offer"){

  incomingCall = s;

  $("incomingTitle").textContent =
   "مكالمة من " + selectedUser;

  $("incomingType").textContent =
   s.callType === "video"
    ? "مكالمة فيديو"
    : "مكالمة صوتية";

  $("incoming").classList.remove("hidden");

  return;
 }

 if(s.type === "rtc_candidate"){

  if(callPC && callPC.remoteDescription){

   try{
    await callPC.addIceCandidate(s.candidate);
   }catch{}
  }else{
   pendingCandidates.push(s.candidate);
  }

  return;
 }

 if(s.type === "rtc_answer"){

  if(!callPC) return;

  await callPC.setRemoteDescription(
   new RTCSessionDescription(s.answer)
  );

  for(const c of pendingCandidates){
   try{
    await callPC.addIceCandidate(c);
   }catch{}
  }

  pendingCandidates = [];

  return;
 }

 if(s.type === "rtc_end"){
  endCall(false);
 }
}

$("acceptCall").onclick = async ()=>{

 if(!incomingCall) return;

 $("incoming").classList.add("hidden");

 callType =
  incomingCall.callType || "audio";

 callTarget =
  selectedUser;

 try{

  callStream =
   await navigator.mediaDevices.getUserMedia({
    audio:true,
    video:callType === "video"
   });

  $("localVideo").srcObject =
   callStream;

  $("localVideo").style.display =
   callType === "video" ? "block" : "none";

  const oldPending =
   pendingCandidates.slice();

  await createPeer();

  callStream.getTracks().forEach(track=>{
   callPC.addTrack(track,callStream);
  });

  await callPC.setRemoteDescription(
   new RTCSessionDescription(
    incomingCall.offer
   )
  );

  for(const c of oldPending){
   try{
    await callPC.addIceCandidate(c);
   }catch{}
  }

  pendingCandidates = [];

  const answer =
   await callPC.createAnswer();

  await callPC.setLocalDescription(answer);

  sendWS({
   type:"signal",
   to:callTarget,
   signal:{
    type:"rtc_answer",
    answer:answer
   }
  });

  $("callModal").classList.remove("hidden");
  $("callText").textContent = "متصل...";

  incomingCall = null;

 }catch{

  incomingCall = null;
  alert("تعذر قبول المكالمة");
 }
};

$("rejectCall").onclick = ()=>{

 if(incomingCall && incomingCall.from){

  sendWS({
   type:"signal",
   to:incomingCall.from,
   signal:{type:"rtc_end"}
  });
 }

 incomingCall = null;
 $("incoming").classList.add("hidden");
};

$("endCallBtn").onclick = ()=>{
 endCall(true);
};

function endCall(sendSignal=true){

 if(sendSignal && callTarget){

  sendWS({
   type:"signal",
   to:callTarget,
   signal:{type:"rtc_end"}
  });
 }

 if(callPC){
  try{callPC.close()}catch{}
 }

 callPC = null;

 if(callStream){
  callStream.getTracks().forEach(t=>t.stop());
 }

 callStream = null;
 remoteStream = null;
 pendingCandidates = [];

 $("remoteVideo").srcObject = null;
 $("remoteAudio").srcObject = null;
 $("localVideo").srcObject = null;

 $("callModal").classList.add("hidden");

 callTarget = "";
}

$("muteBtn").onclick = ()=>{

 if(!callStream) return;

 const track =
  callStream.getAudioTracks()[0];

 if(!track) return;

 track.enabled = !track.enabled;

 $("muteBtn").textContent =
  track.enabled ? "🎤 كتم" : "🔇 تشغيل الصوت";
};

$("cameraBtn").onclick = ()=>{

 if(!callStream) return;

 const track =
  callStream.getVideoTracks()[0];

 if(!track) return;

 track.enabled = !track.enabled;

 $("cameraBtn").textContent =
  track.enabled ? "📷 إيقاف الكاميرا" : "📷 تشغيل الكاميرا";
};

/* =========================
   الإعدادات
========================= */

$("settingsBtn").onclick = ()=>{
 $("settings").classList.remove("hidden");
};

$("closeSettings").onclick = ()=>{
 $("settings").classList.add("hidden");
};

$("darkMode").onchange = ()=>{

 document.body.classList.toggle(
  "dark",
  $("darkMode").checked
 );

 localStorage.setItem(
  "darkMode",
  $("darkMode").checked ? "1" : "0"
 );
};

if(localStorage.getItem("darkMode")==="1"){
 $("darkMode").checked = true;
 document.body.classList.add("dark");
}

$("deleteAccountBtn").onclick = async ()=>{

 try{

  const r = await api(
   "/api/delete-account",
   {
    method:"POST",
    body:JSON.stringify({token})
   }
  );

  if(!r.ok){
   const d = await r.json().catch(()=>({}));
   alert(d.error || "تعذر حذف الحساب");
   return;
  }

  shouldReconnect = false;

  if(ws){
   try{ws.close()}catch{}
  }

  clearSession();

  $("settings").classList.add("hidden");

  showAuth();

 }catch{
  alert("تعذر الاتصال بالخادم");
 }
};

$("logoutBtn").onclick = async ()=>{

 try{
  await api(
   "/api/logout",
   {
    method:"POST",
    body:JSON.stringify({token})
   }
  );
 }catch{}

 shouldReconnect = false;

 if(ws){
  try{ws.close()}catch{}
 }

 endCall(false);
 clearSession();
 showAuth();
};

function forceLogout(){

 shouldReconnect = false;

 if(ws){
  try{ws.close()}catch{}
 }

 endCall(false);
 clearSession();
 showAuth();

 setError("انتهت الجلسة، سجل الدخول مرة أخرى");
}

/* =========================
   بداية التطبيق
========================= */

restoreSession();
</script>

</body>
</html>`;

/* =========================
   Worker
========================= */

export default {
 async fetch(request, env){

  const url = new URL(request.url);

  if(request.method === "GET" && url.pathname === "/"){
   return new Response(HTML,{
    headers:{
     "content-type":"text/html;charset=UTF-8",
     "cache-control":"no-store"
    }
   });
  }

  const id =
   env.CHAT.getByName("main");

  if(url.pathname === "/ws"){

   return id.fetch(
    new Request(
     new URL("/websocket" + url.search,url.origin),
     request
    )
   );
  }

  const apiPaths = [
   "/api/register",
   "/api/login",
   "/api/logout",
   "/api/me",
   "/api/users",
   "/api/history",
   "/api/upload",
   "/api/file",
   "/api/delete-account"
  ];

  if(apiPaths.includes(url.pathname)){

   return id.fetch(
    new Request(
     new URL(url.pathname + url.search,url.origin),
     request
    )
   );
  }

  return new Response("Not Found",{status:404});
 }
};

/* =========================
   Durable Object
========================= */

export class Chat extends DurableObject {

 constructor(ctx,env){

  super(ctx,env);

  this.ctx = ctx;
  this.env = env;

  this.sessions = new Map();

  this.ensureSchema();
 }

 sql(){
  return this.ctx.storage.sql;
 }

 columns(table){

  try{
   return this.sql()
    .exec("PRAGMA table_info(" + table + ")")
    .toArray()
    .map(x=>x.name);
  }catch{
   return [];
  }
 }

 ensureSchema(){

  /*
   إنشاء الجداول الأساسية.
   الجداول القديمة لا يتم حذفها تلقائيًا.
  */

  this.sql().exec(`
   CREATE TABLE IF NOT EXISTS accounts(
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT 0,
    last_seen INTEGER NOT NULL DEFAULT 0
   );

   CREATE TABLE IF NOT EXISTS sessions(
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL DEFAULT ${SESSION_FOREVER}
   );

   CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'text',
    file_id TEXT,
    file_name TEXT,
    file_mime TEXT,
    created_at INTEGER NOT NULL,
    edited_at INTEGER,
    deleted_for_all INTEGER NOT NULL DEFAULT 0,
    read_at INTEGER
   );

   CREATE TABLE IF NOT EXISTS files(
    id TEXT PRIMARY KEY,
    owner TEXT NOT NULL,
    receiver TEXT NOT NULL,
    name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at INTEGER NOT NULL
   );
  `);

  this.repairTable("accounts",[
   ["created_at","INTEGER NOT NULL DEFAULT 0"],
   ["last_seen","INTEGER NOT NULL DEFAULT 0"]
  ]);

  this.repairTable("sessions",[
   ["created_at","INTEGER NOT NULL DEFAULT 0"],
   ["expires_at","INTEGER NOT NULL DEFAULT " + SESSION_FOREVER]
  ]);

  this.repairTable("messages",[
   ["file_id","TEXT"],
   ["file_name","TEXT"],
   ["file_mime","TEXT"],
   ["edited_at","INTEGER"],
   ["deleted_for_all","INTEGER NOT NULL DEFAULT 0"],
   ["read_at","INTEGER"]
  ]);

  try{
   this.sql().exec(
    "UPDATE sessions SET expires_at=? WHERE expires_at IS NULL",
    SESSION_FOREVER
   );
  }catch{}

  try{
   this.sql().exec(
    "UPDATE sessions SET created_at=? WHERE created_at IS NULL",
    Date.now()
   );
  }catch{}
 }

 repairTable(table,items){

  const cols = this.columns(table);

  for(const [name,type] of items){

   if(cols.includes(name)) continue;

   try{
    this.sql().exec(
     "ALTER TABLE " + table +
     " ADD COLUMN " + name + " " + type
    );
   }catch{}
  }
 }

 json(data,status=200){

  return new Response(
   JSON.stringify(data),
   {
    status,
    headers:{
     "content-type":"application/json;charset=UTF-8",
     "cache-control":"no-store"
    }
   }
  );
 }

 async fetch(request){

  const url = new URL(request.url);

  try{

   if(url.pathname === "/websocket"){
    return await this.openWebSocket(request);
   }

   if(url.pathname === "/api/register"){
    return await this.register(request);
   }

   if(url.pathname === "/api/login"){
    return await this.login(request);
   }

   if(url.pathname === "/api/logout"){
    return await this.logout(request);
   }

   if(url.pathname === "/api/me"){
    return await this.me(request);
   }

   if(url.pathname === "/api/users"){
    return await this.users(request);
   }

   if(url.pathname === "/api/history"){
    return await this.history(request);
   }

   if(url.pathname === "/api/upload"){
    return await this.upload(request);
   }

   if(url.pathname === "/api/file"){
    return await this.file(request);
   }

   if(url.pathname === "/api/delete-account"){
    return await this.deleteAccount(request);
   }

   return new Response("Not Found",{status:404});

  }catch(e){

   return this.json({
    error:"حدث خطأ في الخادم"
   },500);
  }
 }

 /* =========================
    Password
 ========================= */

 async hashPassword(password,saltBytes){

  const key =
   await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    {name:"PBKDF2"},
    false,
    ["deriveBits"]
   );

  const bits =
   await crypto.subtle.deriveBits(
    {
     name:"PBKDF2",
     salt:saltBytes,
     iterations:PBKDF2_ITERATIONS,
     hash:"SHA-256"
    },
    key,
    256
   );

  return this.hex(new Uint8Array(bits));
 }

 hex(bytes){

  return [...bytes]
   .map(x=>x.toString(16).padStart(2,"0"))
   .join("");
 }

 randomToken(){

  const bytes =
   new Uint8Array(32);

  crypto.getRandomValues(bytes);

  return this.hex(bytes);
 }

 randomSalt(){

  const bytes =
   new Uint8Array(16);

  crypto.getRandomValues(bytes);

  return this.hex(bytes);
 }

 saltBytes(hex){

  const out =
   new Uint8Array(hex.length / 2);

  for(let i=0;i<out.length;i++){
   out[i] =
    parseInt(hex.substr(i*2,2),16);
  }

  return out;
 }

 validUsername(username){

  return /^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/.test(username);
 }

 /* =========================
    Auth
 ========================= */

 async register(request){

  let body;

  try{
   body = await request.json();
  }catch{
   return this.json({
    error:"بيانات غير صحيحة"
   },400);
  }

  const username =
   String(body.username || "").trim();

  const password =
   String(body.password || "");

  if(!this.validUsername(username)){
   return this.json({
    error:"اسم المستخدم غير صالح"
   },400);
  }

  if(password.length < 6){
   return this.json({
    error:"كلمة المرور يجب أن تكون 6 أحرف على الأقل"
   },400);
  }

  try{

   const old =
    this.sql()
     .exec(
      "SELECT username FROM accounts WHERE username=? COLLATE NOCASE LIMIT 1",
      username
     )
     .toArray();

   if(old.length){
    return this.json({
     error:"اسم المستخدم موجود بالفعل"
    },409);
   }

   const salt =
    this.randomSalt();

   const hash =
    await this.hashPassword(
     password,
     this.saltBytes(salt)
    );

   const now = Date.now();

   this.sql().exec(
    `INSERT INTO accounts
     (username,password_hash,salt,created_at,last_seen)
     VALUES(?,?,?,?,?)`,
    username,
    hash,
    salt,
    now,
    now
   );

   const token =
    this.randomToken();

   this.sql().exec(
    `INSERT INTO sessions
     (token,username,created_at,expires_at)
     VALUES(?,?,?,?)`,
    token,
    username,
    now,
    SESSION_FOREVER
   );

   this.broadcastUsers();

   return this.json({
    ok:true,
    token,
    username
   });

  }catch(e){

   const msg = String(e);

   if(msg.toLowerCase().includes("constraint")){
    return this.json({
     error:"اسم المستخدم موجود بالفعل أو بيانات الحساب غير صالحة"
    },409);
   }

   return this.json({
    error:"تعذر إنشاء الحساب"
   },500);
  }
 }

 async login(request){

  let body;

  try{
   body = await request.json();
  }catch{
   return this.json({
    error:"بيانات غير صحيحة"
   },400);
  }

  const username =
   String(body.username || "").trim();

  const password =
   String(body.password || "");

  try{

   const rows =
    this.sql()
     .exec(
      `SELECT username,password_hash,salt
       FROM accounts
       WHERE username=? COLLATE NOCASE
       LIMIT 1`,
      username
     )
     .toArray();

   if(!rows.length){
    return this.json({
     error:"اسم المستخدم أو كلمة المرور غير صحيحة"
    },401);
   }

   const account = rows[0];

   if(!account.salt || !account.password_hash){
    return this.json({
     error:"الحساب القديم غير صالح، أنشئ حسابًا جديدًا"
    },400);
   }

   const hash =
    await this.hashPassword(
     password,
     this.saltBytes(account.salt)
    );

   if(hash !== account.password_hash){
    return this.json({
     error:"اسم المستخدم أو كلمة المرور غير صحيحة"
    },401);
   }

   const token =
    this.randomToken();

   const now = Date.now();

   this.sql().exec(
    `INSERT INTO sessions
     (token,username,created_at,expires_at)
     VALUES(?,?,?,?)`,
    token,
    account.username,
    now,
    SESSION_FOREVER
   );

   this.sql().exec(
    "UPDATE accounts SET last_seen=? WHERE username=?",
    now,
    account.username
   );

   return this.json({
    ok:true,
    token,
    username:account.username
   });

  }catch{

   return this.json({
    error:"تعذر تسجيل الدخول"
   },500);
  }
 }

 async getUser(token){

  if(!token) return null;

  const rows =
   this.sql()
    .exec(
     `SELECT s.username,s.expires_at
      FROM sessions s
      JOIN accounts a
      ON a.username=s.username
      WHERE s.token=?
      LIMIT 1`,
     token
    )
    .toArray();

  if(!rows.length) return null;

  const row = rows[0];

  if(
   row.expires_at &&
   Number(row.expires_at) < Date.now()
  ){
   this.sql().exec(
    "DELETE FROM sessions WHERE token=?",
    token
   );

   return null;
  }

  return row.username;
 }

 async me(request){

  const url = new URL(request.url);

  const username =
   await this.getUser(
    url.searchParams.get("token")
   );

  if(!username){
   return this.json({
    error:"جلسة غير صالحة"
   },401);
  }

  return this.json({
   ok:true,
   username
  });
 }

 async logout(request){

  let body;

  try{
   body = await request.json();
  }catch{
   body = {};
  }

  const token =
   String(body.token || "");

  if(token){

   this.sql().exec(
    "DELETE FROM sessions WHERE token=?",
    token
   );
  }

  return this.json({ok:true});
 }

 /* =========================
    Users
 ========================= */

 async users(request){

  const url = new URL(request.url);

  const current =
   await this.getUser(
    url.searchParams.get("token")
   );

  if(!current){
   return this.json({
    error:"جلسة غير صالحة"
   },401);
  }

  const q =
   String(url.searchParams.get("q") || "")
    .trim()
    .toLowerCase();

  const rows =
   this.sql()
    .exec(
     `SELECT username,last_seen
      FROM accounts
      ORDER BY username COLLATE NOCASE`
    )
    .toArray();

  const online =
   new Set();

  for(const ws of this.ctx.getWebSockets()){

   const data =
    this.sessions.get(ws);

   if(data){
    online.add(data.username);
   }
  }

  const result =
   rows
    .filter(x=>x.username !== current)
    .filter(x=>
     !q ||
     x.username.toLowerCase().includes(q)
    )
    .map(x=>({
     username:x.username,
     online:online.has(x.username),
     last_seen:x.last_seen || 0
    }));

  return this.json({
   users:result
  });
 }

 /* =========================
    History
 ========================= */

 async history(request){

  const url = new URL(request.url);

  const current =
   await this.getUser(
    url.searchParams.get("token")
   );

  if(!current){
   return this.json({
    error:"جلسة غير صالحة"
   },401);
  }

  const other =
   String(url.searchParams.get("user") || "");

  if(!other){
   return this.json({
    messages:[]
   });
  }

  const rows =
   this.sql()
    .exec(
     `SELECT
      id,sender,receiver,text,kind,
      file_id,file_name,file_mime,
      created_at,edited_at,
      deleted_for_all,read_at
      FROM messages
      WHERE
      (sender=? AND receiver=?)
      OR
      (sender=? AND receiver=?)
      ORDER BY id ASC
      LIMIT 500`,
     current,
     other,
     other,
     current
    )
    .toArray();

  try{
   this.sql().exec(
    `UPDATE messages
     SET read_at=?
     WHERE sender=?
     AND receiver=?
     AND read_at IS NULL`,
    Date.now(),
    other,
    current
   );
  }catch{}

  return this.json({
   messages:rows
  });
 }

 /* =========================
    Upload
 ========================= */

 async upload(request){

  const url = new URL(request.url);

  const current =
   await this.getUser(
    url.searchParams.get("token")
   );

  if(!current){
   return this.json({
    error:"جلسة غير صالحة"
   },401);
  }

  const receiver =
   String(url.searchParams.get("to") || "");

  const name =
   String(url.searchParams.get("name") || "file");

  const mime =
   String(
    url.searchParams.get("mime") ||
    "application/octet-stream"
   );

  if(!receiver){
   return this.json({
    error:"لم يتم تحديد المستخدم"
   },400);
  }

  const target =
   this.sql()
    .exec(
     "SELECT username FROM accounts WHERE username=? COLLATE NOCASE LIMIT 1",
     receiver
    )
    .toArray();

  if(!target.length){
   return this.json({
    error:"المستخدم غير موجود"
   },404);
  }

  const body =
   await request.arrayBuffer();

  if(body.byteLength > MAX_FILE_SIZE){
   return this.json({
    error:"حجم الملف أكبر من 20 ميجابايت"
   },413);
  }

  const id =
   this.randomToken();

  const now = Date.now();

  let kind = "file";

  if(mime.startsWith("image/")){
   kind = "image";
  }else if(mime.startsWith("video/")){
   kind = "video";
  }else if(mime.startsWith("audio/")){
   kind = "audio";
  }

  await this.ctx.storage.put(
   "file:" + id,
   body
  );

  this.sql().exec(
   `INSERT INTO files
    (id,owner,receiver,name,mime,size,created_at)
    VALUES(?,?,?,?,?,?,?)`,
   id,
   current,
   receiver,
   name,
   mime,
   body.byteLength,
   now
  );

  const result =
   this.sql()
    .exec(
     `INSERT INTO messages
      (sender,receiver,text,kind,file_id,file_name,file_mime,created_at)
      VALUES(?,?,?,?,?,?,?,?)`,
     current,
     receiver,
     "",
     kind,
     id,
     name,
     mime,
     now
    );

  const messageId =
   Number(result.lastInsertRowId);

  const message = {
   id:messageId,
   sender:current,
   receiver,
   text:"",
   kind,
   file_id:id,
   file_name:name,
   file_mime:mime,
   created_at:now,
   edited_at:null,
   deleted_for_all:0,
   read_at:null
  };

  this.sendToUser(receiver,{
   type:"message",
   message
  });

  this.sendToUser(current,{
   type:"message",
   message
  });

  return this.json({
   ok:true,
   message
  });
 }

 async file(request){

  const url = new URL(request.url);

  const current =
   await this.getUser(
    url.searchParams.get("token")
   );

  if(!current){
   return new Response("Unauthorized",{
    status:401
   });
  }

  const id =
   String(url.searchParams.get("id") || "");

  if(!id){
   return new Response("Not Found",{
    status:404
   });
  }

  const rows =
   this.sql()
    .exec(
     `SELECT id,owner,receiver,name,mime
      FROM files
      WHERE id=?
      LIMIT 1`,
     id
    )
    .toArray();

  if(!rows.length){
   return new Response("Not Found",{
    status:404
   });
  }

  const f = rows[0];

  if(
   f.owner !== current &&
   f.receiver !== current
  ){
   return new Response("Forbidden",{
    status:403
   });
  }

  const data =
   await this.ctx.storage.get(
    "file:" + id,
    "arrayBuffer"
   );

  if(!data){
   return new Response("Not Found",{
    status:404
   });
  }

  return new Response(data,{
   headers:{
    "content-type":f.mime,
    "content-length":String(data.byteLength),
    "content-disposition":
     'inline; filename="' +
     f.name.replace(/["\\\\]/g,"_") +
     '"',
    "cache-control":"private, max-age=3600"
   }
  });
 }

 /* =========================
    Delete Account
 ========================= */

 async deleteAccount(request){

  let body;

  try{
   body = await request.json();
  }catch{
   body = {};
  }

  const username =
   await this.getUser(
    String(body.token || "")
   );

  if(!username){
   return this.json({
    error:"جلسة غير صالحة"
   },401);
  }

  const files =
   this.sql()
    .exec(
     `SELECT file_id
      FROM messages
      WHERE sender=? OR receiver=?`,
     username,
     username
    )
    .toArray();

  for(const f of files){

   if(f.file_id){
    try{
     await this.ctx.storage.delete(
      "file:" + f.file_id
     );
    }catch{}
   }
  }

  this.sql().exec(
   "DELETE FROM sessions WHERE username=?",
   username
  );

  this.sql().exec(
   "DELETE FROM messages WHERE sender=? OR receiver=?",
   username,
   username
  );

  this.sql().exec(
   "DELETE FROM files WHERE owner=? OR receiver=?",
   username,
   username
  );

  this.sql().exec(
   "DELETE FROM accounts WHERE username=?",
   username
  );

  for(const ws of this.ctx.getWebSockets()){

   const data =
    this.sessions.get(ws);

   if(data && data.username === username){

    this.sessions.delete(ws);

    try{
     ws.close(1000,"account deleted");
    }catch{}
   }
  }

  this.broadcastUsers();

  return this.json({
   ok:true
  });
 }

 /* =========================
    WebSocket
 ========================= */

 async openWebSocket(request){

  const url = new URL(request.url);

  const token =
   url.searchParams.get("token");

  const username =
   await this.getUser(token);

  if(!username){
   return new Response("Unauthorized",{
    status:401
   });
  }

  const pair =
   new WebSocketPair();

  const client = pair[0];
  const server = pair[1];

  this.ctx.acceptWebSocket(server);

  this.sessions.set(server,{
   username,
   token
  });

  this.sql().exec(
   "UPDATE accounts SET last_seen=? WHERE username=?",
   Date.now(),
   username
  );

  server.send(JSON.stringify({
   type:"connected",
   username
  }));

  this.broadcastUsers();

  return new Response(null,{
   status:101,
   webSocket:client
  });
 }

 sendToUser(username,data){

  const text =
   JSON.stringify(data);

  for(const ws of this.ctx.getWebSockets()){

   const session =
    this.sessions.get(ws);

   if(
    session &&
    session.username === username
   ){

    try{
     ws.send(text);
    }catch{}
   }
  }
 }

 broadcastUsers(){

  const online = new Set();

  for(const ws of this.ctx.getWebSockets()){

   const s =
    this.sessions.get(ws);

   if(s){
    online.add(s.username);
   }
  }

  const rows =
   this.sql()
    .exec(
     "SELECT username,last_seen FROM accounts ORDER BY username COLLATE NOCASE"
    )
    .toArray();

  const users =
   rows.map(x=>({
    username:x.username,
    online:online.has(x.username),
    last_seen:x.last_seen || 0
   }));

  const payload =
   JSON.stringify({
    type:"users",
    users
   });

  for(const ws of this.ctx.getWebSockets()){

   try{
    ws.send(payload);
   }catch{}
  }
 }

 webSocketMessage(ws,message){

  const session =
   this.sessions.get(ws);

  if(!session) return;

  let data;

  try{
   data =
    JSON.parse(message);
  }catch{
   return;
  }

  const username =
   session.username;

  /* رسالة نصية */

  if(data.type === "message"){

   const to =
    String(data.to || "");

   const text =
    String(data.text || "").trim();

   if(!to || !text) return;

   const target =
    this.sql()
     .exec(
      "SELECT username FROM accounts WHERE username=? COLLATE NOCASE LIMIT 1",
      to
     )
     .toArray();

   if(!target.length) return;

   const now = Date.now();

   const result =
    this.sql()
     .exec(
      `INSERT INTO messages
       (sender,receiver,text,kind,created_at)
       VALUES(?,?,?,?,?)`,
      username,
      to,
      text,
      "text",
      now
     );

   const id =
    Number(result.lastInsertRowId);

   const msg = {
    id,
    sender:username,
    receiver:to,
    text,
    kind:"text",
    file_id:null,
    file_name:null,
    file_mime:null,
    created_at:now,
    edited_at:null,
    deleted_for_all:0,
    read_at:null
   };

   this.sendToUser(to,{
    type:"message",
    message:msg
   });

   this.sendToUser(username,{
    type:"message",
    message:msg
   });

   return;
  }

  /* الكتابة */

  if(data.type === "typing"){

   if(data.to){

    this.sendToUser(
     String(data.to),
     {
      type:"typing",
      from:username,
      value:!!data.value
     }
    );
   }

   return;
  }

  /* قراءة الرسالة */

  if(data.type === "read"){

   const id =
    Number(data.id || 0);

   if(id){

    this.sql().exec(
     `UPDATE messages
      SET read_at=?
      WHERE id=?
      AND receiver=?`,
     Date.now(),
     id,
     username
    );
   }

   return;
  }

  /* تعديل رسالة */

  if(data.type === "edit"){

   const id =
    Number(data.id || 0);

   const text =
    String(data.text || "").trim();

   if(!id || !text) return;

   const rows =
    this.sql()
     .exec(
      `SELECT sender,receiver
       FROM messages
       WHERE id=?
       LIMIT 1`,
      id
     )
     .toArray();

   if(!rows.length) return;

   const m = rows[0];

   if(m.sender !== username) return;

   this.sql().exec(
    `UPDATE messages
     SET text=?,edited_at=?
     WHERE id=?`,
    text,
    Date.now(),
    id
   );

   this.sendToUser(m.receiver,{
    type:"message_edited",
    id,
    text
   });

   this.sendToUser(username,{
    type:"message_edited",
    id,
    text
   });

   return;
  }

  /* حذف رسالة */

  if(data.type === "delete"){

   const id =
    Number(data.id || 0);

   if(!id) return;

   const rows =
    this.sql()
     .exec(
      `SELECT sender,receiver,file_id
       FROM messages
       WHERE id=?
       LIMIT 1`,
      id
     )
     .toArray();

   if(!rows.length) return;

   const m = rows[0];

   if(
    m.sender !== username &&
    m.receiver !== username
   ) return;

   this.sql().exec(
    `UPDATE messages
     SET deleted_for_all=1,
         text='',
         edited_at=?
     WHERE id=?`,
    Date.now(),
    id
   );

   if(m.file_id){

    try{
     await this.ctx.storage.delete(
      "file:" + m.file_id
     );
    }catch{}

    try{
     this.sql().exec(
      "DELETE FROM files WHERE id=?",
      m.file_id
     );
    }catch{}
   }

   this.sendToUser(m.sender,{
    type:"message_deleted",
    id
   });

   this.sendToUser(m.receiver,{
    type:"message_deleted",
    id
   });

   return;
  }

  /* المكالمات والـ WebRTC */

  if(data.type === "signal"){

   const to =
    String(data.to || "");

   if(!to || !data.signal) return;

   this.sendToUser(to,{
    type:"signal",
    from:username,
    signal:data.signal
   });

   return;
  }
 }

 webSocketClose(ws){

  const session =
   this.sessions.get(ws);

  this.sessions.delete(ws);

  if(session){

   try{
    this.sql().exec(
     "UPDATE accounts SET last_seen=? WHERE username=?",
     Date.now(),
     session.username
    );
   }catch{}
  }

  this.broadcastUsers();
 }

 webSocketError(ws){

  this.webSocketClose(ws);
 }
}
