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
*{box-sizing:border-box}

html,body{
  margin:0;
  width:100%;
  height:100%;
  font-family:Arial,sans-serif;
}

body{
  background:#e5ddd5;
  color:#111;
}

button,input{
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
  max-width:390px;
  background:#fff;
  border-radius:18px;
  padding:25px;
  box-shadow:0 8px 30px #0002;
}

.auth-box h1{
  margin:0 0 8px;
  text-align:center;
  color:#075e54;
}

.auth-sub{
  text-align:center;
  color:#777;
  margin-bottom:22px;
}

.auth-box input{
  width:100%;
  padding:13px;
  border:1px solid #ddd;
  border-radius:10px;
  margin-bottom:12px;
  outline:none;
}

.auth-box input:focus{
  border-color:#128c7e;
}

.primary{
  width:100%;
  border:0;
  border-radius:10px;
  padding:13px;
  background:#128c7e;
  color:#fff;
  font-weight:bold;
}

.switch{
  margin-top:14px;
  text-align:center;
  color:#128c7e;
  cursor:pointer;
}

#error{
  color:#c62828;
  text-align:center;
  margin-top:12px;
  min-height:20px;
}

#app{
  height:100vh;
  display:flex;
  overflow:hidden;
}

.layout{
  width:100%;
  height:100%;
  display:flex;
}

.sidebar{
  width:310px;
  background:#fff;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

.side-header{
  height:65px;
  background:#075e54;
  color:white;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 12px;
}

.side-title{
  font-size:19px;
  font-weight:bold;
}

.header-buttons{
  display:flex;
  gap:5px;
}

.icon-btn{
  border:0;
  background:transparent;
  color:inherit;
  font-size:20px;
  width:38px;
  height:38px;
  border-radius:50%;
}

.icon-btn:hover{
  background:#ffffff22;
}

.search-box{
  padding:10px;
  background:#f5f5f5;
}

.search-box input{
  width:100%;
  border:0;
  outline:0;
  background:#fff;
  border-radius:20px;
  padding:10px 14px;
}

#users{
  overflow:auto;
  flex:1;
}

.user-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px;
  border-bottom:1px solid #eee;
  cursor:pointer;
}

.user-item:hover{
  background:#f5f5f5;
}

.user-item.selected{
  background:#e8f5f3;
}

.avatar{
  width:46px;
  height:46px;
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
  color:#888;
  margin-top:4px;
}

.status-dot{
  display:inline-block;
  width:8px;
  height:8px;
  border-radius:50%;
  margin-left:5px;
}

.online-dot{
  background:#20c65a;
}

.offline-dot{
  background:#aaa;
}

.chat{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  background:#efeae2;
}

.chat-header{
  height:65px;
  background:#075e54;
  color:white;
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 14px;
}

.chat-header .avatar{
  width:45px;
  height:45px;
  background:#128c7e;
}

.chat-info{
  flex:1;
  min-width:0;
}

#chatTitle{
  font-weight:bold;
}

#typing{
  font-size:12px;
  opacity:.8;
  min-height:16px;
}

.messages{
  flex:1;
  overflow:auto;
  padding:15px;
  background:
    radial-gradient(#d7d0c8 1px,transparent 1px);
  background-size:18px 18px;
}

.empty-chat{
  text-align:center;
  color:#777;
  margin-top:30px;
}

.message-row{
  display:flex;
  margin:5px 0;
}

.message-row.mine{
  justify-content:flex-start;
}

.message-row.theirs{
  justify-content:flex-end;
}

.message{
  max-width:min(75%,600px);
  padding:8px 10px;
  border-radius:9px;
  box-shadow:0 1px 1px #0001;
  word-break:break-word;
  position:relative;
}

.mine .message{
  background:#d9fdd3;
  border-top-right-radius:2px;
}

.theirs .message{
  background:#fff;
  border-top-left-radius:2px;
}

.message-text{
  white-space:pre-wrap;
}

.message-time{
  font-size:10px;
  color:#777;
  margin-top:4px;
  text-align:left;
}

.message-file{
  display:block;
  max-width:100%;
  margin-bottom:6px;
}

.message-file img,
.message-file video{
  max-width:100%;
  max-height:300px;
  border-radius:8px;
}

.audio-player{
  width:250px;
  max-width:100%;
}

.message-actions{
  margin-top:5px;
  display:flex;
  gap:4px;
}

.message-actions button{
  border:0;
  background:#0000000d;
  border-radius:5px;
  font-size:11px;
  padding:3px 6px;
}

.composer{
  min-height:62px;
  background:#f0f0f0;
  display:flex;
  align-items:center;
  gap:7px;
  padding:9px;
}

.composer input{
  flex:1;
  min-width:0;
  border:0;
  outline:0;
  border-radius:22px;
  padding:12px 15px;
  background:#fff;
}

.circle-btn{
  width:43px;
  height:43px;
  border:0;
  border-radius:50%;
  background:#128c7e;
  color:#fff;
  font-size:19px;
}

.circle-btn.recording{
  background:#c62828;
}

.file-label{
  width:43px;
  height:43px;
  border-radius:50%;
  background:#128c7e;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  font-size:20px;
}

#fileInput{
  display:none;
}

.call-modal{
  position:fixed;
  inset:0;
  background:#000b;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1000;
}

.call-box{
  width:min(500px,92%);
  background:#fff;
  border-radius:18px;
  padding:25px;
  text-align:center;
}

.call-box h2{
  margin-top:0;
}

.call-buttons{
  display:flex;
  justify-content:center;
  gap:10px;
  margin-top:20px;
}

.call-buttons button{
  border:0;
  border-radius:10px;
  padding:11px 20px;
  color:#fff;
}

.accept{
  background:#20a957;
}

.reject,
.end-call{
  background:#d32f2f;
}

.call-screen{
  position:fixed;
  inset:0;
  background:#111;
  z-index:1100;
  display:flex;
  flex-direction:column;
}

.remote-video{
  width:100%;
  height:100%;
  object-fit:cover;
  background:#111;
}

.local-video{
  position:absolute;
  width:130px;
  height:180px;
  right:15px;
  top:15px;
  object-fit:cover;
  border-radius:10px;
  background:#222;
}

