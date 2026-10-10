import { DurableObject } from "cloudflare:workers";

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
*{
  box-sizing:border-box;
}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#e5ddd5;
}

button,
input{
  font:inherit;
}

button{
  cursor:pointer;
}

.hidden{
  display:none!important;
}

#auth{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:#e5ddd5;
}

.auth-box{
  width:100%;
  max-width:400px;
  background:#fff;
  border-radius:16px;
  padding:25px;
  box-shadow:0 8px 30px #0002;
}

.auth-box h2{
  margin-top:0;
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

.auth-box input:focus{
  border-color:#128c7e;
}

.auth-box button{
  width:100%;
  padding:13px;
  margin-top:8px;
  border:0;
  border-radius:10px;
  background:#128c7e;
  color:#fff;
}

.switch{
  text-align:center;
  margin-top:15px;
  color:#075e54;
  cursor:pointer;
}

#error{
  color:#c00;
  text-align:center;
  min-height:22px;
  margin-top:8px;
}

#app{
  height:100vh;
  display:none;
}

.layout{
  display:flex;
  height:100%;
}

.sidebar{
  width:300px;
  background:#fff;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

.side-header{
  background:#075e54;
  color:#fff;
  padding:14px;
}

.side-title{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}

.side-title h3{
  margin:0;
}

#logoutBtn{
  border:0;
  background:#fff2;
  color:#fff;
  border-radius:8px;
  padding:7px 10px;
}

#search{
  width:100%;
  margin-top:10px;
  padding:10px;
  border:0;
  border-radius:8px;
  outline:none;
}

#users{
  overflow:auto;
  flex:1;
}

.user{
  padding:12px;
  border-bottom:1px solid #eee;
  display:flex;
  align-items:center;
  gap:10px;
  cursor:pointer;
}

.user:hover{
  background:#f5f5f5;
}

.user.active{
  background:#e8f5e9;
}

.avatar{
  width:44px;
  height:44px;
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
  min-width:0;
  flex:1;
}

.user-name{
  font-weight:bold;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.user-status{
  font-size:12px;
  color:#777;
  margin-top:4px;
}

.online-dot,
.offline-dot{
  width:9px;
  height:9px;
  border-radius:50%;
  display:inline-block;
  margin-left:5px;
}

.online-dot{
  background:#25d366;
}

.offline-dot{
  background:#aaa;
}

.chat{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
}

.chat-header{
  background:#075e54;
  color:#fff;
  padding:10px 14px;
  display:flex;
  align-items:center;
  gap:10px;
}

#chatAvatar{
  width:42px;
  height:42px;
  border-radius:50%;
  background:#128c7e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:bold;
}

#chatTitle{
  font-weight:bold;
}

#typing{
  font-size:12px;
  opacity:.8;
  margin-top:3px;
}

#messages{
  flex:1;
  overflow:auto;
  padding:15px;
  background:#e5ddd5;
}

.empty{
  text-align:center;
  color:#777;
  margin-top:40px;
}

.msg{
  max-width:75%;
  padding:8px 10px;
  border-radius:10px;
  margin:5px 0;
  clear:both;
  word-break:break-word;
}

.msg.me{
  float:right;
  background:#dcf8c6;
  border-top-right-radius:2px;
}

.msg.other{
  float:left;
  background:#fff;
  border-top-left-radius:2px;
}

.msg-time{
  font-size:10px;
  color:#777;
  margin-top:4px;
}

.msg-actions{
  display:flex;
  gap:5px;
  margin-top:5px;
}

.msg-actions button{
  border:0;
  background:#0001;
  border-radius:5px;
  padding:3px 6px;
  font-size:11px;
}

.file-link{
  display:block;
  color:#075e54;
  text-decoration:none;
  font-weight:bold;
  margin-top:4px;
}

.audio{
  max-width:100%;
}

.composer{
  background:#f0f0f0;
  padding:8px;
  display:flex;
  gap:7px;
  align-items:center;
}

.composer input[type=text]{
  flex:1;
  min-width:0;
  border:0;
  border-radius:20px;
  padding:12px 15px;
  outline:none;
}

.icon-btn{
  width:44px;
  height:44px;
  border:0;
  border-radius:50%;
  background:#fff;
}

.send-btn{
  background:#128c7e;
  color:#fff;
}

.recording{
  background:#d32f2f!important;
  color:#fff;
}

.call-btn{
  background:#fff2;
  color:#fff;
  border:0;
  padding:7px;
  border-radius:8px;
}

#callBox{
  position:fixed;
  inset:0;
  background:#000c;
  z-index:50;
  display:none;
  align-items:center;
  justify-content:center;
}

.call-inner{
  position:relative;
  width:min(50vw,900px);
  max-height:90vh;
  overflow:auto;
  background:#111;
  border-radius:15px;
  padding:12px;
  color:#fff;
}

#remoteVideo{
  display:block;
  width:100%;
  height:50vh;
  min-height:240px;
  max-height:65vh;
  object-fit:contain;
  background:#000;
  border-radius:10px;
}

#localVideo{
  position:absolute;
  width:clamp(100px,14vw,180px);
  height:clamp(75px,11vw,135px);
  right:22px;
  bottom:100px;
  object-fit:cover;
  background:#000;
  border:2px solid #fff;
  border-radius:8px;
  z-index:2;
}

@media(max-width:700px){
  .call-inner{width:95vw;padding:10px;}
  #remoteVideo{height:45vh;min-height:200px;}
  #localVideo{width:112px;height:84px;right:16px;bottom:105px;}
}

.call-controls{
  display:flex;
  justify-content:center;
  gap:10px;
  margin-top:10px;
}

.call-controls button{
  border:0;
  border-radius:9px;
  padding:10px 15px;
}

#settings{
  position:fixed;
  inset:0;
  background:#0008;
  z-index:40;
  display:none;
  align-items:center;
  justify-content:center;
}

.settings-box{
  width:min(420px,94vw);
  background:#fff;
  border-radius:15px;
  padding:20px;
}

.settings-box button{
  width:100%;
  padding:11px;
  margin-top:8px;
  border:0;
  border-radius:9px;
  background:#128c7e;
  color:#fff;
}

.dark body{
  background:#111;
}

.dark .sidebar,
.dark .auth-box,
.dark .settings-box{
  background:#202020;
  color:#fff;
}

.dark #messages{
  background:#111;
}

.dark .msg.other{
  background:#222;
  color:#fff;
}

.dark .composer{
  background:#222;
}

.dark .composer input[type=text],
.dark #search{
  background:#333;
  color:#fff;
}

@media(max-width:700px){
  .sidebar{
    width:180px;
  }
}

@media(max-width:430px){
  .sidebar{
    width:155px;
  }

  .msg{
    max-width:85%;
  }

  .chat-header{
    padding:8px;
  }
}
</style>
</head>

<body>

<div id="auth">
  <div class="auth-box">
    <h2 id="authTitle">إنشاء حساب</h2>

    <input
      id="username"
      type="text"
      autocomplete="username"
      placeholder="اسم المستخدم"
    >

    <input
      id="password"
      type="password"
      autocomplete="current-password"
      placeholder="كلمة المرور"
    >

    <button id="authButton">إنشاء الحساب</button>

    <div id="switchAuth" class="switch">
      عندك حساب؟ تسجيل الدخول
    </div>

    <div id="error"></div>
  </div>
