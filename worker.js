import { DurableObject } from "cloudflare:workers";

/* =========================================================
   إعدادات
========================================================= */

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SESSION_FOREVER = 9999999999999;
const PBKDF2_ITERATIONS = 100000;
const CHUNK_SIZE = 64 * 1024;

/* =========================================================
   HTML
========================================================= */

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>دردشة</title>

<style>
*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent
}

:root{
  --green:#075e54;
  --green2:#128c7e;
  --light:#e5ddd5;
  --white:#fff;
  --text:#222;
  --muted:#777;
  --danger:#d32f2f;
  --border:#ddd
}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:var(--light);
  color:var(--text)
}

button{
  border:0;
  border-radius:10px;
  padding:10px 14px;
  background:var(--green2);
  color:#fff;
  font-size:15px;
  cursor:pointer
}

button:disabled{
  opacity:.5;
  cursor:not-allowed
}

input{
  width:100%;
  padding:12px;
  border:1px solid #ccc;
  border-radius:10px;
  font-size:16px;
  outline:none
}

input:focus{
  border-color:var(--green2)
}

.auth{
  max-width:420px;
  margin:60px auto;
  background:#fff;
  padding:25px;
  border-radius:18px;
  box-shadow:0 5px 25px #0002
}

.auth h1{
  text-align:center;
  margin-top:0
}

.error{
  color:#c00;
  min-height:22px;
  margin-top:10px;
  text-align:center
}

#app{
  display:none;
  height:100vh;
  overflow:hidden
}

.layout{
  display:flex;
  height:100vh
}

.sidebar{
  width:310px;
  background:#fff;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
  z-index:10
}

.sideHeader{
  background:var(--green);
  color:#fff;
  padding:15px;
  font-size:20px;
  font-weight:bold;
  display:flex;
  justify-content:space-between;
  align-items:center
}

.sideButtons{
  display:flex;
  gap:5px
}

.sideButtons button{
  background:#ffffff22;
  padding:8px 10px
}

.searchBox{
  padding:9px;
  background:#f5f5f5
}

#userList{
  overflow:auto;
  flex:1
}

.user{
  padding:13px;
  border-bottom:1px solid #eee;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:10px
}

.user:hover{
  background:#f4f4f4
}

.user.selected{
  background:#e8f5f3
}

.avatar{
  width:43px;
  height:43px;
  border-radius:50%;
  background:var(--green2);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:bold;
  flex:none
}

.userInfo{
  min-width:0;
  flex:1
}

.userName{
  font-weight:bold;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis
}

.userLast{
  font-size:12px;
  color:#777;
  margin-top:3px
}

.dot{
  width:9px;
  height:9px;
  border-radius:50%;
  background:#aaa;
  flex:none
}

.dot.online{
  background:#18a558
}

.chat{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  position:relative;
  background:var(--light)
}

.chatHeader{
  min-height:65px;
  background:var(--green);
  color:#fff;
  display:flex;
  align-items:center;
  padding:9px 12px;
  gap:10px
}

.backBtn{
  display:none;
  background:#ffffff22;
  padding:8px 10px
}

.chatTitle{
  flex:1;
  min-width:0
}

.chatName{
  font-weight:bold;
  font-size:17px
}

.chatStatus{
  font-size:12px;
  opacity:.85;
  margin-top:3px
}

.callButtons{
  display:flex;
  gap:5px
}

.callButtons button{
  background:#ffffff22;
  font-size:19px;
  padding:7px 10px
}

#messages{
  flex:1;
  overflow:auto;
  padding:15px;
  scroll-behavior:smooth
}

.empty{
  text-align:center;
  color:#777;
  margin-top:30px
}

.msg{
  max-width:82%;
  padding:8px 11px;
  margin:7px 0;
  border-radius:13px;
  box-shadow:0 1px 2px #0001;
  position:relative;
  clear:both
}

.msg.mine{
  background:#dcf8c6;
  margin-right:auto;
  margin-left:0
}

.msg.theirs{
  background:#fff;
  margin-left:auto;
  margin-right:0
}

.msg.deleted{
  color:#888;
  font-style:italic
}

.msgText{
  white-space:pre-wrap;
  word-break:break-word
}

.msgMeta{
  font-size:10px;
  color:#777;
  margin-top:4px;
  display:flex;
  gap:5px;
  align-items:center
}

.read{
  color:#1677ff
}

.msgActions{
  display:flex;
  gap:4px;
  margin-top:5px
}

.msgActions button{
  font-size:11px;
  padding:4px 7px;
  background:#0001;
  color:#333
}

.filePreview{
  max-width:280px;
  margin-top:6px;
  border-radius:10px;
  overflow:hidden
}

.filePreview img,
.filePreview video{
  max-width:100%;
  display:block
}

.fileLink{
  display:inline-block;
  margin-top:5px;
  color:var(--green);
  font-weight:bold
}

.audio{
  width:250px;
  max-width:100%
}

#typing{
  min-height:20px;
  padding:0 15px;
  color:#777;
  font-size:12px
}

#bar{
  background:#fff;
  border-top:1px solid #ddd;
  padding:8px;
  display:flex;
  gap:6px;
  align-items:center
}

.round{
  width:44px;
  height:44px;
  padding:0;
  border-radius:50%;
  flex:none
}

#messageInput{
  flex:1;
  margin:0
}

.progress{
  position:absolute;
  bottom:70px;
  left:15px;
  right:15px;
  background:#fff;
  padding:10px;
  border-radius:10px;
  box-shadow:0 2px 15px #0003;
  display:none;
  text-align:center;
  z-index:30
}

.modal{
  position:fixed;
  inset:0;
  background:#0008;
  display:none;
  align-items:center;
  justify-content:center;
  z-index:100
}

.modalBox{
  width:min(94%,500px);
  max-height:92vh;
  overflow:auto;
  background:#fff;
  border-radius:18px;
  padding:20px;
  box-shadow:0 10px 40px #0006
}

.modalTitle{
  font-size:20px;
  font-weight:bold;
  margin-bottom:15px
}

.modalActions{
  display:flex;
  gap:8px;
  margin-top:15px
}

.modalActions button{
  flex:1
}

.danger{
  background:var(--danger)
}

.secondary{
  background:#777
}

#callModal{
  background:#061b19ee
}

.callBox{
  width:min(96%,700px);
  background:#0d2d2a;
  color:#fff;
  border-radius:18px;
  padding:15px;
  text-align:center
}

.videoArea{
  position:relative;
  background:#000;
  border-radius:15px;
  overflow:hidden;
  min-height:280px
}

#remoteVideo{
  width:100%;
  height:55vh;
  max-height:600px;
  object-fit:contain;
  background:#000
}

#localVideo{
  position:absolute;
  width:150px;
  height:110px;
  object-fit:cover;
  left:12px;
  bottom:12px;
  border:2px solid #fff;
  border-radius:10px;
  background:#222
}

#callRemoteAudio{
  display:none
}

.callInfo{
  padding:10px
}

.callControls{
  display:flex;
  justify-content:center;
  gap:10px
}

.callControls button{
  border-radius:50%;
  width:55px;
  height:55px;
  padding:0;
  font-size:20px
}

.callControls .hang{
  background:#d32f2f
}

.incomingButtons{
  display:flex;
  gap:10px
}

.incomingButtons button{
  flex:1
}

.settingsRow{
  padding:12px 0;
  border-bottom:1px solid #eee;
  display:flex;
  justify-content:space-between;
  align-items:center
}

.dark{
  --light:#101716;
  --white:#18201f;
  --text:#eee;
  --muted:#aaa;
  --border:#333
}

.dark .sidebar,
.dark .top,
.dark #bar,
.dark .searchBox,
.dark .modalBox{
  background:#18201f;
  color:#eee
}

.dark .user:hover,
.dark .user.selected{
  background:#243432
}

.dark .msg.theirs{
  background:#243432;
  color:#eee
}

.dark input{
  background:#202a28;
  color:#eee;
  border-color:#444
}

.dark .msgActions button{
  color:#eee
}

@media(max-width:700px){
  .sidebar{
    width:100%
  }

  .chat{
    display:none
  }

  .layout.chatOpen .sidebar{
    display:none
  }

  .layout.chatOpen .chat{
    display:flex
  }

  .backBtn{
    display:block
  }

  .msg{
    max-width:90%
  }
}

@media(min-width:701px){
  .sidebar{
    display:flex!important
  }
}
</style>
</head>

<body>

<div id="auth">
  <div class="auth">
    <h1>💬 دردشة</h1>

    <input id="username"
      placeholder="اسم المستخدم"
      autocomplete="username">

    <input id="password"
      type="password"
      placeholder="كلمة المرور"
      autocomplete="current-password">

    <button id="registerBtn" style="width:100%">
      إنشاء حساب
    </button>

    <br><br>

    <button id="loginBtn" style="width:100%">
      تسجيل الدخول
    </button>

    <div id="authMsg" class="error"></div>
  </div>
</div>