.call-controls{
  position:absolute;
  bottom:25px;
  left:0;
  right:0;
  display:flex;
  justify-content:center;
  gap:12px;
}

.call-controls button{
  border:0;
  width:52px;
  height:52px;
  border-radius:50%;
  color:#fff;
  background:#444;
}

.call-controls .danger{
  background:#d32f2f;
}

.settings-modal{
  position:fixed;
  inset:0;
  background:#0008;
  z-index:900;
  display:flex;
  justify-content:center;
  align-items:center;
}

.settings{
  width:min(420px,92%);
  max-height:90vh;
  overflow:auto;
  background:#fff;
  border-radius:18px;
  padding:20px;
}

.settings h2{
  margin-top:0;
}

.setting-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 0;
  border-bottom:1px solid #eee;
}

.danger-btn{
  width:100%;
  border:0;
  padding:12px;
  border-radius:10px;
  background:#d32f2f;
  color:white;
  margin-top:15px;
}

body.dark{
  background:#111;
  color:#eee;
}

body.dark .sidebar,
body.dark .auth-box,
body.dark .settings{
  background:#1e1e1e;
  color:#eee;
}

body.dark .user-item{
  border-color:#333;
}

body.dark .user-item:hover{
  background:#292929;
}

body.dark .search-box,
body.dark .composer{
  background:#181818;
}

body.dark .search-box input,
body.dark .composer input{
  background:#2a2a2a;
  color:#fff;
}

body.dark .chat{
  background:#111;
}

body.dark .messages{
  background:#151515;
}

body.dark .theirs .message{
  background:#252525;
  color:#fff;
}

body.dark .message-actions button{
  background:#ffffff18;
  color:#fff;
}

body.dark .settings{
  border:1px solid #333;
}

@media(max-width:700px){
  .sidebar{
    width:180px;
  }

  .message{
    max-width:88%;
  }
}

@media(max-width:430px){
  .sidebar{
    width:155px;
  }

  .side-title{
    font-size:15px;
  }

  .search-box{
    padding:6px;
  }

  .user-item{
    padding:8px;
  }

  .avatar{
    width:38px;
    height:38px;
  }

  .message{
    max-width:92%;
  }

  .composer{
    gap:4px;
    padding:6px;
  }

  .circle-btn,
  .file-label{
    width:39px;
    height:39px;
  }
}
</style>
</head>

<body>

<div id="auth">
  <div class="auth-box">
    <h1 id="authTitle">إنشاء حساب</h1>
    <div class="auth-sub">تطبيق الدردشة</div>

    <input id="username" autocomplete="username" placeholder="اسم المستخدم">
    <input id="password" type="password" autocomplete="current-password" placeholder="كلمة المرور">

    <button class="primary" id="authButton">إنشاء الحساب</button>

    <div class="switch" id="switchAuth">
      عندك حساب؟ تسجيل الدخول
    </div>

    <div id="error"></div>
  </div>
</div>

<div id="app" class="hidden">
  <div class="layout">

    <aside class="sidebar">

      <div class="side-header">
        <div class="side-title">المستخدمون</div>

        <div class="header-buttons">
          <button class="icon-btn" id="settingsBtn" title="الإعدادات">⚙️</button>
          <button class="icon-btn" id="logoutBtn" title="خروج">↪️</button>
        </div>
      </div>

      <div class="search-box">
        <input id="searchUsers" placeholder="بحث عن مستخدم...">
      </div>

      <div id="users"></div>

    </aside>

    <main class="chat">

      <div class="chat-header">

        <div class="avatar" id="chatAvatar">?</div>

        <div class="chat-info">
          <div id="chatTitle">اختر مستخدمًا</div>
          <div id="typing"></div>
        </div>

        <button class="icon-btn" id="audioCallBtn" title="مكالمة صوتية">📞</button>
        <button class="icon-btn" id="videoCallBtn" title="مكالمة فيديو">📹</button>

      </div>

      <div class="messages" id="messages">
        <div class="empty-chat">
          اختر مستخدمًا لبدء المحادثة
        </div>
      </div>

      <div class="composer">

        <label class="file-label" title="إرسال ملف">
          📎
          <input id="fileInput" type="file">
        </label>

        <button class="circle-btn" id="recordBtn" title="تسجيل صوتي">🎙️</button>

        <input id="messageInput" placeholder="اكتب رسالة..." autocomplete="off">

        <button class="circle-btn" id="sendBtn">➤</button>

      </div>

    </main>

  </div>
</div>

<div id="incomingCall" class="call-modal hidden">
  <div class="call-box">
    <h2>مكالمة واردة</h2>
    <div id="incomingText">مكالمة واردة</div>

    <div class="call-buttons">
      <button class="accept" id="acceptCallBtn">قبول</button>
      <button class="reject" id="rejectCallBtn">رفض</button>
    </div>
  </div>
</div>

<div id="callScreen" class="call-screen hidden">

  <video id="remoteVideo" class="remote-video" autoplay playsinline></video>
  <video id="localVideo" class="local-video" autoplay muted playsinline></video>

  <div class="call-controls">
    <button id="muteBtn">🎤</button>
    <button id="cameraBtn">📷</button>
    <button id="endCallBtn" class="danger">☎</button>
  </div>

</div>

<div id="settingsModal" class="settings-modal hidden">

  <div class="settings">

    <h2>الإعدادات</h2>

    <div class="setting-row">
      <span>الوضع الداكن</span>
      <input type="checkbox" id="darkMode">
    </div>

    <div class="setting-row">
      <span>اسم الحساب</span>
      <strong id="settingsUsername"></strong>
    </div>

    <button class="danger-btn" id="deleteAccountBtn">
      حذف الحساب
    </button>

    <button class="primary" id="closeSettings" style="margin-top:10px">
      إغلاق
    </button>

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
let incomingCallData = null;

const $ = id => document.getElementById(id);

const auth = $("auth");
const app = $("app");

const usernameInput = $("username");
const passwordInput = $("password");
const authButton = $("authButton");
const authTitle = $("authTitle");
const switchAuth = $("switchAuth");
const errorBox = $("error");