</div>

<div id="app">

  <div class="layout">

    <aside class="sidebar">

      <div class="side-header">

        <div class="side-title">
          <h3>المستخدمون</h3>

          <button id="logoutBtn">
            خروج
          </button>
        </div>

        <input
          id="search"
          type="text"
          placeholder="بحث عن مستخدم..."
        >

      </div>

      <div id="users"></div>

    </aside>

    <main class="chat">

      <div class="chat-header">

        <div id="chatAvatar">?</div>

        <div style="flex:1">
          <div id="chatTitle">اختر مستخدمًا</div>
          <div id="typing"></div>
        </div>

        <button
          id="audioCallBtn"
          class="call-btn"
          title="مكالمة صوتية"
        >
          📞
        </button>

        <button
          id="videoCallBtn"
          class="call-btn"
          title="مكالمة فيديو"
        >
          📹
        </button>

        <button
          id="settingsBtn"
          class="call-btn"
          title="الإعدادات"
        >
          ⚙️
        </button>

      </div>

      <div id="messages">
        <div class="empty">
          اختر مستخدمًا لبدء المحادثة
        </div>
      </div>

      <div class="composer">

        <input
          id="fileInput"
          type="file"
          style="display:none"
        >

        <button
          id="fileBtn"
          class="icon-btn"
          title="إرسال ملف"
        >
          📎
        </button>

        <button
          id="recordBtn"
          class="icon-btn"
          title="تسجيل صوتي"
        >
          🎙️
        </button>

        <input
          id="messageInput"
          type="text"
          placeholder="اكتب رسالة..."
          autocomplete="off"
        >

        <button
          id="sendBtn"
          class="icon-btn send-btn"
        >
          ➤
        </button>

      </div>

    </main>

  </div>

</div>

<div id="settings">

  <div class="settings-box">

    <h3>الإعدادات</h3>

    <button id="deleteAccountBtn">
      حذف الحساب
    </button>

    <button id="closeSettings">
      إغلاق
    </button>

  </div>

</div>

<div id="callBox">

  <div class="call-inner">

    <video
      id="remoteVideo"
      autoplay
      playsinline
    ></video>

    <video
      id="localVideo"
      autoplay
      muted
      playsinline
    ></video>

    <div id="callStatus">
      جاري الاتصال...
    </div>

    <div class="call-controls">

      <button id="acceptCall">
        قبول
      </button>

      <button id="rejectCall">
        رفض
      </button>

      <button id="hangupCall">
        إنهاء
      </button>

    </div>

  </div>

</div>

<script>

let token = localStorage.getItem("chatToken") || "";
let currentUser = localStorage.getItem("chatUser") || "";
let selectedUser = "";
let ws = null;
let reconnectTimer = null;
let typingTimer = null;
let registerMode = true;

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

let peerConnection = null;
let localStream = null;
let incomingCall = null;
let pendingOffer = null;
let pendingIceCandidates = [];
let activeCallUser = null;

const auth = document.getElementById("auth");
const app = document.getElementById("app");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const authButton = document.getElementById("authButton");
const switchAuth = document.getElementById("switchAuth");
const authTitle = document.getElementById("authTitle");
const errorBox = document.getElementById("error");

const usersBox = document.getElementById("users");
const searchInput = document.getElementById("search");

const chatTitle = document.getElementById("chatTitle");
const chatAvatar = document.getElementById("chatAvatar");
const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const fileInput = document.getElementById("fileInput");
const fileBtn = document.getElementById("fileBtn");

const recordBtn = document.getElementById("recordBtn");

const typingBox = document.getElementById("typing");

const logoutBtn = document.getElementById("logoutBtn");

const settings = document.getElementById("settings");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

const audioCallBtn = document.getElementById("audioCallBtn");
const videoCallBtn = document.getElementById("videoCallBtn");

const callBox = document.getElementById("callBox");
const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
const callStatus = document.getElementById("callStatus");

const acceptCall = document.getElementById("acceptCall");
const rejectCall = document.getElementById("rejectCall");
const hangupCall = document.getElementById("hangupCall");

function showError(message){
  errorBox.textContent = message || "";
}

function saveSession(t, u){
  token = t || "";
  currentUser = u || "";

  if(token){
    localStorage.setItem("chatToken", token);
  }

  if(currentUser){
    localStorage.setItem("chatUser", currentUser);
  }
}

function clearSession(){
  token = "";
  currentUser = "";
  selectedUser = "";

  localStorage.removeItem("chatToken");
  localStorage.removeItem("chatUser");
}

function showAuth(){
  auth.style.display = "flex";
  app.style.display = "none";
}

function showApp(){
  auth.style.display = "none";
  app.style.display = "block";
}