<div id="app">

  <div class="layout" id="layout">

    <aside class="sidebar">

      <div class="sideHeader">
        <span>💬 الدردشة</span>

        <div class="sideButtons">
          <button id="settingsBtn">⚙️</button>
          <button id="logoutBtn">خروج</button>
        </div>
      </div>

      <div class="searchBox">
        <input id="userSearch" placeholder="🔎 البحث عن مستخدم">
      </div>

      <div id="userList"></div>

    </aside>

    <main class="chat">

      <header class="chatHeader">

        <button class="backBtn" id="backBtn">‹</button>

        <div class="avatar" id="chatAvatar">?</div>

        <div class="chatTitle">
          <div class="chatName" id="chatName">
            اختر مستخدمًا
          </div>

          <div class="chatStatus" id="chatStatus">
            لبدء محادثة اختر مستخدمًا
          </div>
        </div>

        <div class="callButtons">
          <button id="audioCallBtn" title="مكالمة صوتية">📞</button>
          <button id="videoCallBtn" title="مكالمة فيديو">📹</button>
        </div>

      </header>

      <div id="messages">
        <div class="empty">
          اختر مستخدمًا لبدء المحادثة 💬
        </div>
      </div>

      <div id="typing"></div>

      <div id="progress" class="progress"></div>

      <div id="bar">

        <input id="fileInput" type="file" hidden>

        <button id="fileBtn"
          class="round"
          title="ملف">
          📎
        </button>

        <button id="imageBtn"
          class="round"
          title="صورة">
          🖼️
        </button>

        <button id="videoBtn"
          class="round"
          title="فيديو">
          🎥
        </button>

        <button id="recordBtn"
          class="round"
          title="رسالة صوتية">
          🎙️
        </button>

        <input id="messageInput"
          placeholder="اكتب رسالة..."
          autocomplete="off">

        <button id="sendBtn" class="round">
          ➤
        </button>

      </div>

    </main>

  </div>

</div>

<!-- SETTINGS -->

<div class="modal" id="settingsModal">

  <div class="modalBox">

    <div class="modalTitle">
      ⚙️ الإعدادات
    </div>

    <div class="settingsRow">
      <span>🌙 الوضع الداكن</span>
      <button id="darkBtn">تبديل</button>
    </div>

    <div class="settingsRow">
      <span>🔔 الإشعارات</span>
      <button id="notifyBtn">السماح</button>
    </div>

    <div class="settingsRow">
      <span>👤 اسم المستخدم</span>
      <b id="settingsUser"></b>
    </div>

    <div class="settingsRow">
      <span>🗑️ حذف الحساب</span>
      <button id="deleteAccountBtn" class="danger">
        حذف الحساب
      </button>
    </div>

    <div class="modalActions">
      <button id="closeSettings" class="secondary">
        إغلاق
      </button>
    </div>

  </div>

</div>

<!-- INCOMING CALL -->

<div class="modal" id="incomingCallModal">

  <div class="modalBox">

    <div class="modalTitle">
      📞 مكالمة واردة
    </div>

    <div id="incomingCallText"></div>

    <div class="incomingButtons">
      <button id="acceptCallBtn">
        قبول 📞
      </button>

      <button id="rejectCallBtn" class="danger">
        رفض ❌
      </button>
    </div>

  </div>

</div>

<!-- ACTIVE CALL -->

<div class="modal" id="callModal">

  <div class="callBox">

    <div class="videoArea">

      <video id="remoteVideo"
        autoplay
        playsinline></video>

      <video id="localVideo"
        autoplay
        muted
        playsinline></video>

      <audio id="callRemoteAudio"
        autoplay></audio>

    </div>

    <div class="callInfo">
      <div id="callTitle">مكالمة</div>
      <div id="callStatus">جاري الاتصال...</div>
    </div>

    <div class="callControls">

      <button id="muteBtn">
        🎙️
      </button>

      <button id="cameraBtn">
        📹
      </button>

      <button id="hangupBtn" class="hang">
        ☎️
      </button>

    </div>

  </div>

</div>

<script>

/* =========================================================
   عناصر
========================================================= */

const $ = id => document.getElementById(id);

const auth = $("auth");
const app = $("app");
const layout = $("layout");

const usernameInput = $("username");
const passwordInput = $("password");
const authMsg = $("authMsg");

const userList = $("userList");
const userSearch = $("userSearch");

const messages = $("messages");
const messageInput = $("messageInput");
const typingBox = $("typing");

const chatName = $("chatName");
const chatStatus = $("chatStatus");
const chatAvatar = $("chatAvatar");

const progress = $("progress");

let token = localStorage.getItem("chatToken") || "";
let currentUser = localStorage.getItem("chatUser") || "";

let selectedUser = "";
let selectedUserOnline = false;

let ws = null;
let reconnectTimer = null;

let users = [];

let typingTimer = null;

let editingMessageId = null;

let mediaRecorder = null;
let audioChunks = [];
let recording = false;

/* =========================================================
   WEBRTC
========================================================= */

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" }
  ]
};

let callPC = null;
let callLocalStream = null;
let callRemoteStream = null;
let callTarget = "";
let callType = "";
let callPendingCandidates = [];
let incomingCallData = null;

/* =========================================================
   FILE TRANSFERS
========================================================= */

const fileTransfersSend = new Map();
const fileTransfersReceive = new Map();

/* =========================================================
   أدوات
========================================================= */

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}

function showAuthError(text){
  authMsg.textContent = text || "";
}

function showProgress(text){
  progress.style.display = "block";
  progress.textContent = text;
}

function hideProgress(){
  progress.style.display = "none";
}

function escapeText(text){
  return String(text || "");
}

/* =========================================================
   API
========================================================= */

async function api(path, body, method="POST"){

  try{

    const options = {
      method,
      headers:{
        "content-type":"application/json"
      }
    };

    if(body !== undefined){
      options.body = JSON.stringify(body);
    }

    const response = await fetch(path,options);

    const data = await response.json().catch(() => ({}));

    return {
      ok:response.ok,
      status:response.status,
      data
    };

  }catch(error){

    return {
      ok:false,
      status:0,
      data:{
        error:"تعذر الاتصال بالخادم"
      }
    };

  }

}

/* =========================================================
   التسجيل
========================================================= */

async function register(){

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if(!/^[a-zA-Z0-9_\\u0600-\\u06FF]{3,20}$/.test(username)){
    showAuthError("اسم المستخدم: من 3 إلى 20 حرفًا أو رقمًا أو _");
    return;
  }

  if(password.length < 6){
    showAuthError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    return;
  }

  showAuthError("جاري إنشاء الحساب...");

  const r = await api("/api/register",{
    username,
    password
  });

  if(!r.ok){
    showAuthError(r.data.error || "تعذر إنشاء الحساب");
    return;
  }

  token = r.data.token;
  currentUser = r.data.username;

  localStorage.setItem("chatToken",token);
  localStorage.setItem("chatUser",currentUser);

  passwordInput.value = "";

  openApp();

}

/* =========================================================
   تسجيل الدخول
========================================================= */