const usersBox = $("users");
const searchUsers = $("searchUsers");

const messagesBox = $("messages");
const messageInput = $("messageInput");
const sendBtn = $("sendBtn");
const recordBtn = $("recordBtn");
const fileInput = $("fileInput");

const chatTitle = $("chatTitle");
const chatAvatar = $("chatAvatar");
const typingBox = $("typing");

const incomingCall = $("incomingCall");
const incomingText = $("incomingText");

const callScreen = $("callScreen");
const remoteVideo = $("remoteVideo");
const localVideo = $("localVideo");

function escapeHtml(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function avatarLetter(name){
  return (name || "?").trim().charAt(0).toUpperCase() || "?";
}

function showError(message){
  errorBox.textContent = message || "";
}

function showApp(){
  auth.classList.add("hidden");
  app.classList.remove("hidden");
}

function showAuth(){
  app.classList.add("hidden");
  auth.classList.remove("hidden");
}

async function api(url, options = {}){
  const response = await fetch(url, {
    ...options,
    headers:{
      ...(options.headers || {}),
      "Content-Type":"application/json"
    }
  });

  let data = {};
  try{
    data = await response.json();
  }catch{}

  if(!response.ok){
    throw new Error(data.error || "حدث خطأ");
  }

  return data;
}

switchAuth.onclick = () => {
  registerMode = !registerMode;

  authTitle.textContent = registerMode
    ? "إنشاء حساب"
    : "تسجيل الدخول";

  authButton.textContent = registerMode
    ? "إنشاء الحساب"
    : "تسجيل الدخول";

  switchAuth.textContent = registerMode
    ? "عندك حساب؟ تسجيل الدخول"
    : "ليس لديك حساب؟ إنشاء حساب";

  showError("");
};

authButton.onclick = async () => {

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if(username.length < 3){
    showError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
    return;
  }

  if(password.length < 4){
    showError("كلمة المرور قصيرة جدًا");
    return;
  }

  authButton.disabled = true;
  showError("جاري التنفيذ...");

  try{

    const endpoint = registerMode
      ? "/api/register"
      : "/api/login";

    const data = await api(endpoint,{
      method:"POST",
      body:JSON.stringify({
        username,
        password
      })
    });

    token = data.token;
    currentUser = data.username || username;

    localStorage.setItem("chatToken",token);
    localStorage.setItem("chatUser",currentUser);

    usernameInput.value = "";
    passwordInput.value = "";

    showError("");

    showApp();

    await loadUsers();
    connectWS();

  }catch(error){
    showError(error.message);
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

    const data = await fetch(
      "/api/me?token=" + encodeURIComponent(token),
      {cache:"no-store"}
    );

    if(!data.ok){
      throw new Error("انتهت الجلسة");
    }

    const user = await data.json();

    currentUser = user.username;

    localStorage.setItem("chatUser",currentUser);

    showApp();

    await loadUsers();
    connectWS();

  }catch{

    token = "";
    currentUser = "";

    localStorage.removeItem("chatToken");
    localStorage.removeItem("chatUser");

    showAuth();
  }
}

async function loadUsers(){

  if(!token) return;

  try{

    const response = await fetch(
      "/api/users?token=" + encodeURIComponent(token),
      {cache:"no-store"}
    );

    if(response.status === 401){
      await logout();
      return;
    }

    const data = await response.json();

    renderUsers(Array.isArray(data) ? data : data.users || []);

  }catch(error){
    usersBox.innerHTML =
      '<div style="padding:20px;text-align:center;color:#888">تعذر تحميل المستخدمين</div>';
  }
}

function renderUsers(list){

  const query = searchUsers.value.trim().toLowerCase();

  const filtered = list
    .filter(user => user.username !== currentUser)
    .filter(user =>
      !query ||
      String(user.username).toLowerCase().includes(query)
    );

  if(!filtered.length){
    usersBox.innerHTML =
      '<div style="padding:20px;text-align:center;color:#888">لا يوجد مستخدمون</div>';
    return;
  }

  usersBox.innerHTML = filtered.map(user => {

    const name = escapeHtml(user.username);
    const online = !!user.online;

    return \`
      <div class="user-item \${selectedUser === user.username ? "selected" : ""}"
           data-user="\${encodeURIComponent(user.username)}">

        <div class="avatar">\${escapeHtml(avatarLetter(user.username))}</div>

        <div class="user-info">
          <div class="user-name">\${name}</div>

          <div class="user-status">
            <span class="status-dot \${online ? "online-dot" : "offline-dot"}"></span>
            \${online ? "متصل الآن" : "غير متصل"}
          </div>
        </div>

      </div>
    \`;

  }).join("");

  document.querySelectorAll(".user-item").forEach(item => {

    item.onclick = () => {
      const user = decodeURIComponent(item.dataset.user);
      openChat(user);
    };

  });
}

searchUsers.oninput = loadUsers;

async function openChat(username){

  selectedUser = username;

  chatTitle.textContent = username;
  chatAvatar.textContent = avatarLetter(username);
  typingBox.textContent = "";

  renderUsersFromCurrent();

  await loadHistory(username);
}

function renderUsersFromCurrent(){
  loadUsers();
}

async function loadHistory(username){

  messagesBox.innerHTML =
    '<div class="empty-chat">جاري تحميل الرسائل...</div>';

  try{

    const response = await fetch(
      "/api/history?token=" +
      encodeURIComponent(token) +
      "&user=" +
      encodeURIComponent(username),
      {cache:"no-store"}
    );

    if(!response.ok){
      throw new Error("تعذر تحميل المحادثة");
    }

    const data = await response.json();

    const list = Array.isArray(data)
      ? data
      : data.messages || [];

    messagesBox.innerHTML = "";

    if(!list.length){
      messagesBox.innerHTML =
        '<div class="empty-chat">لا توجد رسائل بعد</div>';
      return;
    }

    for(const message of list){
      addMessageToUI(message,false);
    }

    scrollMessages();

  }catch(error){

    messagesBox.innerHTML =
      '<div class="empty-chat">تعذر تحميل المحادثة</div>';

  }
}

function formatTime(timestamp){

  try{
    return new Date(timestamp).toLocaleTimeString("ar-EG",{
      hour:"2-digit",
      minute:"2-digit"
    });
  }catch{
    return "";
  }
}

function addMessageToUI(message,scroll = true){

  if(!message) return;

  const sender = message.sender || message.from;
  const mine = sender === currentUser;

  const row = document.createElement("div");
  row.className = "message-row " + (mine ? "mine" : "theirs");

  const box = document.createElement("div");
  box.className = "message";

  let content = "";

  if(message.file_id || message.fileId){

    const fileId = message.file_id || message.fileId;
    const fileName = message.file_name || message.fileName || "ملف";
    const mime = message.mime || "";

    const url =
      "/api/file?id=" +
      encodeURIComponent(fileId) +
      "&token=" +
      encodeURIComponent(token);

    if(mime.startsWith("image/")){

      content += \`
        <a class="message-file" href="\${url}" target="_blank">
          <img src="\${url}" alt="\${escapeHtml(fileName)}">
        </a>
      \`;

    }else if(mime.startsWith("video/")){

      content += \`
        <video class="message-file" src="\${url}" controls></video>
      \`;

    }else if(mime.startsWith("audio/")){

      content += \`
        <audio class="audio-player" src="\${url}" controls></audio>
      \`;

    }else{

      content += \`
        <a class="message-file"
           href="\${url}"
           target="_blank"
           download="\${escapeHtml(fileName)}">
           📎 \${escapeHtml(fileName)}
        </a>
      \`;
    }
  }

  if(message.text){
    content += '<div class="message-text">' +
      escapeHtml(message.text) +
      '</div>';
  }

  const id = message.id || "";

  content += \`
    <div class="message-time">
      \${formatTime(message.created_at || message.createdAt || Date.now())}
      \${mine ? " ✓✓" : ""}
    </div>
  \`;

  if(mine && id){

    content += \`
      <div class="message-actions">
        <button data-edit="\${escapeHtml(id)}">تعديل</button>
        <button data-delete="\${escapeHtml(id)}">حذف</button>
      </div>
    \`;
  }

  box.innerHTML = content;

  row.dataset.messageId = id;

  row.querySelectorAll("[data-edit]").forEach(button => {

    button.onclick = () => {

      const messageId = button.dataset.edit;
      const oldText = message.text || "";

      const newText = prompt("تعديل الرسالة",oldText);

      if(newText === null) return;

      sendWS({
        type:"edit",
        id:messageId,
        text:newText
      });
    };

  });

  row.querySelectorAll("[data-delete]").forEach(button => {

    button.onclick = () => {

      const messageId = button.dataset.delete;

      sendWS({
        type:"delete",
        id:messageId
      });
    };

  });

  messagesBox.appendChild(row);

  if(scroll){
    scrollMessages();
  }
}

function scrollMessages(){
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function sendMessage(){

  if(!selectedUser){
    return;
  }

  const text = messageInput.value.trim();

  if(!text){
    return;
  }

  sendWS({
    type:"message",
    to:selectedUser,
    text
  });

  messageInput.value = "";
  sendTyping(false);
}

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keydown",event => {

  if(event.key === "Enter" && !event.shiftKey){
    event.preventDefault();
    sendMessage();
  }

});

messageInput.addEventListener("input",() => {

  if(!selectedUser) return;

  sendTyping(true);

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    sendTyping(false);
  },1200);

});

function sendTyping(value){

  if(!selectedUser) return;

  sendWS({
    type:"typing",
    to:selectedUser,
    value:!!value
  });
}

fileInput.onchange = async () => {

  const file = fileInput.files[0];

  if(!file) return;

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    fileInput.value = "";
    return;
  }

  if(file.size > ${MAX_FILE_SIZE}){
    alert("حجم الملف أكبر من 20 ميجابايت");
    fileInput.value = "";
    return;
  }

  try{

    const form = new FormData();

    form.append("file",file);
    form.append("to",selectedUser);

    const response = await fetch("/api/upload?token=" +
      encodeURIComponent(token),{
        method:"POST",
        body:form
      });

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.error || "فشل رفع الملف");
    }

    fileInput.value = "";

  }catch(error){

    alert(error.message);

  }
};

recordBtn.onclick = async () => {

  if(isRecording){
    stopRecording();
    return;
  }

  try{

    const stream = await navigator.mediaDevices.getUserMedia({
      audio:true
    });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    isRecording = true;

    recordBtn.classList.add("recording");
    recordBtn.textContent = "⏹️";

    mediaRecorder.ondataavailable = event => {

      if(event.data.size){
        audioChunks.push(event.data);
      }

    };

    mediaRecorder.onstop = async () => {

      stream.getTracks().forEach(track => track.stop());

      const blob = new Blob(audioChunks,{
        type:mediaRecorder.mimeType || "audio/webm"
      });

      isRecording = false;
      recordBtn.classList.remove("recording");
      recordBtn.textContent = "🎙️";

      if(blob.size){
        await uploadVoice(blob);
      }

    };

    mediaRecorder.start();

  }catch{

    alert("لا يمكن استخدام الميكروفون");

  }
};

function stopRecording(){

  if(mediaRecorder && mediaRecorder.state !== "inactive"){
    mediaRecorder.stop();
  }

}

async function uploadVoice(blob){

  if(!selectedUser) return;

  try{

    const form = new FormData();

    form.append(
      "file",
      blob,
      "voice-" + Date.now() + ".webm"
    );

    form.append("to",selectedUser);

    const response = await fetch(
      "/api/upload?token=" +
      encodeURIComponent(token),
      {
        method:"POST",
        body:form
      }
    );

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.error || "فشل إرسال التسجيل");
    }

  }catch(error){

    alert(error.message);

  }
}

function connectWS(){

  if(!token) return;

  if(ws &&
     (ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING)){
    return;
  }

  const protocol =
    location.protocol === "https:" ? "wss:" : "ws:";

  ws = new WebSocket(
    protocol +
    "//" +
    location.host +
    "/ws?token=" +
    encodeURIComponent(token)
  );

  ws.onopen = () => {

    clearTimeout(reconnectTimer);

    loadUsers();

  };

  ws.onmessage = event => {

    try{

      const data = JSON.parse(event.data);

      handleWSMessage(data);

    }catch{}

  };

  ws.onclose = () => {

    ws = null;

    if(token){

      clearTimeout(reconnectTimer);

      reconnectTimer = setTimeout(() => {
        connectWS();
      },2000);

    }

  };

  ws.onerror = () => {
    try{
      ws.close();
    }catch{}
  };
}

function sendWS(data){

  if(!ws || ws.readyState !== WebSocket.OPEN){

    connectWS();

    setTimeout(() => {

      if(ws && ws.readyState === WebSocket.OPEN){
        ws.send(JSON.stringify(data));
      }

    },500);

    return;
  }

  ws.send(JSON.stringify(data));
}

function handleWSMessage(data){

  if(data.type === "message"){

    const message = data.message || data;

    const sender = message.sender || message.from;
    const receiver = message.receiver || message.to;

    if(
      selectedUser &&
      (
        (sender === currentUser && receiver === selectedUser) ||
        (sender === selectedUser && receiver === currentUser)
      )
    ){
      addMessageToUI(message);
    }

    loadUsers();
    return;
  }

  if(data.type === "edit"){

    const row =
      document.querySelector(
        '[data-message-id="' +
        CSS.escape(String(data.id)) +
        '"]'
      );

    if(row){

      const text =
        row.querySelector(".message-text");

      if(text){
        text.textContent = data.text || "";
      }
    }

    return;
  }

  if(data.type === "delete"){

    const row =
      document.querySelector(
        '[data-message-id="' +
        CSS.escape(String(data.id)) +
        '"]'
      );

    if(row){
      row.remove();
    }

    return;
  }

  if(data.type === "typing"){

    if(data.from === selectedUser){

      typingBox.textContent =
        data.value ? "يكتب الآن..." : "";

    }

    return;
  }

  if(data.type === "users"){

    renderUsers(data.users || []);
    return;
  }

  if(data.type === "call"){

    handleIncomingCall(data);
    return;
  }

  if(data.type === "offer" ||
     data.type === "answer" ||
     data.type === "ice" ||
     data.type === "hangup"){

    handleCallSignal(data);
    return;
  }

}

async function startCall(video){

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    return;
  }

  try{

    localStream =
      await navigator.mediaDevices.getUserMedia({
        audio:true,
        video
      });

    showCallScreen(video);

    createPeerConnection();

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track,localStream);
    });

    const offer =
      await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    sendWS({
      type:"call",
      to:selectedUser,
      video,
      offer
    });

  }catch{

    alert("تعذر بدء المكالمة. تأكد من السماح للكاميرا والميكروفون.");

  }
}

$("audioCallBtn").onclick = () => startCall(false);
$("videoCallBtn").onclick = () => startCall(true);

function createPeerConnection(){

  peerConnection =
    new RTCPeerConnection({
      iceServers:[
        {urls:"stun:stun.l.google.com:19302"},
        {urls:"stun:stun1.l.google.com:19302"}
      ]
    });

  peerConnection.onicecandidate = event => {

    if(event.candidate){

      sendWS({
        type:"ice",
        to:selectedUser,
        candidate:event.candidate
      });

    }

  };

  peerConnection.ontrack = event => {

    if(event.streams && event.streams[0]){
      remoteVideo.srcObject = event.streams[0];
    }

  };

  peerConnection.onconnectionstatechange = () => {

    if(
      peerConnection &&
      ["failed","closed","disconnected"].includes(
        peerConnection.connectionState
      )
    ){
      endCall(false);
    }

  };

  if(localStream){
    localVideo.srcObject = localStream;
  }
}

function showCallScreen(video){

  callScreen.classList.remove("hidden");

  if(!video){
    localVideo.style.display = "none";
  }else{
    localVideo.style.display = "block";
  }

}

function handleIncomingCall(data){

  incomingCallData = data;

  incomingText.textContent =
    "مكالمة من " + (data.from || "مستخدم");

  incomingCall.classList.remove("hidden");
}

$("rejectCallBtn").onclick = () => {

  if(incomingCallData){

    sendWS({
      type:"hangup",
      to:incomingCallData.from
    });

  }

  incomingCallData = null;
  incomingCall.classList.add("hidden");
};

$("acceptCallBtn").onclick = async () => {

  if(!incomingCallData) return;

  const data = incomingCallData;

  incomingCallData = null;
  incomingCall.classList.add("hidden");

  selectedUser = data.from;

  try{

    localStream =
      await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:!!data.video
      });

    showCallScreen(!!data.video);

    createPeerConnection();

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track,localStream);
    });

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    sendWS({
      type:"answer",
      to:data.from,
      answer
    });

  }catch{

    alert("تعذر قبول المكالمة");
    endCall(false);

  }
};

async function handleCallSignal(data){

  try{

    if(data.type === "offer"){
      return;
    }

    if(!peerConnection){
      return;
    }

    if(data.type === "answer"){

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

    }else if(data.type === "ice"){

      if(data.candidate){

        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );

      }

    }else if(data.type === "hangup"){

      endCall(false);

    }

  }catch{}

}

function endCall(sendSignal = true){

  if(sendSignal && selectedUser){

    sendWS({
      type:"hangup",
      to:selectedUser
    });

  }

  if(peerConnection){

    try{
      peerConnection.close();
    }catch{}

    peerConnection = null;
  }

  if(localStream){

    localStream.getTracks().forEach(track => {
      try{
        track.stop();
      }catch{}
    });

    localStream = null;
  }

  localVideo.srcObject = null;
  remoteVideo.srcObject = null;

  callScreen.classList.add("hidden");
}

$("endCallBtn").onclick = () => endCall(true);

$("muteBtn").onclick = () => {

  if(!localStream) return;

  const track =
    localStream.getAudioTracks()[0];

  if(!track) return;

  track.enabled = !track.enabled;

  $("muteBtn").textContent =
    track.enabled ? "🎤" : "🔇";
};

$("cameraBtn").onclick = () => {

  if(!localStream) return;

  const track =
    localStream.getVideoTracks()[0];

  if(!track) return;

  track.enabled = !track.enabled;

  $("cameraBtn").textContent =
    track.enabled ? "📷" : "🚫";
};

$("settingsBtn").onclick = () => {

  $("settingsUsername").textContent = currentUser;

  $("settingsModal").classList.remove("hidden");

};

$("closeSettings").onclick = () => {
  $("settingsModal").classList.add("hidden");
};

$("darkMode").checked =
  localStorage.getItem("darkMode") === "1";

function applyDarkMode(){

  document.body.classList.toggle(
    "dark",
    $("darkMode").checked
  );

  localStorage.setItem(
    "darkMode",
    $("darkMode").checked ? "1" : "0"
  );
}

$("darkMode").onchange = applyDarkMode;

applyDarkMode();

$("deleteAccountBtn").onclick = async () => {

  try{

    const response = await fetch(
      "/api/delete-account",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({token})
      }
    );

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.error || "فشل حذف الحساب");
    }

    await logout();

  }catch(error){

    alert(error.message);

  }

};

$("logoutBtn").onclick = logout;

async function logout(){

  try{

    if(token){

      await fetch("/api/logout",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({token})
      });

    }

  }catch{}

  token = "";
  currentUser = "";
  selectedUser = "";

  localStorage.removeItem("chatToken");
  localStorage.removeItem("chatUser");

  if(ws){

    try{
      ws.close();
    }catch{}

    ws = null;
  }

  endCall(false);

  messagesBox.innerHTML =
    '<div class="empty-chat">اختر مستخدمًا لبدء المحادثة</div>';

  chatTitle.textContent = "اختر مستخدمًا";
  chatAvatar.textContent = "?";

  showAuth();
}

restoreSession();
</script>

</body>
</html>`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

async function hashPassword(password, salt) {

  const encoder = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    256
  );

  return new Uint8Array(bits);
}

function bytesToBase64(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function verifyPassword(password, saltBase64, hashBase64) {

  const salt = base64ToBytes(saltBase64);

  const calculated = await hashPassword(password, salt);

  const expected = base64ToBytes(hashBase64);

  if (calculated.length !== expected.length) {
    return false;
  }

  let difference = 0;

  for (let i = 0; i < calculated.length; i++) {
    difference |= calculated[i] ^ expected[i];
  }

  return difference === 0;
}

function safeJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    try {

      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(HTML, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store"
          }
        });
      }

      // مهم: اسم الـ binding في wrangler.jsonc هو CHAT_ROOM
      const id = env.CHAT_ROOM.idFromName("main");
      const room = env.CHAT_ROOM.get(id);

      const response = await room.fetch(request);

      return cors(response);

    } catch (error) {

      return cors(
        json({
          error: error?.message || "Server error"
        }, 500)
      );

    }
  }
};