function initials(name){
  if(!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function formatTime(timestamp){
  try{
    return new Date(timestamp).toLocaleTimeString(
      "ar-EG",
      {
        hour:"2-digit",
        minute:"2-digit"
      }
    );
  }catch{
    return "";
  }
}

async function api(path, options = {}){
  const response = await fetch(
    path,
    {
      ...options,
      cache:"no-store",
      headers:{
        ...(options.body instanceof FormData
          ? {}
          : {"Content-Type":"application/json"}),
        ...(options.headers || {})
      }
    }
  );

  let data = null;

  try{
    data = await response.json();
  }catch{
    data = null;
  }

  if(!response.ok){
    throw new Error(
      data?.error ||
      "حدث خطأ في الخادم"
    );
  }

  return data;
}

switchAuth.onclick = () => {

  registerMode = !registerMode;

  if(registerMode){
    authTitle.textContent = "إنشاء حساب";
    authButton.textContent = "إنشاء الحساب";
    switchAuth.textContent = "عندك حساب؟ تسجيل الدخول";
    passwordInput.autocomplete = "new-password";
  }else{
    authTitle.textContent = "تسجيل الدخول";
    authButton.textContent = "تسجيل الدخول";
    switchAuth.textContent = "ليس لديك حساب؟ إنشاء حساب";
    passwordInput.autocomplete = "current-password";
  }

  showError("");
};

authButton.onclick = async () => {

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if(!username || !password){
    showError("اكتب اسم المستخدم وكلمة المرور");
    return;
  }

  if(username.length < 3){
    showError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
    return;
  }

  if(password.length < 4){
    showError("كلمة المرور قصيرة جدًا");
    return;
  }

  authButton.disabled = true;
  showError("");

  try{

    const endpoint = registerMode
      ? "/api/register"
      : "/api/login";

    const data = await api(
      endpoint,
      {
        method:"POST",
        body:JSON.stringify({
          username,
          password
        })
      }
    );

    saveSession(
      data.token,
      data.username || username
    );

    usernameInput.value = "";
    passwordInput.value = "";

    showApp();

    await loadUsers();
    connectWS();

  }catch(error){

    showError(
      error.message ||
      "تعذر تنفيذ العملية"
    );

  }finally{
    authButton.disabled = false;
  }
};

async function restoreSession(){

  if(!token){
    showAuth();
    return;
  }

  try{

    const data = await api(
      "/api/me?token=" +
      encodeURIComponent(token)
    );

    if(!data?.username){
      throw new Error("جلسة غير صالحة");
    }

    currentUser = data.username;

    localStorage.setItem(
      "chatUser",
      currentUser
    );

    showApp();

    await loadUsers();
    connectWS();

  }catch{

    clearSession();
    showAuth();

  }
}

async function loadUsers(){

  if(!token) return;

  try{

    const data = await api(
      "/api/users?token=" +
      encodeURIComponent(token)
    );

    renderUsers(
      Array.isArray(data)
        ? data
        : (data.users || [])
    );

  }catch(error){

    if(error.message === "Unauthorized"){
      clearSession();
      showAuth();
      return;
    }

    console.error(error);

  }
}

function renderUsers(list){

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  usersBox.innerHTML = "";

  const filtered = list
    .filter(
      user =>
        user.username !== currentUser
    )
    .filter(
      user =>
        !query ||
        user.username
          .toLowerCase()
          .includes(query)
    );

  if(!filtered.length){

    usersBox.innerHTML =
      '<div class="empty">لا يوجد مستخدمون</div>';

    return;
  }

  for(const user of filtered){

    const item = document.createElement("div");

    item.className =
      "user" +
      (
        selectedUser === user.username
          ? " active"
          : ""
      );

    const online =
      !!user.online;

    item.innerHTML = \`
      <div class="avatar">
        \${escapeHtml(initials(user.username))}
      </div>

      <div class="user-info">

        <div class="user-name">
          \${escapeHtml(user.username)}
        </div>

        <div class="user-status">

          <span class="\${online ? "online-dot" : "offline-dot"}"></span>

          \${online ? "متصل الآن" : "غير متصل"}

        </div>

      </div>
    \`;

    item.onclick = () => {
      selectUser(user.username);
    };

    usersBox.appendChild(item);
  }
}

searchInput.oninput = () => {
  loadUsers();
};

// Keep online/offline indicators fresh even if a WebSocket presence
// notification was missed by a temporarily disconnected browser.
setInterval(() => {
  if(token && !document.hidden) loadUsers();
}, 5000);

document.addEventListener("visibilitychange", () => {
  if(!document.hidden && token) {
    connectWS();
    loadUsers();
  }
});

window.addEventListener("online", () => {
  if(token) connectWS();
});

async function selectUser(username){

  selectedUser = username;

  chatTitle.textContent = username;
  chatAvatar.textContent = initials(username);

  await loadHistory();

  renderUserSelection();

  messageInput.focus();
}

function renderUserSelection(){

  document
    .querySelectorAll(".user")
    .forEach(el => {

      const name =
        el.querySelector(".user-name")
          ?.textContent
          ?.trim();

      el.classList.toggle(
        "active",
        name === selectedUser
      );
    });
}

async function loadHistory(){

  if(!selectedUser){
    return;
  }

  try{

    const data = await api(
      "/api/history?token=" +
      encodeURIComponent(token) +
      "&with=" +
      encodeURIComponent(selectedUser)
    );

    const list =
      Array.isArray(data)
        ? data
        : (data.messages || []);

    renderMessages(list);

  }catch(error){

    console.error(error);

    messagesBox.innerHTML =
      '<div class="empty">تعذر تحميل المحادثة</div>';
  }
}

function renderMessages(list){

  messagesBox.innerHTML = "";

  if(!list.length){

    messagesBox.innerHTML =
      '<div class="empty">لا توجد رسائل بعد</div>';

    return;
  }

  for(const msg of list){
    appendMessage(msg,false);
  }

  scrollMessages();
}

function appendMessage(msg, scroll = true){

  const wrapper =
    document.createElement("div");

  const mine =
    msg.sender === currentUser;

  wrapper.className =
    "msg " +
    (mine ? "me" : "other");

  wrapper.dataset.id =
    String(msg.id || "");

  let content = "";

  if(msg.text){

    content +=
      '<div class="message-text">' +
      escapeHtml(msg.text)
        .replaceAll("\\n","<br>") +
      "</div>";
  }

  if(msg.file_id){

    const url =
      "/api/file?token=" +
      encodeURIComponent(token) +
      "&id=" +
      encodeURIComponent(msg.file_id);

    if(
      msg.mime &&
      msg.mime.startsWith("audio/")
    ){

      content += \`
        <audio
          class="audio"
          controls
          src="\${url}"
        ></audio>
      \`;

    }else if(
      msg.mime &&
      msg.mime.startsWith("image/")
    ){

      content += \`
        <img
          src="\${url}"
          style="max-width:100%;border-radius:8px;margin-top:5px"
          alt=""
        >
      \`;

    }else{

      content += \`
        <a
          class="file-link"
          href="\${url}"
          target="_blank"
        >
          📎 \${escapeHtml(msg.file_name || "ملف")}
        </a>
      \`;
    }
  }

  const time =
    msg.created_at
      ? formatTime(msg.created_at)
      : "";

  content += \`
    <div class="msg-time">
      \${time}
    </div>
  \`;

  if(mine){

    content += \`
      <div class="msg-actions">

        <button
          data-action="edit"
        >
          تعديل
        </button>

        <button
          data-action="delete"
        >
          حذف
        </button>

        <button
          data-action="forward"
        >
          تحويل
        </button>

      </div>
    \`;
  }

  wrapper.innerHTML = content;

  const edit =
    wrapper.querySelector('[data-action="edit"]');

  const del =
    wrapper.querySelector('[data-action="delete"]');

  const forward =
    wrapper.querySelector('[data-action="forward"]');

  if(edit){

    edit.onclick = () => {

      const text =
        prompt(
          "اكتب الرسالة الجديدة",
          msg.text || ""
        );

      if(
        text !== null &&
        text.trim()
      ){

        sendWS({
          type:"edit",
          id:msg.id,
          text:text.trim()
        });
      }
    };
  }

  if(del){

    del.onclick = () => {

      if(
        confirm("هل تريد حذف الرسالة؟")
      ){

        sendWS({
          type:"delete",
          id:msg.id
        });
      }
    };
  }

  if(forward){

    forward.onclick = () => {

      const to =
        prompt(
          "اكتب اسم المستخدم الذي تريد التحويل إليه"
        );

      if(to){

        sendWS({
          type:"forward",
          id:msg.id,
          to:to.trim()
        });
      }
    };
  }

  messagesBox.appendChild(wrapper);

  if(scroll){
    scrollMessages();
  }
}

function scrollMessages(){

  messagesBox.scrollTop =
    messagesBox.scrollHeight;
}

function sendWS(data){

  if(
    !ws ||
    ws.readyState !== WebSocket.OPEN
  ){

    connectWS();

    setTimeout(
      () => sendWS(data),
      500
    );

    return;
  }

  ws.send(
    JSON.stringify(data)
  );
}

function connectWS(){

  if(!token) return;

  if(
    ws &&
    (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    )
  ){
    return;
  }

  if(reconnectTimer){
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const protocol =
    location.protocol === "https:"
      ? "wss:"
      : "ws:";

  ws = new WebSocket(
    protocol +
    "//" +
    location.host +
    "/ws?token=" +
    encodeURIComponent(token)
  );

  ws.onopen = () => {
    loadUsers();
    // Notify the room that this session is active and refresh presence.
    sendWS({type:"presence"});
  };

  ws.onmessage = event => {

    try{

      const data =
        JSON.parse(event.data);

      handleWSMessage(data);

    }catch(error){

      console.error(error);

    }
  };

  ws.onclose = () => {

    ws = null;

    if(token){

      reconnectTimer =
        setTimeout(
          connectWS,
          1500
        );
    }
  };

  ws.onerror = () => {

    try{
      ws.close();
    }catch{}

  };
}

function handleWSMessage(data){

  if(data.type === "message"){

    if(
      data.sender === selectedUser ||
      data.receiver === selectedUser
    ){

      appendMessage(
        data,
        true
      );
    }

    loadUsers();
    return;
  }

  if(data.type === "history"){

    if(data.with === selectedUser){

      renderMessages(
        data.messages || []
      );
    }

    return;
  }

  if(data.type === "users"){

    renderUsers(
      data.users || []
    );

    return;
  }

  if(data.type === "typing"){

    if(data.from === selectedUser){

      typingBox.textContent =
        data.value
          ? "يكتب الآن..."
          : "";
    }

    return;
  }

  if(data.type === "edited"){

    if(
      data.sender === currentUser ||
      data.receiver === currentUser
    ){

      loadHistory();
    }

    return;
  }

  if(data.type === "deleted"){

    loadHistory();
    return;
  }

  if(data.type === "forwarded"){

    if(
      data.sender === currentUser ||
      data.receiver === currentUser
    ){

      loadHistory();
    }

    return;
  }

  if(data.type === "call-offer"){

    incomingCall = {
      from:data.from,
      video:!!data.video
    };

    pendingOffer = data.offer;

    callStatus.textContent =
      (
        data.video
          ? "📹"
          : "📞"
      ) +
      " مكالمة واردة من " +
      data.from;

    callBox.style.display = "flex";

    return;
  }

  if(data.type === "call-answer"){

    if(peerConnection){

      peerConnection
        .setRemoteDescription(
          new RTCSessionDescription(
            data.answer
          )
        )
        .then(
          flushPendingIceCandidates
        )
        .catch(console.error);
    }

    return;
  }

  if(data.type === "ice"){

    if(data.candidate){

      if(
        peerConnection &&
        peerConnection.remoteDescription
      ){

        peerConnection
          .addIceCandidate(
            new RTCIceCandidate(
              data.candidate
            )
          )
          .catch(console.error);

      }else{

        pendingIceCandidates.push(
          data.candidate
        );
      }
    }

    return;
  }

  if(data.type === "call-end"){

    closeCall();
    return;
  }
}

sendBtn.onclick = sendText;

messageInput.onkeydown = event => {

  if(event.key === "Enter"){
    event.preventDefault();
    sendText();
  }
};

messageInput.oninput = () => {

  if(!selectedUser){
    return;
  }

  sendWS({
    type:"typing",
    to:selectedUser,
    value:true
  });

  clearTimeout(typingTimer);

  typingTimer =
    setTimeout(() => {

      sendWS({
        type:"typing",
        to:selectedUser,
        value:false
      });

    },700);
};

function sendText(){

  const text =
    messageInput.value.trim();

  if(!text || !selectedUser){
    return;
  }

  sendWS({
    type:"message",
    to:selectedUser,
    text
  });

  messageInput.value = "";

  sendWS({
    type:"typing",
    to:selectedUser,
    value:false
  });
}

fileBtn.onclick = () => {

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    return;
  }

  fileInput.click();
};

fileInput.onchange = async () => {

  const file =
    fileInput.files?.[0];

  if(!file){
    return;
  }

  if(file.size > 20 * 1024 * 1024){

    alert("حجم الملف أكبر من 20 ميجابايت");
    fileInput.value = "";
    return;
  }

  try{

    const form =
      new FormData();

    form.append("token",token);
    form.append("receiver",selectedUser);
    form.append("file",file);

    const response =
      await fetch(
        "/api/upload",
        {
          method:"POST",
          body:form,
          cache:"no-store"
        }
      );

    const data =
      await response.json();

    if(!response.ok){

      throw new Error(
        data.error ||
        "فشل رفع الملف"
      );
    }

    loadHistory();

  }catch(error){

    alert(
      error.message ||
      "فشل رفع الملف"
    );

  }finally{

    fileInput.value = "";
  }
};

recordBtn.onclick = async () => {

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    return;
  }

  if(isRecording){

    try{
      mediaRecorder.stop();
    }catch{}

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

    mediaRecorder.ondataavailable =
      event => {

        if(event.data.size){
          audioChunks.push(event.data);
        }
      };

    mediaRecorder.onstop =
      async () => {

        isRecording = false;
        recordBtn.classList.remove("recording");
        recordBtn.textContent = "🎙️";

        stream
          .getTracks()
          .forEach(track => track.stop());

        const blob =
          new Blob(
            audioChunks,
            {
              type:
                mediaRecorder.mimeType ||
                "audio/webm"
            }
          );

        if(!blob.size){
          return;
        }

        try{

          const form =
            new FormData();

          form.append("token",token);
          form.append("receiver",selectedUser);

          form.append(
            "file",
            blob,
            "voice.webm"
          );

          const response =
            await fetch(
              "/api/upload",
              {
                method:"POST",
                body:form,
                cache:"no-store"
              }
            );

          const data =
            await response.json();

          if(!response.ok){

            throw new Error(
              data.error ||
              "فشل إرسال التسجيل"
            );
          }

          loadHistory();

        }catch(error){

          alert(
            error.message ||
            "فشل إرسال التسجيل"
          );
        }
      };

    mediaRecorder.start();

    isRecording = true;

    recordBtn.classList.add("recording");
    recordBtn.textContent = "⏹️";

  }catch(error){

    alert(
      "تعذر استخدام الميكروفون: " +
      (
        error.message ||
        "غير متاح"
      )
    );
  }
};

logoutBtn.onclick = async () => {

  try{

    if(token){

      await api(
        "/api/logout",
        {
          method:"POST",
          body:JSON.stringify({
            token
          })
        }
      );
    }

  }catch{}

  try{
    ws?.close();
  }catch{}

  ws = null;

  clearSession();

  showAuth();
};

settingsBtn.onclick = () => {
  settings.style.display = "flex";
};

closeSettings.onclick = () => {
  settings.style.display = "none";
};

deleteAccountBtn.onclick = async () => {

  const ok =
    confirm(
      "هل أنت متأكد من حذف الحساب؟"
    );

  if(!ok){
    return;
  }

  try{

    await api(
      "/api/delete-account",
      {
        method:"POST",
        body:JSON.stringify({
          token
        })
      }
    );

    try{
      ws?.close();
    }catch{}

    clearSession();
    settings.style.display = "none";
    showAuth();

  }catch(error){

    alert(
      error.message ||
      "تعذر حذف الحساب"
    );
  }
};

async function createPeer(video){

  pendingIceCandidates = [];

  peerConnection =
    new RTCPeerConnection({
      iceServers:[
        { urls:"stun:stun.l.google.com:19302" },
        { urls:"stun:stun1.l.google.com:19302" },
        { urls:"stun:stun2.l.google.com:19302" },
        { urls:"stun:stun3.l.google.com:19302" }
      ]
    });

  peerConnection.onicecandidate =
    event => {

      if(
        event.candidate &&
        activeCallUser
      ){

        sendWS({
          type:"ice",
          to:activeCallUser,
          candidate:event.candidate
        });
      }
    };

  const remoteStream = new MediaStream();

  peerConnection.ontrack = event => {
    // Keep a combined remote stream so audio and video tracks both remain attached.
    const incomingStream = event.streams && event.streams[0];
    if(incomingStream){
      for(const track of incomingStream.getTracks()){
        if(!remoteStream.getTracks().some(existing => existing.id === track.id)){
          remoteStream.addTrack(track);
        }
      }
    } else if(event.track && !remoteStream.getTracks().some(track => track.id === event.track.id)){
      remoteStream.addTrack(event.track);
    }

    remoteVideo.srcObject = remoteStream;
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.play().catch(() => {
      callStatus.textContent = "تم الاتصال — اضغط على الفيديو لتشغيل الصوت والصورة";
    });
  };

  peerConnection.onconnectionstatechange =
    () => {

      const state =
        peerConnection.connectionState;

      if(state === "connected"){
        callStatus.textContent = "تم الاتصال";
        remoteVideo.play().catch(() => {});
      }

      // A temporary disconnected state can recover; only close on failure/closure.
      if(state === "failed" || state === "closed"){
        closeCall();
      }
    };

  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    throw new Error("المتصفح لا يدعم الكاميرا والميكروفون. افتح التطبيق عبر HTTPS أو من متصفح حديث.");
  }

  // Video calls explicitly request both microphone and camera permission.
  localStream = await navigator.mediaDevices.getUserMedia(
    video
      ? { audio:true, video:{ facingMode:"user", width:{ ideal:1280 }, height:{ ideal:720 } } }
      : { audio:true, video:false }
  );

  localStream
    .getTracks()
    .forEach(
      track =>
        peerConnection.addTrack(
          track,
          localStream
        )
    );

  localVideo.srcObject =
    localStream;

  localVideo.style.display =
    video ? "block" : "none";
}

async function flushPendingIceCandidates(){

  if(
    !peerConnection ||
    !peerConnection.remoteDescription
  ){
    return;
  }

  const candidates =
    pendingIceCandidates.splice(
      0,
      pendingIceCandidates.length
    );

  for(const candidate of candidates){

    try{

      await peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );

    }catch(error){

      console.error(error);
    }
  }
}

async function startCall(video){

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    return;
  }

  try{

    activeCallUser = selectedUser;
    callBox.style.display = "flex";

    callStatus.textContent =
      "جاري الاتصال بـ " +
      activeCallUser;

    await createPeer(video);

    const offer =
      await peerConnection.createOffer();

    await peerConnection.setLocalDescription(
      offer
    );

    sendWS({
      type:"call-offer",
      to:activeCallUser,
      offer,
      video:!!video
    });

  }catch(error){

    closeCall();

    alert(
      error.message ||
      "تعذر بدء المكالمة"
    );
  }
}

audioCallBtn.onclick = () => {
  startCall(false);
};

videoCallBtn.onclick = () => {
  startCall(true);
};

acceptCall.onclick = async () => {

  if(!incomingCall || !pendingOffer){
    return;
  }

  try{

    selectedUser =
      incomingCall.from;
    activeCallUser = incomingCall.from;

    chatTitle.textContent =
      selectedUser;

    chatAvatar.textContent =
      initials(selectedUser);

    callBox.style.display =
      "flex";

    callStatus.textContent =
      "جاري الاتصال...";

    await createPeer(
      incomingCall.video
    );

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(
        pendingOffer
      )
    );

    await flushPendingIceCandidates();

    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(
      answer
    );

    sendWS({
      type:"call-answer",
      to:activeCallUser,
      answer
    });

    incomingCall = null;
    pendingOffer = null;

  }catch(error){

    closeCall();

    alert(
      error.message ||
      "تعذر قبول المكالمة"
    );
  }
};

rejectCall.onclick = () => {

  if(incomingCall?.from){

    sendWS({
      type:"call-end",
      to:incomingCall.from
    });
  }

  closeCall();
};

hangupCall.onclick = () => {

  if(activeCallUser){

    sendWS({
      type:"call-end",
      to:activeCallUser
    });
  }

  closeCall();
};

function closeCall(){

  try{
    peerConnection?.close();
  }catch{}

  peerConnection = null;
  pendingIceCandidates = [];

  if(localStream){

    localStream
      .getTracks()
      .forEach(
        track => track.stop()
      );
  }

  localStream = null;

  remoteVideo.srcObject = null;
  localVideo.srcObject = null;

  callBox.style.display = "none";

  incomingCall = null;
  pendingOffer = null;
  activeCallUser = null;
}

restoreSession();

</script>

</body>
</html>`;

function json(data, status = 200){
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":"application/json; charset=utf-8"
      }
    }
  );
}

function cors(response){
  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin","*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  return new Response(
    response.body,
    {
      status:response.status,
      statusText:response.statusText,
      headers
    }
  );
}

function randomToken(){
  const bytes =
    new Uint8Array(32);

  crypto.getRandomValues(bytes);

  return Array
    .from(bytes)
    .map(
      b =>
        b.toString(16).padStart(2,"0")
    )
    .join("");
}

function randomId(){
  return crypto.randomUUID();
}

async function hashPassword(password,salt){

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name:"PBKDF2",
        salt:encoder.encode(salt),
        iterations:PBKDF2_ITERATIONS,
        hash:"SHA-256"
      },
      key,
      256
    );

  return Array
    .from(
      new Uint8Array(bits)
    )
    .map(
      b =>
        b.toString(16).padStart(2,"0")
    )
    .join("");
}