async function login(){

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if(!username || !password){
    showAuthError("اكتب اسم المستخدم وكلمة المرور");
    return;
  }

  showAuthError("جاري تسجيل الدخول...");

  const r = await api("/api/login",{
    username,
    password
  });

  if(!r.ok){
    showAuthError(r.data.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
    return;
  }

  token = r.data.token;
  currentUser = r.data.username;

  localStorage.setItem("chatToken",token);
  localStorage.setItem("chatUser",currentUser);

  passwordInput.value = "";

  openApp();

}

/* =========================================================
   فتح التطبيق
========================================================= */

function openApp(){

  if(!token || !currentUser){
    return;
  }

  auth.style.display = "none";
  app.style.display = "block";

  $("settingsUser").textContent = currentUser;

  connectWebSocket();

}

/* =========================================================
   WebSocket
========================================================= */

function connectWebSocket(){

  if(!token){
    return;
  }

  try{
    if(ws){
      ws.onclose = null;
      ws.close();
    }
  }catch{}

  const protocol =
    location.protocol === "https:" ? "wss://" : "ws://";

  ws = new WebSocket(
    protocol +
    location.host +
    "/ws?token=" +
    encodeURIComponent(token)
  );

  ws.onopen = () => {

    clearTimeout(reconnectTimer);

    if(selectedUser){
      loadHistory(selectedUser);
    }

  };

  ws.onmessage = event => {

    try{

      const data = JSON.parse(event.data);

      handleSocketMessage(data);

    }catch(error){

      console.error(error);

    }

  };

  ws.onclose = () => {

    if(token){

      clearTimeout(reconnectTimer);

      reconnectTimer = setTimeout(
        connectWebSocket,
        2000
      );

    }

  };

  ws.onerror = () => {};

}

/* =========================================================
   إرسال WebSocket
========================================================= */

function sendWS(data){

  if(ws && ws.readyState === WebSocket.OPEN){

    ws.send(JSON.stringify(data));

    return true;

  }

  return false;

}

/* =========================================================
   رسائل WebSocket
========================================================= */

function handleSocketMessage(data){

  if(data.type === "users"){

    users = data.users || [];

    renderUsers();

    updateSelectedStatus();

    return;
  }

  if(data.type === "message"){

    if(
      data.sender === selectedUser ||
      data.receiver === selectedUser
    ){

      addMessageToUI(data);

      if(data.receiver === currentUser){

        sendWS({
          type:"read",
          other:data.sender
        });

      }

    }

    notifyIfNeeded(data);

    return;
  }

  if(data.type === "message_read"){

    updateReadState(data.ids || []);

    return;
  }

  if(data.type === "message_edited"){

    updateEditedMessage(data);

    return;
  }

  if(data.type === "message_deleted"){

    updateDeletedMessage(data);

    return;
  }

  if(data.type === "typing"){

    if(data.from === selectedUser){

      typingBox.textContent =
        data.active ? "يكتب الآن..." : "";

    }

    return;
  }

  if(data.type === "history"){

    renderHistory(data.messages || []);

    return;
  }

  if(data.type === "signal"){

    handleSignal(data);

    return;
  }

}

/* =========================================================
   المستخدمون
========================================================= */

function renderUsers(){

  const q = userSearch.value.trim().toLowerCase();

  userList.innerHTML = "";

  users
    .filter(u => u.username !== currentUser)
    .filter(u =>
      !q ||
      u.username.toLowerCase().includes(q)
    )
    .forEach(u => {

      const item = document.createElement("div");

      item.className =
        "user" +
        (u.username === selectedUser ? " selected" : "");

      const avatar = document.createElement("div");

      avatar.className = "avatar";

      avatar.textContent =
        u.username.slice(0,1).toUpperCase();

      const info = document.createElement("div");

      info.className = "userInfo";

      const name = document.createElement("div");

      name.className = "userName";

      name.textContent = u.username;

      const last = document.createElement("div");

      last.className = "userLast";

      last.textContent =
        u.online
          ? "متصل الآن 🟢"
          : u.last_seen
            ? "آخر ظهور " + formatLastSeen(u.last_seen)
            : "غير متصل";

      info.append(name,last);

      const dot = document.createElement("div");

      dot.className =
        "dot" + (u.online ? " online" : "");

      item.append(avatar,info,dot);

      item.onclick = () => selectUser(u.username);

      userList.appendChild(item);

    });

}

function formatLastSeen(time){

  const diff = Math.max(
    0,
    Date.now() - Number(time)
  );

  const sec = Math.floor(diff / 1000);

  if(sec < 60){
    return "منذ لحظات";
  }

  const min = Math.floor(sec / 60);

  if(min < 60){
    return "منذ " + min + " دقيقة";
  }

  const hours = Math.floor(min / 60);

  if(hours < 24){
    return "منذ " + hours + " ساعة";
  }

  const days = Math.floor(hours / 24);

  return "منذ " + days + " يوم";

}

/* =========================================================
   اختيار مستخدم
========================================================= */

async function selectUser(username){

  selectedUser = username;

  layout.classList.add("chatOpen");

  const u = users.find(x => x.username === username);

  chatName.textContent = username;

  chatAvatar.textContent =
    username.slice(0,1).toUpperCase();

  selectedUserOnline = !!u?.online;

  updateSelectedStatus();

  messages.innerHTML =
    '<div class="empty">جاري تحميل المحادثة...</div>';

  await loadHistory(username);

  sendWS({
    type:"read",
    other:username
  });

  renderUsers();

}

function updateSelectedStatus(){

  if(!selectedUser){
    chatStatus.textContent =
      "اختر مستخدمًا";
    return;
  }

  const u = users.find(x => x.username === selectedUser);

  if(u?.online){
    chatStatus.textContent = "متصل الآن 🟢";
  }else if(u?.last_seen){
    chatStatus.textContent =
      "آخر ظهور " + formatLastSeen(u.last_seen);
  }else{
    chatStatus.textContent = "غير متصل";
  }

}

/* =========================================================
   تاريخ المحادثة
========================================================= */

async function loadHistory(other){

  if(!other){
    return;
  }

  const r = await api(
    "/api/history?token=" +
    encodeURIComponent(token) +
    "&with=" +
    encodeURIComponent(other),
    undefined,
    "GET"
  );

  if(!r.ok){

    if(r.status === 401){
      forceLogout();
      return;
    }

    return;
  }

  renderHistory(r.data.messages || []);

}

function renderHistory(list){

  messages.innerHTML = "";

  if(!list.length){

    messages.innerHTML =
      '<div class="empty">لا توجد رسائل بعد 💬</div>';

    return;
  }

  list.forEach(addMessageToUI);

  messages.scrollTop = messages.scrollHeight;

}

function addMessageToUI(m){

  if(
    m.sender !== currentUser &&
    m.sender !== selectedUser
  ){
    return;
  }

  if(
    m.receiver !== currentUser &&
    m.receiver !== selectedUser
  ){
    return;
  }

  const box = document.createElement("div");

  box.className =
    "msg " +
    (m.sender === currentUser ? "mine" : "theirs");

  box.dataset.id = m.id;

  const text = document.createElement("div");

  text.className = "msgText";

  if(m.deleted_for_all){

    text.textContent = "🚫 تم حذف هذه الرسالة";

    box.classList.add("deleted");

  }else{

    text.textContent = m.text || "";

  }

  box.appendChild(text);

  if(!m.deleted_for_all && m.kind !== "text"){

    renderMediaPlaceholder(box,m);

  }

  const meta = document.createElement("div");

  meta.className = "msgMeta";

  const time = document.createElement("span");

  time.textContent =
    new Date(Number(m.created_at))
      .toLocaleTimeString(
        "ar-EG",
        {
          hour:"2-digit",
          minute:"2-digit"
        }
      );

  meta.appendChild(time);

  if(m.edited_at){

    const edited = document.createElement("span");

    edited.textContent = "معدلة";

    meta.appendChild(edited);

  }

  if(m.sender === currentUser){

    const read = document.createElement("span");

    read.className =
      "read";

    read.textContent =
      m.read_at ? "✓✓" : "✓";

    read.dataset.readId = m.id;

    meta.appendChild(read);

  }

  box.appendChild(meta);

  if(
    m.sender === currentUser &&
    !m.deleted_for_all
  ){

    const actions = document.createElement("div");

    actions.className = "msgActions";

    if(m.kind === "text"){

      const edit = document.createElement("button");

      edit.textContent = "✏️ تعديل";

      edit.onclick = () =>
        beginEdit(m.id,m.text || "");

      actions.appendChild(edit);

    }

    const del = document.createElement("button");

    del.textContent = "🗑️ حذف";

    del.onclick = () =>
      deleteMessage(m.id);

    actions.appendChild(del);

    box.appendChild(actions);

  }

  messages.appendChild(box);

}

/* =========================================================
   عرض الوسائط
========================================================= */

function renderMediaPlaceholder(box,m){

  const wrap = document.createElement("div");

  wrap.className = "filePreview";

  if(m.kind === "image"){

    const img = document.createElement("img");

    img.alt = m.file_name || "صورة";

    img.src =
      m.file_url || "";

    wrap.appendChild(img);

  }else if(m.kind === "video"){

    const video = document.createElement("video");

    video.controls = true;

    video.playsInline = true;

    video.src =
      m.file_url || "";

    wrap.appendChild(video);

  }else if(m.kind === "audio"){

    const audio = document.createElement("audio");

    audio.controls = true;

    audio.className = "audio";

    audio.src =
      m.file_url || "";

    wrap.appendChild(audio);

  }else{

    const link = document.createElement("a");

    link.className = "fileLink";

    link.href = m.file_url || "#";

    link.textContent =
      "📎 " +
      (m.file_name || "ملف");

    link.onclick = e => {

      if(!m.file_url){
        e.preventDefault();

        alert(
          "هذا الملف يتم نقله مباشرة بين الجهازين، ولا يوجد رابط تنزيل دائم."
        );

      }

    };

    wrap.appendChild(link);

  }

  box.appendChild(wrap);

}

/* =========================================================
   الرسائل النصية
========================================================= */

function sendMessage(){

  if(!selectedUser){

    alert("اختر مستخدمًا أولًا");

    return;
  }

  const text = messageInput.value.trim();

  if(!text){
    return;
  }

  if(editingMessageId){

    sendWS({
      type:"edit_message",
      id:editingMessageId,
      text
    });

    editingMessageId = null;

    messageInput.value = "";

    sendBtn.textContent = "➤";

    return;
  }

  const ok = sendWS({
    type:"message",
    to:selectedUser,
    text
  });

  if(ok){

    messageInput.value = "";

    sendTyping(false);

  }

}

/* =========================================================
   تعديل
========================================================= */

function beginEdit(id,text){

  editingMessageId = id;

  messageInput.value = text;

  messageInput.focus();

  sendBtn.textContent = "💾";

}

function updateEditedMessage(data){

  const box =
    messages.querySelector(
      '[data-id="' + data.id + '"]'
    );

  if(!box){
    return;
  }

  const text =
    box.querySelector(".msgText");

  if(text){
    text.textContent = data.text;
  }

}

/* =========================================================
   حذف
========================================================= */

function deleteMessage(id){

  sendWS({
    type:"delete_message",
    id
  });

}

function updateDeletedMessage(data){

  const box =
    messages.querySelector(
      '[data-id="' + data.id + '"]'
    );

  if(!box){
    return;
  }

  box.classList.add("deleted");

  const text =
    box.querySelector(".msgText");

  if(text){
    text.textContent =
      "🚫 تم حذف هذه الرسالة";
  }

  const media =
    box.querySelector(".filePreview");

  if(media){
    media.remove();
  }

  const actions =
    box.querySelector(".msgActions");

  if(actions){
    actions.remove();
  }

}

/* =========================================================
   القراءة
========================================================= */

function updateReadState(ids){

  ids.forEach(id => {

    const el =
      messages.querySelector(
        '[data-read-id="' + id + '"]'
      );

    if(el){

      el.textContent = "✓✓";

      el.classList.add("read");

    }

  });

}

/* =========================================================
   الكتابة
========================================================= */

function sendTyping(active){

  if(!selectedUser){
    return;
  }

  sendWS({
    type:"typing",
    to:selectedUser,
    active:!!active
  });

}

messageInput.addEventListener("input",() => {

  sendTyping(true);

  clearTimeout(typingTimer);

  typingTimer = setTimeout(
    () => sendTyping(false),
    1000
  );

});

/* =========================================================
   إشعارات
========================================================= */

function notifyIfNeeded(data){

  if(
    data.receiver !== currentUser ||
    data.sender === selectedUser
  ){
    return;
  }

  if(
    "Notification" in window &&
    Notification.permission === "granted"
  ){

    try{

      new Notification(
        "رسالة جديدة من " + data.sender,
        {
          body:
            data.text ||
            "📎 ملف جديد"
        }
      );

    }catch{}

  }

}

/* =========================================================
   الملفات
========================================================= */

function getOnlineTarget(){

  if(selectedUser){

    const u =
      users.find(
        x => x.username === selectedUser
      );

    if(u?.online){
      return selectedUser;
    }

  }

  const u =
    users.find(
      x =>
        x.username !== currentUser &&
        x.online
    );

  return u?.username || "";

}

async function startFile(fileObj,kind){

  if(!fileObj){
    return;
  }

  if(fileObj.size > ${MAX_FILE_SIZE}){

    alert("الحد الأقصى للملف هو 20 ميجابايت");

    return;
  }

  const target = getOnlineTarget();

  if(!target){

    alert(
      "اختر مستخدمًا متصلًا لإرسال الملف."
    );

    return;
  }

  if(!ws || ws.readyState !== WebSocket.OPEN){

    alert("الاتصال غير متاح");

    return;
  }

  const id =
    crypto.randomUUID();

  const meta = {
    id,
    file:fileObj,
    name:fileObj.name || "file",
    size:fileObj.size,
    mime:fileObj.type || "application/octet-stream",
    kind,
    target
  };

  fileTransfersSend.set(id,meta);

  const pc =
    new RTCPeerConnection(rtcConfig);

  meta.pc = pc;

  pc.onicecandidate = e => {

    if(e.candidate){

      sendWS({
        type:"file_candidate",
        to:target,
        id,
        candidate:e.candidate
      });

    }

  };

  pc.onconnectionstatechange = () => {

    if(
      ["failed","closed"].includes(
        pc.connectionState
      )
    ){

      fileTransfersSend.delete(id);

    }

  };

  const channel =
    pc.createDataChannel("file");

  meta.channel = channel;

  channel.binaryType = "arraybuffer";

  channel.bufferedAmountLowThreshold =
    512 * 1024;

  channel.onopen = () => {

    sendFileData(meta);

  };

  channel.onerror = () => {

    hideProgress();

    alert("فشل إرسال الملف");

    try{
      pc.close();
    }catch{}

    fileTransfersSend.delete(id);

  };

  showProgress(
    "جاري تجهيز " + meta.name + "..."
  );

  try{

    const offer =
      await pc.createOffer();

    await pc.setLocalDescription(offer);

    sendWS({
      type:"file_offer",
      to:target,
      id,
      offer:pc.localDescription,
      fileName:meta.name,
      fileSize:meta.size,
      mime:meta.mime,
      kind:meta.kind
    });

  }catch(error){

    console.error(error);

    hideProgress();

    try{
      pc.close();
    }catch{}

    fileTransfersSend.delete(id);

    alert("تعذر بدء إرسال الملف");

  }

}

function waitDataChannelDrain(channel){

  if(channel.bufferedAmount <= 0){
    return Promise.resolve();
  }

  return new Promise(resolve => {

    let done = false;

    const finish = () => {

      if(done){
        return;
      }

      done = true;

      channel.removeEventListener(
        "bufferedamountlow",
        finish
      );

      resolve();

    };

    channel.addEventListener(
      "bufferedamountlow",
      finish
    );

    setTimeout(finish,5000);

  });

}

async function sendFileData(meta){

  const ch = meta.channel;

  if(!ch || ch.readyState !== "open"){
    return;
  }

  try{

    ch.send(JSON.stringify({
      type:"meta",
      name:meta.name,
      size:meta.size,
      mime:meta.mime,
      kind:meta.kind
    }));

    let offset = 0;

    while(offset < meta.size){

      while(
        ch.bufferedAmount >
        1024 * 1024
      ){

        await waitDataChannelDrain(ch);

      }

      const end =
        Math.min(
          offset + ${CHUNK_SIZE},
          meta.size
        );

      const buffer =
        await meta.file
          .slice(offset,end)
          .arrayBuffer();

      ch.send(buffer);

      offset = end;

      const percent =
        Math.floor(
          offset / meta.size * 100
        );

      showProgress(
        "جاري إرسال " +
        meta.name +
        " " +
        percent +
        "%"
      );

    }

    while(ch.bufferedAmount > 0){

      await waitDataChannelDrain(ch);

    }

    ch.send(JSON.stringify({
      type:"end"
    }));

    showProgress(
      "تم إرسال " + meta.name + " ✅"
    );

    setTimeout(
      hideProgress,
      1200
    );

    setTimeout(() => {

      try{
        meta.pc.close();
      }catch{}

      fileTransfersSend.delete(meta.id);

    },1500);

  }catch(error){

    console.error(error);

    hideProgress();

    alert("حدث خطأ أثناء إرسال الملف");

    try{
      meta.pc.close();
    }catch{}

    fileTransfersSend.delete(meta.id);

  }

}

/* =========================================================
   استقبال الملفات
========================================================= */

async function receiveFileOffer(data){

  if(fileTransfersReceive.has(data.id)){
    return;
  }

  const accepted =
    window.confirm(
      "📎 " +
      (data.fileName || "ملف") +
      "\\nالحجم: " +
      (
        Math.ceil(
          (Number(data.fileSize)||0) /
          1024 /
          1024 *
          10
        ) / 10
      ) +
      " MB\\n\\nهل تريد استقبال الملف؟"
    );

  if(!accepted){

    sendWS({
      type:"file_reject",
      to:data.from,
      id:data.id
    });

    return;
  }

  const pc =
    new RTCPeerConnection(rtcConfig);

  const state = {
    id:data.id,
    pc,
    user:data.from,
    pendingCandidates:[],
    remoteDescriptionSet:false,
    meta:null,
    channel:null
  };

  fileTransfersReceive.set(
    data.id,
    state
  );

  pc.onicecandidate = e => {

    if(e.candidate){

      sendWS({
        type:"file_candidate",
        to:data.from,
        id:data.id,
        candidate:e.candidate
      });

    }

  };

  pc.ondatachannel = e => {

    state.channel = e.channel;

    setupReceiveChannel(state);

  };

  pc.onconnectionstatechange = () => {

    if(
      ["failed","closed"].includes(
        pc.connectionState
      )
    ){

      fileTransfersReceive.delete(
        data.id
      );

    }

  };

  try{

    await pc.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    state.remoteDescriptionSet = true;

    for(
      const candidate of state.pendingCandidates
    ){

      try{

        await pc.addIceCandidate(
          candidate
        );

      }catch{}

    }

    state.pendingCandidates = [];

    const answer =
      await pc.createAnswer();

    await pc.setLocalDescription(
      answer
    );

    sendWS({
      type:"file_answer",
      to:data.from,
      id:data.id,
      answer:pc.localDescription
    });

  }catch(error){

    console.error(error);

    sendWS({
      type:"file_reject",
      to:data.from,
      id:data.id
    });

    try{
      pc.close();
    }catch{}

    fileTransfersReceive.delete(
      data.id
    );

  }

}

function setupReceiveChannel(state){

  const ch = state.channel;

  ch.binaryType = "arraybuffer";

  ch.onmessage = event => {

    receiveFileData(
      state,
      event.data
    );

  };

  ch.onerror = () => {

    hideProgress();

    fileTransfersReceive.delete(
      state.id
    );

    try{
      state.pc.close();
    }catch{}

  };

}

function receiveFileData(state,data){

  if(typeof data === "string"){

    let m;

    try{
      m = JSON.parse(data);
    }catch{
      return;
    }

    if(m.type === "meta"){

      state.meta = {
        name:m.name,
        size:Number(m.size)||0,
        mime:m.mime ||
          "application/octet-stream",
        kind:m.kind || "file",
        chunks:[],
        bytes:0
      };

      showProgress(
        "جاري استقبال " +
        state.meta.name +
        " 0%"
      );

      return;
    }

    if(m.type === "end"){

      finishReceiveFile(state);

      return;
    }

    return;

  }

  if(!state.meta){
    return;
  }

  state.meta.chunks.push(data);

  state.meta.bytes +=
    data.byteLength ||
    data.size ||
    0;

  const percent =
    state.meta.size
      ? Math.min(
          100,
          Math.floor(
            state.meta.bytes /
            state.meta.size *
            100
          )
        )
      : 0;

  showProgress(
    "جاري استقبال " +
    state.meta.name +
    " " +
    percent +
    "%"
  );

}

function finishReceiveFile(state){

  if(!state.meta){
    return;
  }

  const m = state.meta;

  if(m.bytes < m.size){

    showProgress(
      "لم يكتمل الملف..."
    );

    let attempts = 0;

    const wait = setInterval(() => {

      attempts++;

      if(m.bytes >= m.size){

        clearInterval(wait);

        finishReceiveFile(state);

      }else if(attempts > 50){

        clearInterval(wait);

        hideProgress();

        alert(
          "لم يكتمل استقبال الملف."
        );

        fileTransfersReceive.delete(
          state.id
        );

        try{
          state.pc.close();
        }catch{}

      }

    },100);

    return;
  }

  const blob =
    new Blob(
      m.chunks,
      {
        type:m.mime
      }
    );

  const url =
    URL.createObjectURL(blob);

  addLocalMediaMessage(
    state.user,
    m,
    url
  );

  showProgress(
    "تم استقبال " +
    m.name +
    " ✅"
  );

  setTimeout(
    hideProgress,
    1200
  );

  fileTransfersReceive.delete(
    state.id
  );

  try{
    state.pc.close();
  }catch{}

}

function addLocalMediaMessage(
  sender,
  meta,
  url
){

  const temp = {
    id:"local-" + crypto.randomUUID(),
    sender,
    receiver:currentUser,
    text:
      meta.kind === "audio"
        ? "🎙️ رسالة صوتية"
        : meta.kind === "image"
          ? "🖼️ صورة"
          : meta.kind === "video"
            ? "🎥 فيديو"
            : "📎 ملف: " + meta.name,
    kind:meta.kind,
    file_name:meta.name,
    file_mime:meta.mime,
    created_at:Date.now(),
    read_at:Date.now(),
    file_url:url
  };

  if(
    sender === selectedUser ||
    sender === currentUser
  ){

    addMessageToUI(temp);

  }

}

/* =========================================================
   إشارات الملفات
========================================================= */

async function handleFileSignal(data){

  if(data.type === "file_offer"){

    await receiveFileOffer(data);

    return;
  }

  if(data.type === "file_answer"){

    const state =
      fileTransfersSend.get(data.id);

    if(!state){
      return;
    }

    try{

      await state.pc.setRemoteDescription(
        new RTCSessionDescription(
          data.answer
        )
      );

      if(state.pendingCandidates){

        for(
          const candidate
          of state.pendingCandidates
        ){

          try{
            await state.pc.addIceCandidate(
              candidate
            );
          }catch{}

        }

        state.pendingCandidates = [];

      }

    }catch(error){

      console.error(error);

    }

    return;
  }

  if(data.type === "file_candidate"){

    const sendState =
      fileTransfersSend.get(data.id);

    if(sendState){

      if(!sendState.pc.remoteDescription){

        if(!sendState.pendingCandidates){
          sendState.pendingCandidates = [];
        }

        sendState.pendingCandidates.push(
          new RTCIceCandidate(
            data.candidate
          )
        );

      }else{

        try{
          await sendState.pc.addIceCandidate(
            data.candidate
          );
        }catch{}

      }

      return;
    }

    const receiveState =
      fileTransfersReceive.get(data.id);

    if(receiveState){

      const candidate =
        new RTCIceCandidate(
          data.candidate
        );

      if(
        !receiveState.remoteDescriptionSet
      ){

        receiveState.pendingCandidates.push(
          candidate
        );

      }else{

        try{
          await receiveState.pc.addIceCandidate(
            candidate
          );
        }catch{}

      }

      return;
    }

  }

  if(data.type === "file_reject"){

    const state =
      fileTransfersSend.get(data.id);

    if(state){

      try{
        state.pc.close();
      }catch{}

      fileTransfersSend.delete(
        data.id
      );

    }

    hideProgress();

    alert("تم رفض استقبال الملف ❌");

  }

}

/* =========================================================
   المكالمات
========================================================= */

function openCallModal(type,target){

  $("callModal").style.display =
    "flex";

  $("callTitle").textContent =
    type === "video"
      ? "📹 مكالمة فيديو مع " + target
      : "📞 مكالمة صوتية مع " + target;

  $("callStatus").textContent =
    "جاري الاتصال...";

  $("localVideo").style.display =
    type === "video"
      ? "block"
      : "none";

}

function closeCallModal(){

  $("callModal").style.display =
    "none";

}

async function startLocalCallMedia(type){

  const constraints = {
    audio:true,
    video:type === "video"
  };

  callLocalStream =
    await navigator.mediaDevices
      .getUserMedia(constraints);

  const localVideo =
    $("localVideo");

  if(type === "video"){

    localVideo.srcObject =
      callLocalStream;

    localVideo.muted = true;

    localVideo.play().catch(() => {});

  }

  return callLocalStream;

}

function attachRemoteCallStream(stream){

  callRemoteStream = stream;

  const video =
    $("remoteVideo");

  const audio =
    $("callRemoteAudio");

  video.srcObject = stream;

  audio.srcObject = stream;

  video.muted = false;

  audio.muted = false;

  video.play().catch(() => {});
  audio.play().catch(() => {});

}

function createCallPeer(target){

  if(callPC){

    try{
      callPC.close();
    }catch{}

  }

  callPendingCandidates = [];

  const pc =
    new RTCPeerConnection(
      rtcConfig
    );

  callPC = pc;

  callTarget = target;

  pc.onicecandidate = e => {

    if(e.candidate){

      sendWS({
        type:"rtc_candidate",
        to:target,
        candidate:e.candidate
      });

    }

  };

  pc.ontrack = event => {

    let stream =
      event.streams &&
      event.streams[0];

    if(!stream){

      if(!callRemoteStream){

        callRemoteStream =
          new MediaStream();

      }

      callRemoteStream.addTrack(
        event.track
      );

      stream =
        callRemoteStream;

    }

    attachRemoteCallStream(
      stream
    );

    $("callStatus").textContent =
      "متصل الآن 🟢";

  };

  pc.onconnectionstatechange = () => {

    if(
      pc.connectionState ===
      "connected"
    ){

      $("callStatus").textContent =
        "متصل الآن 🟢";

    }

    if(
      pc.connectionState ===
      "failed"
    ){

      $("callStatus").textContent =
        "تعذر الاتصال";

    }

  };

  pc.oniceconnectionstatechange = () => {

    if(
      pc.iceConnectionState ===
      "connected" ||
      pc.iceConnectionState ===
      "completed"
    ){

      $("callStatus").textContent =
        "متصل الآن 🟢";

    }

  };

  return pc;

}

async function startCall(type){

  if(!selectedUser){

    alert("اختر مستخدمًا أولًا");

    return;
  }

  const u =
    users.find(
      x => x.username === selectedUser
    );

  if(!u?.online){

    alert("هذا المستخدم غير متصل الآن");

    return;
  }

  if(callPC){

    alert("هناك مكالمة جارية بالفعل");

    return;
  }

  callType = type;
  callTarget = selectedUser;

  try{

    await startLocalCallMedia(type);

    const pc =
      createCallPeer(
        selectedUser
      );

    callLocalStream
      .getTracks()
      .forEach(track => {

        pc.addTrack(
          track,
          callLocalStream
        );

      });

    const offer =
      await pc.createOffer({
        offerToReceiveAudio:true,
        offerToReceiveVideo:
          type === "video"
      });

    await pc.setLocalDescription(
      offer
    );

    sendWS({
      type:"rtc_offer",
      to:selectedUser,
      callType:type,
      offer:pc.localDescription
    });

    openCallModal(
      type,
      selectedUser
    );

  }catch(error){

    console.error(error);

    alert(
      "تعذر تشغيل الكاميرا أو الميكروفون. تأكد من السماح للموقع بالصلاحيات."
    );

    endCall(false);

  }

}

function showIncomingCall(data){

  incomingCallData = data;

  $("incomingCallText").textContent =
    data.from +
    " يتصل بك " +
    (data.callType === "video"
      ? "📹"
      : "📞");

  $("incomingCallModal").style.display =
    "flex";

}

async function acceptIncomingCall(){

  const data =
    incomingCallData;

  if(!data){
    return;
  }

  $("incomingCallModal").style.display =
    "none";

  callType =
    data.callType || "audio";

  callTarget =
    data.from;

  try{

    await startLocalCallMedia(
      callType
    );

    const pc =
      createCallPeer(data.from);

    callLocalStream
      .getTracks()
      .forEach(track => {

        pc.addTrack(
          track,
          callLocalStream
        );

      });

    await pc.setRemoteDescription(
      new RTCSessionDescription(
        data.offer
      )
    );

    for(
      const candidate
      of callPendingCandidates
    ){

      try{

        await pc.addIceCandidate(
          candidate
        );

      }catch{}

    }

    callPendingCandidates = [];

    const answer =
      await pc.createAnswer();

    await pc.setLocalDescription(
      answer
    );

    sendWS({
      type:"rtc_answer",
      to:data.from,
      answer:pc.localDescription
    });

    openCallModal(
      callType,
      data.from
    );

  }catch(error){

    console.error(error);

    sendWS({
      type:"rtc_reject",
      to:data.from
    });

    endCall(false);

  }

  incomingCallData = null;

}

function rejectIncomingCall(){

  if(incomingCallData){

    sendWS({
      type:"rtc_reject",
      to:incomingCallData.from
    });

  }

  incomingCallData = null;

  $("incomingCallModal").style.display =
    "none";

}

async function handleCallSignal(data){

  if(data.type === "rtc_offer"){

    if(callPC){

      sendWS({
        type:"rtc_reject",
        to:data.from
      });

      return;
    }

    showIncomingCall(data);

    return;
  }

  if(data.type === "rtc_answer"){

    if(!callPC){
      return;
    }

    try{

      await callPC.setRemoteDescription(
        new RTCSessionDescription(
          data.answer
        )
      );

      for(
        const candidate
        of callPendingCandidates
      ){

        try{

          await callPC.addIceCandidate(
            candidate
          );

        }catch{}

      }

      callPendingCandidates = [];

    }catch(error){

      console.error(error);

    }

    return;
  }

  if(data.type === "rtc_candidate"){

    if(!data.candidate){
      return;
    }

    const candidate =
      new RTCIceCandidate(
        data.candidate
      );

    if(
      !callPC ||
      !callPC.remoteDescription
    ){

      callPendingCandidates.push(
        candidate
      );

      return;

    }

    try{

      await callPC.addIceCandidate(
        candidate
      );

    }catch(error){

      console.warn(error);

    }

    return;
  }

  if(data.type === "rtc_reject"){

    alert("تم رفض المكالمة ❌");

    endCall(false);

    return;
  }

  if(data.type === "rtc_hangup"){

    endCall(false);

  }

}

/* =========================================================
   إنهاء المكالمة
========================================================= */

function endCall(sendSignal=true){

  if(
    sendSignal &&
    callTarget
  ){

    sendWS({
      type:"rtc_hangup",
      to:callTarget
    });

  }

  if(callLocalStream){

    callLocalStream
      .getTracks()
      .forEach(track => {

        try{
          track.stop();
        }catch{}

      });

  }

  if(callRemoteStream){

    callRemoteStream
      .getTracks()
      .forEach(track => {

        try{
          track.stop();
        }catch{}

      });

  }

  if(callPC){

    try{
      callPC.close();
    }catch{}

  }

  $("localVideo").srcObject = null;
  $("remoteVideo").srcObject = null;
  $("callRemoteAudio").srcObject = null;

  callPC = null;
  callLocalStream = null;
  callRemoteStream = null;

  callTarget = "";
  callType = "";

  callPendingCandidates = [];

  closeCallModal();

}

/* =========================================================
   الميكروفون
========================================================= */

async function toggleRecording(){

  if(recording){

    mediaRecorder.stop();

    recording = false;

    $("recordBtn").textContent =
      "🎙️";

    return;

  }

  if(!selectedUser){

    alert("اختر مستخدمًا أولًا");

    return;
  }

  try{

    const stream =
      await navigator.mediaDevices
        .getUserMedia({
          audio:true
        });

    audioChunks = [];

    mediaRecorder =
      new MediaRecorder(
        stream
      );

    mediaRecorder.ondataavailable =
      e => {

        if(e.data.size){
          audioChunks.push(e.data);
        }

      };

    mediaRecorder.onstop = () => {

      stream
        .getTracks()
        .forEach(
          t => t.stop()
        );

      const blob =
        new Blob(
          audioChunks,
          {
            type:
              mediaRecorder.mimeType ||
              "audio/webm"
          }
        );

      const file =
        new File(
          [blob],
          "voice-" +
          Date.now() +
          ".webm",
          {
            type:blob.type
          }
        );

      startFile(
        file,
        "audio"
      );

    };

    mediaRecorder.start();

    recording = true;

    $("recordBtn").textContent =
      "⏹️";

  }catch(error){

    console.error(error);

    alert(
      "اسمح للموقع باستخدام الميكروفون."
    );

  }

}

/* =========================================================
   تسجيل الخروج
========================================================= */

async function logout(){

  clearTimeout(
    reconnectTimer
  );

  endCall(false);

  if(ws){

    try{
      ws.close();
    }catch{}

  }

  if(token){

    await api(
      "/api/logout",
      {token}
    );

  }

  localStorage.removeItem(
    "chatToken"
  );

  localStorage.removeItem(
    "chatUser"
  );

  forceLogout();

}

function forceLogout(){

  token = "";
  currentUser = "";
  selectedUser = "";

  clearTimeout(
    reconnectTimer
  );

  auth.style.display = "block";
  app.style.display = "none";

  messages.innerHTML = "";

  userList.innerHTML = "";

  usernameInput.value = "";
  passwordInput.value = "";

}

/* =========================================================
   البحث
========================================================= */

userSearch.oninput =
  renderUsers;

/* =========================================================
   إعدادات
========================================================= */

$("settingsBtn").onclick = () => {

  $("settingsModal").style.display =
    "flex";

};

$("closeSettings").onclick = () => {

  $("settingsModal").style.display =
    "none";

};

$("darkBtn").onclick = async () => {

  const enabled =
    !document.body.classList.contains(
      "dark"
    );

  document.body.classList.toggle(
    "dark",
    enabled
  );

  localStorage.setItem(
    "darkMode",
    enabled ? "1" : "0"
  );

  sendWS({
    type:"dark_mode",
    enabled
  });

};

if(
  localStorage.getItem(
    "darkMode"
  ) === "1"
){

  document.body.classList.add(
    "dark"
  );

}

$("notifyBtn").onclick = async () => {

  if(
    !("Notification" in window)
  ){

    alert(
      "الإشعارات غير مدعومة في هذا المتصفح."
    );

    return;
  }

  const permission =
    await Notification.requestPermission();

  $("notifyBtn").textContent =
    permission === "granted"
      ? "تم السماح ✓"
      : "السماح";

};

/* =========================================================
   حذف الحساب - بدون تأكيد
========================================================= */

$("deleteAccountBtn").onclick =
  async () => {

    const r =
      await api(
        "/api/delete-account",
        {token}
      );

    if(!r.ok){

      alert(
        r.data.error ||
        "تعذر حذف الحساب"
      );

      return;
    }

    alert(
      "تم حذف الحساب نهائيًا."
    );

    forceLogout();

  };

/* =========================================================
   أزرار الواجهة
========================================================= */

$("registerBtn").onclick =
  register;

$("loginBtn").onclick =
  login;

$("logoutBtn").onclick =
  logout;

$("sendBtn").onclick =
  sendMessage;

$("fileBtn").onclick = () => {

  $("fileInput").accept = "";

  $("fileInput").click();

};

$("imageBtn").onclick = () => {

  $("fileInput").accept =
    "image/*";

  $("fileInput").click();

};

$("videoBtn").onclick = () => {

  $("fileInput").accept =
    "video/*";

  $("fileInput").click();

};

$("fileInput").onchange = () => {

  const f =
    $("fileInput").files[0];

  $("fileInput").value = "";

  if(!f){
    return;
  }

  let kind = "file";

  if(f.type.startsWith("image/")){
    kind = "image";
  }else if(f.type.startsWith("video/")){
    kind = "video";
  }

  startFile(
    f,
    kind
  );

};

$("recordBtn").onclick =
  toggleRecording;

$("audioCallBtn").onclick =
  () => startCall("audio");

$("videoCallBtn").onclick =
  () => startCall("video");

$("hangupBtn").onclick =
  () => endCall(true);

$("acceptCallBtn").onclick =
  acceptIncomingCall;

$("rejectCallBtn").onclick =
  rejectIncomingCall;

$("backBtn").onclick = () => {

  layout.classList.remove(
    "chatOpen"
  );

};

/* =========================================================
   كتم الميكروفون والكاميرا
========================================================= */

$("muteBtn").onclick = () => {

  if(!callLocalStream){
    return;
  }

  const track =
    callLocalStream
      .getAudioTracks()[0];

  if(!track){
    return;
  }

  track.enabled =
    !track.enabled;

  $("muteBtn").textContent =
    track.enabled
      ? "🎙️"
      : "🔇";

};

$("cameraBtn").onclick = () => {

  if(!callLocalStream){
    return;
  }

  const track =
    callLocalStream
      .getVideoTracks()[0];

  if(!track){
    return;
  }

  track.enabled =
    !track.enabled;

  $("cameraBtn").textContent =
    track.enabled
      ? "📹"
      : "🚫";

};

/* =========================================================
   لوحة المفاتيح
========================================================= */

messageInput.onkeydown = e => {

  if(e.key === "Enter"){

    e.preventDefault();

    sendMessage();

  }

};

passwordInput.onkeydown = e => {

  if(e.key === "Enter"){
    login();
  }

};

/* =========================================================
   WebSocket signal dispatch
========================================================= */

const originalHandleSignal =
  handleSignal;

async function handleSignal(data){

  if(
    data.type.startsWith("rtc_")
  ){

    await handleCallSignal(
      data
    );

    return;
  }

  if(
    data.type.startsWith("file_")
  ){

    await handleFileSignal(
      data
    );

    return;
  }

}

/* =========================================================
   تشغيل الجلسة المحفوظة
========================================================= */

if(token && currentUser){

  openApp();

}

</script>
</body>
</html>`;

/* =========================================================
   Helpers
========================================================= */

function json(data,status=200){

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "content-type":
          "application/json;charset=UTF-8",
        "cache-control":
          "no-store"
      }
    }
  );

}

function bytesToBase64(bytes){

  let s = "";

  for(const b of bytes){
    s += String.fromCharCode(b);
  }

  return btoa(s);

}

function base64ToBytes(s){

  const b = atob(s);

  const a =
    new Uint8Array(b.length);

  for(let i=0;i<b.length;i++){
    a[i] = b.charCodeAt(i);
  }

  return a;

}

async function hashPassword(
  password,
  salt
){

  const key =
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name:"PBKDF2",
        salt,
        iterations:PBKDF2_ITERATIONS,
        hash:"SHA-256"
      },
      key,
      256
    );

  return new Uint8Array(bits);

}

function randomBytes(n){

  const a =
    new Uint8Array(n);

  crypto.getRandomValues(a);

  return a;

}

function randomToken(){

  return bytesToBase64(
    randomBytes(32)
  )
  .replace(/\+/g,"-")
  .replace(/\//g,"_")
  .replace(/=/g,"");

}

/* =========================================================
   Worker
========================================================= */

export default {

  async fetch(request,env){

    const url =
      new URL(request.url);

    if(url.pathname === "/"){

      return new Response(
        HTML,
        {
          headers:{
            "content-type":
              "text/html;charset=UTF-8",
            "cache-control":
              "no-store"
          }
        }
      );

    }

    if(
      url.pathname === "/ws" &&
      request.headers
        .get("Upgrade")
        ?.toLowerCase() === "websocket"
    ){

      const token =
        url.searchParams.get("token");

      if(!token){
        return new Response(
          "Unauthorized",
          {status:401}
        );
      }

      const room =
        env.CHAT_ROOM
          .getByName("main");

      const target =
        new URL(
          "/websocket?token=" +
          encodeURIComponent(token),
          request.url
        );

      return room.fetch(
        new Request(
          target,
          request
        )
      );

    }

    const apiRoutes = [
      "/api/register",
      "/api/login",
      "/api/logout",
      "/api/delete-account"
    ];

    if(apiRoutes.includes(url.pathname)){

      return env.CHAT_ROOM
        .getByName("main")
        .fetch(request);

    }

    if(url.pathname === "/api/history"){

      return env.CHAT_ROOM
        .getByName("main")
        .fetch(request);

    }

    return new Response(
      "Not Found",
      {status:404}
    );

  }

};

/* =========================================================
   Durable Object
========================================================= */

export class ChatRoom extends DurableObject{

  constructor(ctx,env){

    super(ctx,env);

    this.ctx = ctx;
    this.env = env;

    this.ctx.storage.sql.exec(`
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
        expires_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT NOT NULL DEFAULT '',
        kind TEXT NOT NULL DEFAULT 'text',
        file_name TEXT,
        file_mime TEXT,
        created_at INTEGER NOT NULL,
        edited_at INTEGER,
        deleted_for_all INTEGER NOT NULL DEFAULT 0,
        read_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_messages_pair
      ON messages(sender,receiver,created_at);

      CREATE INDEX IF NOT EXISTS idx_messages_receiver
      ON messages(receiver,read_at);

    `);

    this.ensureSchema();

    this.sessions = new Map();

    for(
      const ws of this.ctx.getWebSockets()
    ){

      try{

        const d =
          ws.deserializeAttachment();

        if(d?.username){

          this.sessions.set(
            ws,
            d
          );

        }

      }catch{}

    }

  }

  /* =======================================================
     Schema repair
  ======================================================= */

  getColumns(table){

    return new Set(
      this.ctx.storage.sql
        .exec(
          "PRAGMA table_info(" +
          table +
          ")"
        )
        .toArray()
        .map(
          x => String(x.name)
        )
    );

  }

  ensureSchema(){

    const accounts =
      this.getColumns("accounts");

    const sessions =
      this.getColumns("sessions");

    const messages =
      this.getColumns("messages");

    if(!accounts.has("created_at")){

      this.ctx.storage.sql.exec(
        "ALTER TABLE accounts ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0"
      );

    }

    if(!accounts.has("last_seen")){

      this.ctx.storage.sql.exec(
        "ALTER TABLE accounts ADD COLUMN last_seen INTEGER NOT NULL DEFAULT 0"
      );

    }

    if(!sessions.has("created_at")){

      this.ctx.storage.sql.exec(
        "ALTER TABLE sessions ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0"
      );

    }

    if(!sessions.has("expires_at")){

      this.ctx.storage.sql.exec(
        "ALTER TABLE sessions ADD COLUMN expires_at INTEGER NOT NULL DEFAULT 9999999999999"
      );

    }

    if(!messages.has("id")){

      /* الرسائل القديمة غير المتوافقة لا يتم العبث بها */
      try{
        this.ctx.storage.sql.exec(
          "CREATE TABLE IF NOT EXISTS messages_new(id INTEGER PRIMARY KEY AUTOINCREMENT,sender TEXT NOT NULL,receiver TEXT NOT NULL,text TEXT NOT NULL DEFAULT '',kind TEXT NOT NULL DEFAULT 'text',file_name TEXT,file_mime TEXT,created_at INTEGER NOT NULL,edited_at INTEGER,deleted_for_all INTEGER NOT NULL DEFAULT 0,read_at INTEGER)"
        );
      }catch{}

    }

  }

  /* =======================================================
     Router
  ======================================================= */

  async fetch(request){

    const url =
      new URL(request.url);

    if(url.pathname === "/api/register"){

      return this.register(request);

    }

    if(url.pathname === "/api/login"){

      return this.login(request);

    }

    if(url.pathname === "/api/logout"){

      return this.logout(request);

    }

    if(url.pathname === "/api/delete-account"){

      return this.deleteAccount(request);

    }

    if(url.pathname === "/api/history"){

      return this.history(request);

    }

    if(
      url.pathname === "/websocket" &&
      request.headers
        .get("Upgrade")
        ?.toLowerCase() === "websocket"
    ){

      return this.openWebSocket(request);

    }

    return new Response(
      "Not Found",
      {status:404}
    );

  }

  /* =======================================================
     Register
  ======================================================= */

  async register(request){

    let d;

    try{
      d = await request.json();
    }catch{
      return json(
        {error:"بيانات غير صحيحة"},
        400
      );
    }

    const username =
      String(d.username || "")
        .trim();

    const password =
      String(d.password || "");

    if(
      !/^[a-zA-Z0-9_\\u0600-\\u06FF]{3,20}$/
        .test(username)
    ){

      return json(
        {
          error:
            "اسم المستخدم: 3 إلى 20 حرفًا أو رقمًا أو _"
        },
        400
      );

    }

    if(password.length < 6){

      return json(
        {
          error:
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
        },
        400
      );

    }

    const exists =
      this.ctx.storage.sql
        .exec(
          "SELECT username FROM accounts WHERE username=?",
          username
        )
        .toArray();

    if(exists.length){

      return json(
        {
          error:
            "اسم المستخدم موجود بالفعل"
        },
        409
      );

    }

    const salt =
      randomBytes(16);

    const hash =
      await hashPassword(
        password,
        salt
      );

    const now =
      Date.now();

    this.ctx.storage.sql.exec(
      "INSERT INTO accounts(username,password_hash,salt,created_at,last_seen) VALUES(?,?,?,?,?)",
      username,
      bytesToBase64(hash),
      bytesToBase64(salt),
      now,
      now
    );

    const token =
      randomToken();

    this.ctx.storage.sql.exec(
      "INSERT INTO sessions(token,username,created_at,expires_at) VALUES(?,?,?,?)",
      token,
      username,
      now,
      SESSION_FOREVER
    );

    return json({
      ok:true,
      token,
      username
    });

  }

  /* =======================================================
     Login
  ======================================================= */

  async login(request){

    let d;

    try{
      d = await request.json();
    }catch{
      return json(
        {error:"بيانات غير صحيحة"},
        400
      );
    }

    const username =
      String(d.username || "")
        .trim();

    const password =
      String(d.password || "");

    const rows =
      this.ctx.storage.sql
        .exec(
          "SELECT username,password_hash,salt FROM accounts WHERE username=?",
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

    const hash =
      await hashPassword(
        password,
        base64ToBytes(
          account.salt
        )
      );

    if(
      bytesToBase64(hash) !==
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

    const now =
      Date.now();

    this.ctx.storage.sql.exec(
      "INSERT INTO sessions(token,username,created_at,expires_at) VALUES(?,?,?,?)",
      token,
      account.username,
      now,
      SESSION_FOREVER
    );

    this.ctx.storage.sql.exec(
      "UPDATE accounts SET last_seen=? WHERE username=?",
      now,
      account.username
    );

    return json({
      ok:true,
      token,
      username:account.username
    });

  }

  /* =======================================================
     Logout
  ======================================================= */

  async logout(request){

    let d = {};

    try{
      d = await request.json();
    }catch{}

    const token =
      String(d.token || "");

    if(token){

      const rows =
        this.ctx.storage.sql
          .exec(
            "SELECT username FROM sessions WHERE token=?",
            token
          )
          .toArray();

      if(rows.length){

        this.ctx.storage.sql.exec(
          "UPDATE accounts SET last_seen=? WHERE username=?",
          Date.now(),
          rows[0].username
        );

      }

      this.ctx.storage.sql.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );

    }

    this.broadcastUsers();

    return json({
      ok:true
    });

  }

  /* =======================================================
     Delete Account
     بدون تأكيد
  ======================================================= */

  async deleteAccount(request){

    let d = {};

    try{
      d = await request.json();
    }catch{}

    const token =
      String(d.token || "");

    const username =
      this.getUsernameFromToken(
        token
      );

    if(!username){

      return json(
        {
          error:"الجلسة غير صالحة"
        },
        401
      );

    }

    this.ctx.storage.sql.exec(
      "DELETE FROM sessions WHERE username=?",
      username
    );

    this.ctx.storage.sql.exec(
      "DELETE FROM messages WHERE sender=? OR receiver=?",
      username,
      username
    );

    this.ctx.storage.sql.exec(
      "DELETE FROM accounts WHERE username=?",
      username
    );

    for(
      const [ws,session]
      of this.sessions
    ){

      if(
        session.username === username
      ){

        this.sessions.delete(ws);

        try{
          ws.close(1000,"account deleted");
        }catch{}

      }

    }

    this.broadcastUsers();

    return json({
      ok:true
    });

  }

  /* =======================================================
     History
  ======================================================= */

  async history(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get(
        "token"
      );

    const other =
      String(
        url.searchParams.get(
          "with"
        ) || ""
      ).trim();

    const username =
      this.getUsernameFromToken(
        token
      );

    if(!username){

      return json(
        {error:"Unauthorized"},
        401
      );

    }

    if(!other){

      return json({
        messages:[]
      });

    }

    const rows =
      this.ctx.storage.sql
        .exec(
          `SELECT
             id,
             sender,
             receiver,
             text,
             kind,
             file_name,
             file_mime,
             created_at,
             edited_at,
             deleted_for_all,
             read_at
           FROM messages
           WHERE
             (sender=? AND receiver=?)
             OR
             (sender=? AND receiver=?)
           ORDER BY created_at ASC
           LIMIT 500`,
          username,
          other,
          other,
          username
        )
        .toArray();

    return json({
      messages:rows
    });

  }

  /* =======================================================
     Token
  ======================================================= */

  getUsernameFromToken(token){

    if(!token){
      return null;
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          "SELECT username,expires_at FROM sessions WHERE token=?",
          token
        )
        .toArray();

    if(!rows.length){
      return null;
    }

    if(
      Number(rows[0].expires_at) <
      Date.now()
    ){

      this.ctx.storage.sql.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );

      return null;

    }

    return rows[0].username;

  }

  /* =======================================================
     WebSocket
  ======================================================= */

  openWebSocket(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get(
        "token"
      );

    const username =
      this.getUsernameFromToken(
        token
      );

    if(!username){

      return new Response(
        "Unauthorized",
        {status:401}
      );

    }

    const pair =
      new WebSocketPair();

    const client =
      pair[0];

    const server =
      pair[1];

    this.ctx.acceptWebSocket(
      server
    );

    const session = {
      username,
      connectedAt:Date.now()
    };

    server.serializeAttachment(
      session
    );

    this.sessions.set(
      server,
      session
    );

    this.ctx.storage.sql.exec(
      "UPDATE accounts SET last_seen=? WHERE username=?",
      Date.now(),
      username
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

  /* =======================================================
     Users
  ======================================================= */

  broadcastUsers(){

    const online =
      new Set(
        [...this.sessions.values()]
          .map(
            x => x.username
          )
      );

    const rows =
      this.ctx.storage.sql
        .exec(
          `SELECT
             username,
             last_seen
           FROM accounts
           ORDER BY username COLLATE NOCASE`
        )
        .toArray();

    const users =
      rows.map(row => ({
        username:row.username,
        last_seen:Number(
          row.last_seen || 0
        ),
        online:
          online.has(
            row.username
          )
      }));

    const packet =
      JSON.stringify({
        type:"users",
        users
      });

    for(
      const ws
      of this.ctx.getWebSockets()
    ){

      try{
        ws.send(packet);
      }catch{}

    }

  }

  /* =======================================================
     Find websocket
  ======================================================= */

  findUserSocket(username){

    for(
      const [ws,session]
      of this.sessions
    ){

      if(
        session.username ===
        username
      ){

        return ws;

      }

    }

    return null;

  }

  /* =======================================================
     Send to user
  ======================================================= */

  sendToUser(username,data){

    const ws =
      this.findUserSocket(
        username
      );

    if(!ws){
      return false;
    }

    try{

      ws.send(
        JSON.stringify(data)
      );

      return true;

    }catch{

      return false;

    }

  }

  /* =======================================================
     Broadcast message to both
  ======================================================= */

  sendToBoth(
    sender,
    receiver,
    data
  ){

    this.sendToUser(
      sender,
      data
    );

    if(receiver !== sender){

      this.sendToUser(
        receiver,
        data
      );

    }

  }

  /* =======================================================
     WebSocket Message
  ======================================================= */

  async webSocketMessage(
    ws,
    message
  ){

    const session =
      this.sessions.get(ws) ||
      ws.deserializeAttachment();

    if(!session?.username){
      return;
    }

    const sender =
      session.username;

    let d;

    try{
      d = JSON.parse(message);
    }catch{
      return;
    }

    /* -----------------------------------------------------
       Text message
    ----------------------------------------------------- */

    if(d.type === "message"){

      const receiver =
        String(d.to || "").trim();

      const text =
        String(d.text || "")
          .trim()
          .slice(0,4000);

      if(!receiver || !text){
        return;
      }

      if(
        receiver === sender
      ){
        return;
      }

      const exists =
        this.ctx.storage.sql
          .exec(
            "SELECT username FROM accounts WHERE username=?",
            receiver
          )
          .toArray();

      if(!exists.length){
        return;
      }

      const now =
        Date.now();

      const result =
        this.ctx.storage.sql.exec(
          `INSERT INTO messages
           (sender,receiver,text,kind,created_at)
           VALUES(?,?,?,?,?)`,
          sender,
          receiver,
          text,
          "text",
          now
        );

      const id =
        Number(
          result.meta?.last_row_id ||
          0
        );

      const packet = {
        type:"message",
        id,
        sender,
        receiver,
        text,
        kind:"text",
        created_at:now,
        read_at:null
      };

      this.sendToBoth(
        sender,
        receiver,
        packet
      );

      return;

    }

    /* -----------------------------------------------------
       Typing
    ----------------------------------------------------- */

    if(d.type === "typing"){

      const receiver =
        String(d.to || "").trim();

      if(!receiver){
        return;
      }

      this.sendToUser(
        receiver,
        {
          type:"typing",
          from:sender,
          active:!!d.active
        }
      );

      return;

    }

    /* -----------------------------------------------------
       Read
    ----------------------------------------------------- */

    if(d.type === "read"){

      const other =
        String(d.other || "").trim();

      if(!other){
        return;
      }

      const rows =
        this.ctx.storage.sql
          .exec(
            `SELECT id
             FROM messages
             WHERE
               sender=?
               AND receiver=?
               AND read_at IS NULL`,
            other,
            sender
          )
          .toArray();

      if(!rows.length){
        return;
      }

      const now =
        Date.now();

      this.ctx.storage.sql.exec(
        `UPDATE messages
         SET read_at=?
         WHERE
           sender=?
           AND receiver=?
           AND read_at IS NULL`,
        now,
        other,
        sender
      );

      this.sendToUser(
        other,
        {
          type:"message_read",
          ids:rows.map(
            x => Number(x.id)
          )
        }
      );

      return;

    }

    /* -----------------------------------------------------
       Edit
    ----------------------------------------------------- */

    if(d.type === "edit_message"){

      const id =
        Number(d.id);

      const text =
        String(d.text || "")
          .trim()
          .slice(0,4000);

      if(!id || !text){
        return;
      }

      const rows =
        this.ctx.storage.sql
          .exec(
            `SELECT
               sender,
               receiver,
               kind,
               deleted_for_all
             FROM messages
             WHERE id=?`,
            id
          )
          .toArray();

      if(!rows.length){
        return;
      }

      const m =
        rows[0];

      if(
        m.sender !== sender ||
        m.deleted_for_all ||
        m.kind !== "text"
      ){
        return;
      }

      const now =
        Date.now();

      this.ctx.storage.sql.exec(
        `UPDATE messages
         SET text=?,edited_at=?
         WHERE id=?`,
        text,
        now,
        id
      );

      this.sendToBoth(
        sender,
        m.receiver,
        {
          type:"message_edited",
          id,
          text,
          edited_at:now
        }
      );

      return;

    }

    /* -----------------------------------------------------
       Delete
    ----------------------------------------------------- */

    if(d.type === "delete_message"){

      const id =
        Number(d.id);

      if(!id){
        return;
      }

      const rows =
        this.ctx.storage.sql
          .exec(
            `SELECT
               sender,
               receiver
             FROM messages
             WHERE id=?`,
            id
          )
          .toArray();

      if(!rows.length){
        return;
      }

      const m =
        rows[0];

      if(m.sender !== sender){
        return;
      }

      this.ctx.storage.sql.exec(
        `UPDATE messages
         SET deleted_for_all=1,
             text='',
             file_name=NULL,
             file_mime=NULL
         WHERE id=?`,
        id
      );

      this.sendToBoth(
        sender,
        m.receiver,
        {
          type:"message_deleted",
          id
        }
      );

      return;

    }

    /* -----------------------------------------------------
       RTC + File signaling
    ----------------------------------------------------- */

    const relayTypes = [
      "rtc_offer",
      "rtc_answer",
      "rtc_candidate",
      "rtc_reject",
      "rtc_hangup",

      "file_offer",
      "file_answer",
      "file_candidate",
      "file_reject"
    ];

    if(
      relayTypes.includes(
        d.type
      )
    ){

      const target =
        String(d.to || "").trim();

      if(!target){
        return;
      }

      const out = {
        ...d,
        from:sender
      };

      delete out.to;

      this.sendToUser(
        target,
        {
          type:"signal",
          ...out
        }
      );

      return;

    }

    /* -----------------------------------------------------
       Dark mode sync
    ----------------------------------------------------- */

    if(d.type === "dark_mode"){

      return;

    }

  }

  /* =======================================================
     Close
  ======================================================= */

  async webSocketClose(
    ws,
    code,
    reason
  ){

    const session =
      this.sessions.get(ws) ||
      ws.deserializeAttachment();

    this.sessions.delete(ws);

    if(session?.username){

      this.ctx.storage.sql.exec(
        "UPDATE accounts SET last_seen=? WHERE username=?",
        Date.now(),
        session.username
      );

    }

    this.broadcastUsers();

    try{
      ws.close(
        code,
        reason
      );
    }catch{}

  }

  /* =======================================================
     Error
  ======================================================= */

  async webSocketError(ws){

    const session =
      this.sessions.get(ws) ||
      ws.deserializeAttachment();

    this.sessions.delete(ws);

    if(session?.username){

      this.ctx.storage.sql.exec(
        "UPDATE accounts SET last_seen=? WHERE username=?",
        Date.now(),
        session.username
      );

    }

    this.broadcastUsers();

  }

}