export class ChatRoom extends DurableObject {

  constructor(ctx, env) {
    super(ctx, env);

    this.ctx = ctx;
    this.env = env;
    this.sessions = new Map();

    this.ensureSchema();
  }

  ensureSchema() {

    try {

      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
          username TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);

      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          expires_at INTEGER NOT NULL
        )
      `);

      this.ctx.storage.sql.exec(`
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

      this.ctx.storage.sql.exec(`
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

    } catch (error) {
      console.error("schema error", error);
    }
  }

  async fetch(request) {

    this.ensureSchema();

    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      return this.handleWebSocket(request, url);
    }

    if (url.pathname === "/api/register") {
      return this.register(request);
    }

    if (url.pathname === "/api/login") {
      return this.login(request);
    }

    if (url.pathname === "/api/me") {
      return this.me(url);
    }

    if (url.pathname === "/api/logout") {
      return this.logout(request);
    }

    if (url.pathname === "/api/users") {
      return this.users(url);
    }

    if (url.pathname === "/api/history") {
      return this.history(url);
    }

    if (url.pathname === "/api/upload") {
      return this.upload(request, url);
    }

    if (url.pathname === "/api/file") {
      return this.file(url);
    }

    if (url.pathname === "/api/delete-account") {
      return this.deleteAccount(request);
    }

    return new Response("Not Found", { status: 404 });
  }

  async register(request) {

    let body;

    try {
      body = await request.json();
    } catch {
      return json({ error: "بيانات غير صحيحة" }, 400);
    }

    const usernameRaw = String(body.username || "").trim();
    const username = normalizeUsername(usernameRaw);
    const password = String(body.password || "");

    if (!username || username.length < 3) {
      return json({
        error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"
      }, 400);
    }

    if (!/^[a-zA-Z0-9_\u0600-\u06FF]+$/.test(username)) {
      return json({
        error: "اسم المستخدم يحتوي على رموز غير مسموحة"
      }, 400);
    }

    if (password.length < 4) {
      return json({
        error: "كلمة المرور قصيرة جدًا"
      }, 400);
    }

    const existing = this.ctx.storage.sql
      .exec(
        `SELECT username FROM accounts WHERE username = ?`,
        username
      )
      .toArray();

    if (existing.length) {
      return json({
        error: "اسم المستخدم موجود بالفعل"
      }, 409);
    }

    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const hash = await hashPassword(password, salt);

    const createdAt = Date.now();

    try {

      this.ctx.storage.sql.exec(
        `
        INSERT INTO accounts
        (username,password_hash,salt,created_at)
        VALUES (?,?,?,?)
        `,
        username,
        bytesToBase64(hash),
        bytesToBase64(salt),
        createdAt
      );

    } catch (error) {

      return json({
        error: "تعذر إنشاء الحساب: " + error.message
      }, 500);
    }

    const token = randomToken();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO sessions
      (token,username,expires_at)
      VALUES (?,?,?)
      `,
      token,
      username,
      SESSION_FOREVER
    );