function now(){
  return Date.now();
}

export default {

  async fetch(request, env){

    if(request.method === "OPTIONS"){

      return cors(
        new Response(
          null,
          {
            status:204
          }
        )
      );
    }

    const url =
      new URL(request.url);

    try{

      if(
        url.pathname === "/" ||
        url.pathname === "/index.html"
      ){

        return new Response(
          HTML,
          {
            headers:{
              "Content-Type":
                "text/html; charset=utf-8",
              "Cache-Control":
                "no-store"
            }
          }
        );
      }

      // مهم جدًا:
      // اسم الـ binding في wrangler.jsonc هو CHAT_ROOM
      const id =
        env.CHAT_ROOM.idFromName("main");

      const room =
        env.CHAT_ROOM.get(id);

      const response =
        await room.fetch(request);

      // Cloudflare WebSocket upgrade responses must be returned unchanged.
      // Wrapping a 101 response in cors() drops the WebSocket attachment,
      // causing the browser socket to fail and users to appear offline.
      if (
        request.headers.get("Upgrade")?.toLowerCase() === "websocket" ||
        response.status === 101
      ) {
        return response;
      }

      return cors(response);

    }catch(error){

      return cors(
        json(
          {
            error:
              error?.message ||
              "Server error"
          },
          500
        )
      );
    }
  }
};

export class ChatRoom extends DurableObject {

  constructor(ctx,env){

    super(ctx,env);

    this.ctx = ctx;
    this.env = env;

    this.sessions = new Map();

    this.ensureSchema();
  }

  ensureSchema(){

    const sql =
      this.ctx.storage.sql;

    // Safe schema initialization only. Never drop existing account, message,
    // file, or session tables during startup/deployment.
    sql.exec(`
      CREATE TABLE IF NOT EXISTS app_migrations (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    sql.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    sql.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);

    sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT,
        file_id TEXT,
        file_name TEXT,
        mime TEXT,
        created_at INTEGER NOT NULL,
        edited INTEGER DEFAULT 0
      )
    `);

    sql.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        receiver TEXT,
        name TEXT NOT NULL,
        mime TEXT NOT NULL,
        data BLOB NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  getUser(token){

    if(!token){
      return null;
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT username, expires_at
          FROM sessions
          WHERE token = ?
          `,
          token
        )
        .toArray();

    if(!rows.length){
      return null;
    }

    const session =
      rows[0];

    // SESSION_FOREVER يجعل الجلسة طويلة جدًا.
    // لا نحذف الجلسة بسبب الوقت.
    if(
      Number(session.expires_at) <
      Date.now()
    ){

      this.ctx.storage.sql.exec(
        `
        DELETE FROM sessions
        WHERE token = ?
        `,
        token
      );

      return null;
    }

    return session.username;
  }

  async register(request){

    let body;

    try{
      body = await request.json();
    }catch{
      return json(
        {
          error:"بيانات غير صحيحة"
        },
        400
      );
    }

    const username =
      String(body.username || "")
        .trim();

    const password =
      String(body.password || "");

    if(
      username.length < 3 ||
      username.length > 30
    ){

      return json(
        {
          error:
            "اسم المستخدم يجب أن يكون بين 3 و30 حرفًا"
        },
        400
      );
    }

    if(password.length < 4){

      return json(
        {
          error:
            "كلمة المرور قصيرة جدًا"
        },
        400
      );
    }

    const exists =
      this.ctx.storage.sql
        .exec(
          `
          SELECT username
          FROM accounts
          WHERE username = ?
          `,
          username
        )
        .toArray();

    if(exists.length){

      return json(
        {
          error:
            "اسم المستخدم مستخدم بالفعل"
        },
        409
      );
    }

    const salt =
      randomToken();

    const passwordHash =
      await hashPassword(
        password,
        salt
      );

    this.ctx.storage.sql.exec(
      `
      INSERT INTO accounts
      (
        username,
        password_hash,
        salt,
        created_at
      )
      VALUES (?, ?, ?, ?)
      `,
      username,
      passwordHash,
      salt,
      now()
    );

    const token =
      randomToken();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO sessions
      (
        token,
        username,
        expires_at
      )
      VALUES (?, ?, ?)
      `,
      token,
      username,
      SESSION_FOREVER
    );

    return json({
      ok:true,
      token,
      username
    });
  }

  async login(request){

    let body;

    try{
      body = await request.json();
    }catch{
      return json(
        {
          error:"بيانات غير صحيحة"
        },
        400
      );
    }

    const username =
      String(body.username || "")
        .trim();

    const password =
      String(body.password || "");

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            username,
            password_hash,
            salt
          FROM accounts
          WHERE username = ?
          `,
          username
        )
        .toArray();

    if(!rows.length){

      return json(
        {
          error:
            "اسم المستخدم أو كلمة المرور غير صحيحة"
        },
        401
      );
    }

    const account =
      rows[0];

    const passwordHash =
      await hashPassword(
        password,
        account.salt
      );

    if(
      passwordHash !==
      account.password_hash
    ){

      return json(
        {
          error:
            "اسم المستخدم أو كلمة المرور غير صحيحة"
        },
        401
      );
    }

    const token =
      randomToken();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO sessions
      (
        token,
        username,
        expires_at
      )
      VALUES (?, ?, ?)
      `,
      token,
      username,
      SESSION_FOREVER
    );

    return json({
      ok:true,
      token,
      username
    });
  }