    return json({
      ok: true,
      username,
      token
    });
  }

  async login(request) {

    let body;

    try {
      body = await request.json();
    } catch {
      return json({ error: "بيانات غير صحيحة" }, 400);
    }

    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    const rows = this.ctx.storage.sql
      .exec(
        `
        SELECT username,password_hash,salt
        FROM accounts
        WHERE username = ?
        `,
        username
      )
      .toArray();

    if (!rows.length) {
      return json({
        error: "اسم المستخدم أو كلمة المرور غير صحيحة"
      }, 401);
    }

    const account = rows[0];

    let valid = false;

    try {

      valid = await verifyPassword(
        password,
        account.salt,
        account.password_hash
      );

    } catch {
      valid = false;
    }

    if (!valid) {
      return json({
        error: "اسم المستخدم أو كلمة المرور غير صحيحة"
      }, 401);
    }

    const token = randomToken();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO sessions
      (token,username,expires_at)
      VALUES (?,?,?)
      `,
      token,
      account.username,
      SESSION_FOREVER
    );

    return json({
      ok: true,
      username: account.username,
      token
    });
  }

  getUser(token) {

    if (!token) return null;

    const rows = this.ctx.storage.sql
      .exec(
        `
        SELECT
          sessions.token,
          sessions.username,
          sessions.expires_at
        FROM sessions
        INNER JOIN accounts
          ON accounts.username = sessions.username
        WHERE sessions.token = ?
        `,
        token
      )
      .toArray();

    if (!rows.length) {
      return null;
    }

    const session = rows[0];

    if (
      session.expires_at &&
      Number(session.expires_at) < Date.now()
    ) {
      this.ctx.storage.sql.exec(
        `DELETE FROM sessions WHERE token = ?`,
        token
      );

      return null;
    }

    return session.username;
  }

  async me(url) {

    const token = url.searchParams.get("token");
    const username = this.getUser(token);

    if (!username) {
      return json({
        error: "الجلسة غير صالحة"
      }, 401);
    }

    return json({
      ok: true,
      username
    });
  }

  async logout(request) {

    let body = {};

    try {
      body = await request.json();
    } catch {}

    const token = body.token;

    if (token) {

      const username = this.getUser(token);

      this.ctx.storage.sql.exec(
        `DELETE FROM sessions WHERE token = ?`,
        token
      );

      if (username) {
        this.removeSessionSockets(username);
      }
    }

    return json({ ok: true });
  }

  async users(url) {

    const token = url.searchParams.get("token");
    const current = this.getUser(token);

    if (!current) {
      return json({
        error: "الجلسة غير صالحة"
      }, 401);
    }

    const rows = this.ctx.storage.sql
      .exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username COLLATE NOCASE
        `
      )
      .toArray();

    const onlineUsers = new Set(
      Array.from(this.sessions.keys())
    );

    const users = rows.map(row => ({
      username: row.username,
      online: onlineUsers.has(row.username)
    }));

    return json(users);
  }

  async history(url) {

    const token = url.searchParams.get("token");
    const current = this.getUser(token);

    if (!current) {
      return json({
        error: "الجلسة غير صالحة"
      }, 401);
    }

    const other = normalizeUsername(
      url.searchParams.get("user")
    );

    if (!other) {
      return json([]);
    }

    const rows = this.ctx.storage.sql
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
          (sender = ? AND receiver = ?)
          OR
          (sender = ? AND receiver = ?)
        ORDER BY created_at ASC
        LIMIT 1000
        `,
        current,
        other,
        other,
        current
      )
      .toArray();

    return json(rows);
  }

  async upload(request, url) {

    const token = url.searchParams.get("token");
    const current = this.getUser(token);

    if (!current) {
      return json({
        error: "الجلسة غير صالحة"
      }, 401);
    }

    const form = await request.formData();

    const file = form.get("file");
    const to = normalizeUsername(form.get("to"));

    if (!(file instanceof File)) {
      return json({
        error: "لم يتم إرسال ملف"
      }, 400);
    }

    if (!to) {
      return json({
        error: "المستلم غير موجود"
      }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return json({
        error: "حجم الملف أكبر من 20 ميجابايت"
      }, 400);
    }

    const account = this.ctx.storage.sql
      .exec(
        `SELECT username FROM accounts WHERE username = ?`,
        to
      )
      .toArray();

    if (!account.length) {
      return json({
        error: "المستخدم غير موجود"
      }, 404);
    }

    const id = randomToken();

    const buffer = await file.arrayBuffer();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO files
      (id,owner,receiver,name,mime,data,created_at)
      VALUES (?,?,?,?,?,?,?)
      `,
      id,
      current,
      to,
      file.name || "file",
      file.type || "application/octet-stream",
      new Uint8Array(buffer),
      Date.now()
    );

    const messageId = randomToken();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO messages
      (id,sender,receiver,text,file_id,file_name,mime,created_at,edited)
      VALUES (?,?,?,?,?,?,?,?,?)
      `,
      messageId,
      current,
      to,
      "",
      id,
      file.name || "file",
      file.type || "application/octet-stream",
      Date.now(),
      0
    );

    const message = {
      id: messageId,
      sender: current,
      receiver: to,
      text: "",
      file_id: id,
      file_name: file.name || "file",
      mime: file.type || "application/octet-stream",
      created_at: Date.now(),
      edited: 0
    };

    this.sendToUser(current, {
      type: "message",
      message
    });

    this.sendToUser(to, {
      type: "message",
      message
    });

    return json({
      ok: true,
      id,
      messageId
    });
  }

  async file(url) {

    const token = url.searchParams.get("token");
    const current = this.getUser(token);

    if (!current) {
      return new Response("Unauthorized", {
        status: 401
      });
    }

    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing file", {
        status: 400
      });
    }

    const rows = this.ctx.storage.sql
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

    if (!rows.length) {
      return new Response("File not found", {
        status: 404
      });
    }

    const file = rows[0];

    if (
      file.owner !== current &&
      file.receiver !== current
    ) {
      return new Response("Forbidden", {
        status: 403
      });
    }

    return new Response(file.data, {
      headers: {
        "Content-Type":
          file.mime || "application/octet-stream",
        "Content-Disposition":
          \`inline; filename*=UTF-8''\${encodeURIComponent(file.name)}\`
      }
    });
  }

  async deleteAccount(request) {

    let body = {};

    try {
      body = await request.json();
    } catch {}

    const token = body.token;
    const username = this.getUser(token);

    if (!username) {
      return json({
        error: "الجلسة غير صالحة"
      }, 401);
    }

    try {

      this.ctx.storage.sql.exec(
        `DELETE FROM sessions WHERE username = ?`,
        username
      );

      this.ctx.storage.sql.exec(
        `
        DELETE FROM files
        WHERE owner = ? OR receiver = ?
        `,
        username,
        username
      );

      this.ctx.storage.sql.exec(
        `
        DELETE FROM messages
        WHERE sender = ? OR receiver = ?
        `,
        username,
        username
      );

      this.ctx.storage.sql.exec(
        `
        DELETE FROM accounts
        WHERE username = ?
        `,
        username
      );

      this.removeSessionSockets(username);

      return json({
        ok: true
      });

    } catch (error) {

      return json({
        error: "تعذر حذف الحساب: " + error.message
      }, 500);
    }
  }

  async handleWebSocket(request, url) {

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", {
        status: 426
      });
    }

    const token = url.searchParams.get("token");
    const username = this.getUser(token);

    if (!username) {
      return new Response("Unauthorized", {
        status: 401
      });
    }

    const pair = new WebSocketPair();

    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    server.serializeAttachment({
      username,
      token
    });

    if (!this.sessions.has(username)) {
      this.sessions.set(username, new Set());
    }

    this.sessions.get(username).add(server);

    this.broadcastUsers();

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(socket, message) {

    let data;

    try {

      data =
        typeof message === "string"
          ? JSON.parse(message)
          : JSON.parse(new TextDecoder().decode(message));

    } catch {

      return;
    }

    const attachment = socket.deserializeAttachment();
    const username = attachment?.username;

    if (!username) return;

    if (data.type === "message") {

      await this.handleMessage(socket, username, data);
      return;
    }

    if (data.type === "typing") {

      this.sendToUser(data.to, {
        type: "typing",
        from: username,
        value: !!data.value
      });

      return;
    }

    if (data.type === "edit") {

      await this.editMessage(username, data);
      return;
    }

    if (data.type === "delete") {

      await this.deleteMessage(username, data);
      return;
    }

    if (
      data.type === "call" ||
      data.type === "offer" ||
      data.type === "answer" ||
      data.type === "ice" ||
      data.type === "hangup"
    ) {

      this.forwardCall(username, data);
      return;
    }
  }

  async webSocketClose(socket) {

    this.removeSocket(socket);
    this.broadcastUsers();
  }

  async webSocketError(socket) {

    this.removeSocket(socket);
    this.broadcastUsers();
  }

  removeSocket(socket) {

    const attachment = socket.deserializeAttachment();
    const username = attachment?.username;

    if (!username) return;

    const set = this.sessions.get(username);

    if (!set) return;

    set.delete(socket);

    if (!set.size) {
      this.sessions.delete(username);
    }
  }

  removeSessionSockets(username) {

    const set = this.sessions.get(username);

    if (!set) return;

    for (const socket of set) {

      try {
        socket.close(1000, "logout");
      } catch {}
    }

    this.sessions.delete(username);
  }

  async handleMessage(socket, sender, data) {

    const receiver = normalizeUsername(data.to);
    const text = String(data.text || "");

    if (!receiver) return;

    if (!text.trim()) return;

    const account = this.ctx.storage.sql
      .exec(
        `SELECT username FROM accounts WHERE username = ?`,
        receiver
      )
      .toArray();

    if (!account.length) {
      return;
    }

    const id = randomToken();
    const now = Date.now();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO messages
      (id,sender,receiver,text,file_id,file_name,mime,created_at,edited)
      VALUES (?,?,?,?,?,?,?,?,?)
      `,
      id,
      sender,
      receiver,
      text,
      null,
      null,
      null,
      now,
      0
    );

    const message = {
      id,
      sender,
      receiver,
      text,
      file_id: null,
      file_name: null,
      mime: null,
      created_at: now,
      edited: 0
    };

    this.sendToUser(sender, {
      type: "message",
      message
    });

    this.sendToUser(receiver, {
      type: "message",
      message
    });
  }

  async editMessage(username, data) {

    const id = String(data.id || "");
    const text = String(data.text || "");

    if (!id) return;

    const rows = this.ctx.storage.sql
      .exec(
        `
        SELECT sender,receiver
        FROM messages
        WHERE id = ?
        `,
        id
      )
      .toArray();

    if (!rows.length) return;

    const message = rows[0];

    if (message.sender !== username) {
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
      type: "edit",
      id,
      text
    };

    this.sendToUser(message.sender, payload);
    this.sendToUser(message.receiver, payload);
  }

  async deleteMessage(username, data) {

    const id = String(data.id || "");

    if (!id) return;

    const rows = this.ctx.storage.sql
      .exec(
        `
        SELECT sender,receiver,file_id
        FROM messages
        WHERE id = ?
        `,
        id
      )
      .toArray();

    if (!rows.length) return;

    const message = rows[0];

    if (message.sender !== username) {
      return;
    }

    if (message.file_id) {

      this.ctx.storage.sql.exec(
        `DELETE FROM files WHERE id = ?`,
        message.file_id
      );
    }

    this.ctx.storage.sql.exec(
      `DELETE FROM messages WHERE id = ?`,
      id
    );

    const payload = {
      type: "delete",
      id
    };

    this.sendToUser(message.sender, payload);
    this.sendToUser(message.receiver, payload);
  }

  forwardCall(username, data) {

    const receiver = normalizeUsername(data.to);

    if (!receiver) return;

    this.sendToUser(receiver, {
      ...data,
      from: username
    });
  }

  sendToUser(username, data) {

    const set = this.sessions.get(
      normalizeUsername(username)
    );

    if (!set) return;

    const text = JSON.stringify(data);

    for (const socket of set) {

      try {
        socket.send(text);
      } catch {
        this.removeSocket(socket);
      }
    }
  }

  broadcastUsers() {

    const rows = this.ctx.storage.sql
      .exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username COLLATE NOCASE
        `
      )
      .toArray();

    const online = new Set(
      Array.from(this.sessions.keys())
    );

    const users = rows.map(row => ({
      username: row.username,
      online: online.has(row.username)
    }));

    const data = JSON.stringify({
      type: "users",
      users
    });

    for (const set of this.sessions.values()) {

      for (const socket of set) {

        try {
          socket.send(data);
        } catch {
          this.removeSocket(socket);
        }
      }
    }
  }
}