  async me(url){

    const token =
      url.searchParams.get("token");

    const username =
      this.getUser(token);

    if(!username){

      return json(
        {
          error:"Unauthorized"
        },
        401
      );
    }

    return json({
      ok:true,
      username
    });
  }

  async logout(request){

    let body = {};

    try{
      body = await request.json();
    }catch{}

    const token =
      body.token;

    if(token){

      this.ctx.storage.sql.exec(
        `
        DELETE FROM sessions
        WHERE token = ?
        `,
        token
      );

      this.removeSessionSockets(token);
      this.broadcastUsers();
    }

    return json({
      ok:true
    });
  }

  users(){

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT username
          FROM accounts
          ORDER BY username COLLATE NOCASE
          `
        )
        .toArray();

    const onlineUsers = this.getOnlineUsernames();

    const users =
      rows.map(
        row => ({
          username:row.username,
          online:onlineUsers.has(row.username)
        })
      );

    return json({
      users
    });
  }

  history(url){

    const token =
      url.searchParams.get("token");

    const current =
      this.getUser(token);

    if(!current){

      return json(
        {
          error:"Unauthorized"
        },
        401
      );
    }

    const other =
      url.searchParams.get("with");

    if(!other){

      return json(
        {
          messages:[]
        }
      );
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            id,
            sender,
            receiver,
            text,
            file_id,
            file_name,
            mime,
            created_at,
            edited
          FROM messages
          WHERE
            (
              sender = ?
              AND receiver = ?
            )
            OR
            (
              sender = ?
              AND receiver = ?
            )
          ORDER BY created_at ASC
          LIMIT 1000
          `,
          current,
          other,
          other,
          current
        )
        .toArray();

    return json({
      messages:rows
    });
  }

  async upload(request){

    const form =
      await request.formData();

    const token =
      form.get("token");

    const receiver =
      String(
        form.get("receiver") || ""
      ).trim();

    const file =
      form.get("file");

    const owner =
      this.getUser(token);

    if(!owner){

      return json(
        {
          error:"Unauthorized"
        },
        401
      );
    }

    if(!receiver){

      return json(
        {
          error:
            "المستلم غير محدد"
        },
        400
      );
    }

    if(
      !(file instanceof File)
    ){

      return json(
        {
          error:
            "الملف غير موجود"
        },
        400
      );
    }

    if(
      file.size >
      MAX_FILE_SIZE
    ){

      return json(
        {
          error:
            "حجم الملف أكبر من 20 ميجابايت"
        },
        413
      );
    }

    const receiverExists =
      this.ctx.storage.sql
        .exec(
          `
          SELECT username
          FROM accounts
          WHERE username = ?
          `,
          receiver
        )
        .toArray();

    if(!receiverExists.length){

      return json(
        {
          error:
            "المستخدم غير موجود"
        },
        404
      );
    }

    const id =
      randomId();

    const data =
      new Uint8Array(
        await file.arrayBuffer()
      );

    this.ctx.storage.sql.exec(
      `
      INSERT INTO files
      (
        id,
        owner,
        receiver,
        name,
        mime,
        data,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      owner,
      receiver,
      file.name || "file",
      file.type || "application/octet-stream",
      data,
      now()
    );

    const messageId =
      randomId();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO messages
      (
        id,
        sender,
        receiver,
        text,
        file_id,
        file_name,
        mime,
        created_at,
        edited
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      messageId,
      owner,
      receiver,
      "",
      id,
      file.name || "file",
      file.type || "application/octet-stream",
      now()
    );

    const message = {
      type:"message",
      id:messageId,
      sender:owner,
      receiver,
      text:"",
      file_id:id,
      file_name:file.name || "file",
      mime:file.type || "application/octet-stream",
      created_at:now(),
      edited:0
    };

    this.sendToUser(
      receiver,
      message
    );

    this.sendToUser(
      owner,
      message
    );

    return json({
      ok:true,
      id,
      message_id:messageId
    });
  }

  async file(url){

    const token =
      url.searchParams.get("token");

    const current =
      this.getUser(token);

    if(!current){

      return new Response(
        "Unauthorized",
        {
          status:401
        }
      );
    }

    const id =
      url.searchParams.get("id");

    if(!id){

      return new Response(
        "Missing file",
        {
          status:400
        }
      );
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            owner,
            receiver,
            name,
            mime,
            data
          FROM files
          WHERE id = ?
          `,
          id
        )
        .toArray();

    if(!rows.length){

      return new Response(
        "File not found",
        {
          status:404
        }
      );
    }

    const file =
      rows[0];

    if(
      file.owner !== current &&
      file.receiver !== current
    ){

      return new Response(
        "Forbidden",
        {
          status:403
        }
      );
    }

    return new Response(
      file.data,
      {
        headers:{
          "Content-Type":
            file.mime ||
            "application/octet-stream",

          "Content-Disposition":
            "inline; filename*=UTF-8''" +
            encodeURIComponent(
              file.name
            )
        }
      }
    );
  }

  async deleteAccount(request){

    let body = {};

    try{
      body = await request.json();
    }catch{}

    const token =
      body.token;

    const username =
      this.getUser(token);

    if(!username){

      return json(
        {
          error:"Unauthorized"
        },
        401
      );
    }

    this.ctx.storage.sql.exec(
      `
      DELETE FROM messages
      WHERE sender = ?
         OR receiver = ?
      `,
      username,
      username
    );

    this.ctx.storage.sql.exec(
      `
      DELETE FROM files
      WHERE owner = ?
         OR receiver = ?
      `,
      username,
      username
    );

    this.ctx.storage.sql.exec(
      `
      DELETE FROM sessions
      WHERE username = ?
      `,
      username
    );

    this.ctx.storage.sql.exec(
      `
      DELETE FROM accounts
      WHERE username = ?
      `,
      username
    );

    this.removeSessionSockets(token);

    this.broadcastUsers();

    return json({
      ok:true
    });
  }

  async fetch(request){

    const url =
      new URL(request.url);

    try{

      if(
        request.headers.get("Upgrade")
          ?.toLowerCase() ===
        "websocket" ||
        url.pathname === "/ws"
      ){

        return this.handleWebSocket(
          request,
          url
        );
      }

      if(
        url.pathname === "/admin/reset-all" &&
        request.method === "POST"
      ){
        const resetKey = this.env.ADMIN_RESET_KEY;
        const authHeader = request.headers.get("Authorization") || "";
        if (!resetKey || authHeader !== `Bearer ${resetKey}`) {
          return json({ error: "Unauthorized" }, 401);
        }

        const sql = this.ctx.storage.sql;
        for (const sockets of this.sessions.values()) {
          for (const socket of sockets) {
            try { socket.close(1000, "Database reset"); } catch {}
          }
        }
        this.sessions.clear();
        sql.exec("DELETE FROM messages");
        sql.exec("DELETE FROM files");
        sql.exec("DELETE FROM sessions");
        sql.exec("DELETE FROM accounts");
        return json({ ok: true, message: "All users, messages, files, and sessions deleted." });
      }

      if(
        url.pathname === "/api/register" &&
        request.method === "POST"
      ){

        return this.register(request);
      }

      if(
        url.pathname === "/api/login" &&
        request.method === "POST"
      ){

        return this.login(request);
      }

      if(
        url.pathname === "/api/me" &&
        request.method === "GET"
      ){

        return this.me(url);
      }

      if(
        url.pathname === "/api/logout" &&
        request.method === "POST"
      ){

        return this.logout(request);
      }

      if(
        url.pathname === "/api/users" &&
        request.method === "GET"
      ){

        return this.users();
      }

      if(
        url.pathname === "/api/history" &&
        request.method === "GET"
      ){

        return this.history(url);
      }

      if(
        url.pathname === "/api/upload" &&
        request.method === "POST"
      ){

        return this.upload(request);
      }

      if(
        url.pathname === "/api/file" &&
        request.method === "GET"
      ){

        return this.file(url);
      }

      if(
        url.pathname === "/api/delete-account" &&
        request.method === "POST"
      ){

        return this.deleteAccount(request);
      }

      return json(
        {
          error:"Not found"
        },
        404
      );

    }catch(error){

      return json(
        {
          error:
            error?.message ||
            "Server error"
        },
        500
      );
    }
  }

  handleWebSocket(request,url){

    const token =
      url.searchParams.get("token");

    const username =
      this.getUser(token);

    if(!username){

      return new Response(
        "Unauthorized",
        {
          status:401
        }
      );
    }

    const pair =
      new WebSocketPair();

    const client =
      pair[0];

    const server =
      pair[1];

    server.accept();

    if(!this.sessions.has(username)){
      this.sessions.set(
        username,
        new Set()
      );
    }

    this.sessions
      .get(username)
      .add(server);

    server.__username =
      username;

    server.__token =
      token;

    server.addEventListener(
      "message",
      event => {

        this.webSocketMessage(
          server,
          event
        );
      }
    );

    server.addEventListener(
      "close",
      () => {

        this.webSocketClose(
          server
        );
      }
    );

    server.addEventListener(
      "error",
      () => {

        this.webSocketError(
          server
        );
      }
    );

    this.broadcastUsers();

    return new Response(
      null,
      {
        status:101,
        webSocket:client
      }
    );
  }

  webSocketMessage(socket,event){

    let data;

    try{

      data =
        JSON.parse(
          event.data
        );

    }catch{

      return;
    }

    const username =
      socket.__username;

    if(!username){
      return;
    }

    this.handleMessage(
      socket,
      username,
      data
    );
  }

  webSocketClose(socket){

    this.removeSocket(
      socket
    );

    this.broadcastUsers();
  }

  webSocketError(socket){

    this.removeSocket(
      socket
    );

    this.broadcastUsers();
  }

  // Build presence from sockets that are actually open, and prune stale
  // entries before reporting online status.
  getOnlineUsernames(){

    const online = new Set();

    for(const [username, set] of this.sessions){
      for(const socket of set){
        if(socket.readyState === WebSocket.OPEN){
          online.add(username);
        }else if(
          socket.readyState === WebSocket.CLOSED ||
          socket.readyState === WebSocket.CLOSING
        ){
          set.delete(socket);
        }
      }

      if(!set.size){
        this.sessions.delete(username);
      }
    }

    return online;
  }

  removeSocket(socket){

    const username =
      socket.__username;

    if(!username){
      return;
    }

    const set =
      this.sessions.get(
        username
      );

    if(!set){
      return;
    }

    set.delete(socket);

    if(!set.size){

      this.sessions.delete(
        username
      );
    }
  }

  removeSessionSockets(token){

    for(
      const [username,set]
      of this.sessions
    ){

      for(
        const socket
        of set
      ){

        if(
          socket.__token === token
        ){

          try{
            socket.close();
          }catch{}

          set.delete(socket);
        }
      }

      if(!set.size){
        this.sessions.delete(
          username
        );
      }
    }
  }

  handleMessage(
    socket,
    username,
    data
  ){

    if(data.type === "presence"){
      this.broadcastUsers();
      return;
    }

    if(data.type === "message"){

      const to =
        String(data.to || "")
          .trim();

      const text =
        String(data.text || "");

      if(
        !to ||
        !text.trim()
      ){
        return;
      }

      const exists =
        this.ctx.storage.sql
          .exec(
            `
            SELECT username
            FROM accounts
            WHERE username = ?
            `,
            to
          )
          .toArray();

      if(!exists.length){

        socket.send(
          JSON.stringify({
            type:"error",
            error:
              "المستخدم غير موجود"
          })
        );

        return;
      }

      const id =
        randomId();

      const createdAt =
        now();

      this.ctx.storage.sql.exec(
        `
        INSERT INTO messages
        (
          id,
          sender,
          receiver,
          text,
          file_id,
          file_name,
          mime,
          created_at,
          edited
        )
        VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, 0)
        `,
        id,
        username,
        to,
        text,
        createdAt
      );

      const message = {
        type:"message",
        id,
        sender:username,
        receiver:to,
        text,
        file_id:null,
        file_name:null,
        mime:null,
        created_at:createdAt,
        edited:0
      };

      this.sendToUser(
        to,
        message
      );

      this.sendToUser(
        username,
        message
      );

      return;
    }

    if(data.type === "typing"){

      const to =
        String(data.to || "")
          .trim();

      if(!to){
        return;
      }

      this.sendToUser(
        to,
        {
          type:"typing",
          from:username,
          value:!!data.value
        }
      );

      return;
    }

    if(data.type === "edit"){

      this.editMessage(
        username,
        data
      );

      return;
    }

    if(data.type === "delete"){

      this.deleteMessage(
        username,
        data
      );

      return;
    }

    if(data.type === "forward"){

      this.forwardMessage(
        username,
        data
      );

      return;
    }

    if(data.type === "call-offer"){

      this.forwardCall(
        username,
        data,
        "call-offer"
      );

      return;
    }

    if(data.type === "call-answer"){

      this.forwardCall(
        username,
        data,
        "call-answer"
      );

      return;
    }

    if(data.type === "ice"){

      this.forwardCall(
        username,
        data,
        "ice"
      );

      return;
    }

    if(data.type === "call-end"){

      this.forwardCall(
        username,
        data,
        "call-end"
      );

      return;
    }
  }

  editMessage(username,data){

    const id =
      String(data.id || "");

    const text =
      String(data.text || "")
        .trim();

    if(!id || !text){
      return;
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            sender,
            receiver
          FROM messages
          WHERE id = ?
          `,
          id
        )
        .toArray();

    if(!rows.length){
      return;
    }

    const message =
      rows[0];

    if(message.sender !== username){
      return;
    }

    this.ctx.storage.sql.exec(
      `
      UPDATE messages
      SET text = ?, edited = 1
      WHERE id = ?
      `,
      text,
      id
    );

    const payload = {
      type:"edited",
      id,
      sender:message.sender,
      receiver:message.receiver,
      text
    };

    this.sendToUser(
      message.sender,
      payload
    );

    this.sendToUser(
      message.receiver,
      payload
    );
  }

  deleteMessage(username,data){

    const id =
      String(data.id || "");

    if(!id){
      return;
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            sender,
            receiver,
            file_id
          FROM messages
          WHERE id = ?
          `,
          id
        )
        .toArray();

    if(!rows.length){
      return;
    }

    const message =
      rows[0];

    if(message.sender !== username){
      return;
    }

    this.ctx.storage.sql.exec(
      `
      DELETE FROM messages
      WHERE id = ?
      `,
      id
    );

    if(message.file_id){

      const references =
        this.ctx.storage.sql
          .exec(
            `
            SELECT id
            FROM messages
            WHERE file_id = ?
            LIMIT 1
            `,
            message.file_id
          )
          .toArray();

      if(!references.length){

        this.ctx.storage.sql.exec(
          `
          DELETE FROM files
          WHERE id = ?
          `,
          message.file_id
        );
      }
    }

    const payload = {
      type:"deleted",
      id
    };

    this.sendToUser(
      message.sender,
      payload
    );

    this.sendToUser(
      message.receiver,
      payload
    );
  }

  forwardMessage(username,data){

    const id =
      String(data.id || "");

    const to =
      String(data.to || "")
        .trim();

    if(!id || !to){
      return;
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            sender,
            receiver,
            text,
            file_id,
            file_name,
            mime
          FROM messages
          WHERE id = ?
          `,
          id
        )
        .toArray();

    if(!rows.length){
      return;
    }

    const original =
      rows[0];

    if(
      original.sender !== username &&
      original.receiver !== username
    ){
      return;
    }

    const receiverExists =
      this.ctx.storage.sql
        .exec(
          `
          SELECT username
          FROM accounts
          WHERE username = ?
          `,
          to
        )
        .toArray();

    if(!receiverExists.length){
      return;
    }

    let forwardedFileId =
      original.file_id || null;

    if(original.file_id){

      const fileRows =
        this.ctx.storage.sql
          .exec(
            `
            SELECT
              name,
              mime,
              data
            FROM files
            WHERE id = ?
            `,
            original.file_id
          )
          .toArray();

      if(!fileRows.length){
        return;
      }

      const originalFile =
        fileRows[0];

      forwardedFileId =
        randomId();

      this.ctx.storage.sql.exec(
        `
        INSERT INTO files
        (
          id,
          owner,
          receiver,
          name,
          mime,
          data,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        forwardedFileId,
        username,
        to,
        originalFile.name ||
          original.file_name ||
          "file",
        originalFile.mime ||
          original.mime ||
          "application/octet-stream",
        originalFile.data,
        now()
      );
    }

    const newId =
      randomId();

    const createdAt =
      now();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO messages
      (
        id,
        sender,
        receiver,
        text,
        file_id,
        file_name,
        mime,
        created_at,
        edited
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      newId,
      username,
      to,
      original.text || "",
      forwardedFileId,
      original.file_name || null,
      original.mime || null,
      createdAt
    );

    const payload = {
      type:"forwarded",
      id:newId,
      sender:username,
      receiver:to,
      text:original.text || "",
      file_id:forwardedFileId,
      file_name:original.file_name || null,
      mime:original.mime || null,
      created_at:createdAt
    };

    this.sendToUser(
      to,
      {
        type:"message",
        ...payload
      }
    );

    this.sendToUser(
      username,
      {
        type:"message",
        ...payload
      }
    );
  }

  forwardCall(username,data,type){

    const to =
      String(data.to || "")
        .trim();

    if(!to){
      return;
    }

    const payload = {
      ...data,
      type,
      from:username
    };

    delete payload.to;

    this.sendToUser(
      to,
      payload
    );
  }

  sendToUser(username,payload){

    const set =
      this.sessions.get(
        username
      );

    if(!set){
      return;
    }

    const text =
      JSON.stringify(payload);

    for(
      const socket
      of set
    ){

      try{

        socket.send(text);

      }catch{

        try{
          socket.close();
        }catch{}

        set.delete(socket);
      }
    }

    if(!set.size){

      this.sessions.delete(
        username
      );
    }
  }

  broadcastUsers(){

    const rows =
      this.ctx.storage.sql
        .exec(
          `
          SELECT username
          FROM accounts
          ORDER BY username COLLATE NOCASE
          `
        )
        .toArray();

    const onlineUsers = this.getOnlineUsernames();

    const users =
      rows.map(
        row => ({
          username:row.username,
          online:onlineUsers.has(row.username)
        })
      );

    const payload =
      JSON.stringify({
        type:"users",
        users
      });

    for(
      const set
      of this.sessions.values()
    ){

      for(
        const socket
        of set
      ){

        try{
          socket.send(payload);
        }catch{}
      }
    }
  }
}
