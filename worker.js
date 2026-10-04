import { DurableObject } from "cloudflare:workers";

/* =========================
   HTML
========================= */

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>الشات</title>

<style>
*{box-sizing:border-box}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#e5ddd5;
}

button,input{
  font-family:inherit;
}

.auth{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.auth-box{
  width:100%;
  max-width:380px;
  background:white;
  padding:25px;
  border-radius:18px;
  box-shadow:0 8px 30px rgba(0,0,0,.15);
}

.auth-box h2{
  margin-top:0;
  text-align:center;
}

.auth-box input{
  width:100%;
  padding:13px;
  margin:7px 0;
  border:1px solid #ddd;
  border-radius:10px;
  font-size:16px;
  outline:none;
}

.auth-box button{
  width:100%;
  padding:13px;
  border:0;
  border-radius:10px;
  background:#128c7e;
  color:white;
  font-size:16px;
  cursor:pointer;
  margin-top:8px;
}

.auth-box button:hover{
  background:#075e54;
}

.switch{
  text-align:center;
  margin-top:14px;
  color:#075e54;
  cursor:pointer;
}

#error{
  color:#d00;
  text-align:center;
  min-height:22px;
  margin-top:8px;
}

#app{
  display:none;
  height:100vh;
  overflow:hidden;
}

.layout{
  height:100%;
  display:flex;
}

.sidebar{
  width:300px;
  background:#fff;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

.sidebar-header{
  height:64px;
  background:#075e54;
  color:white;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 14px;
}

.sidebar-header strong{
  font-size:19px;
}

.logout{
  border:0;
  background:#d9534f;
  color:white;
  padding:8px 11px;
  border-radius:8px;
  cursor:pointer;
}

#users{
  overflow:auto;
  flex:1;
}

.user{
  display:flex;
  align-items:center;
  gap:10px;
  padding:13px;
  border-bottom:1px solid #eee;
  cursor:pointer;
}

.user:hover{
  background:#f3f3f3;
}

.user.self{
  background:#e8f5e9;
  cursor:default;
}

.avatar{
  width:43px;
  height:43px;
  border-radius:50%;
  background:#128c7e;
  color:white;
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

.username{
  font-weight:bold;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.status{
  color:#777;
  font-size:12px;
  margin-top:4px;
}

.status.online{
  color:#128c7e;
}

.dot{
  display:inline-block;
  width:9px;
  height:9px;
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
  display:flex;
  flex-direction:column;
  min-width:0;
}

.chat-header{
  height:64px;
  background:#075e54;
  color:white;
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 12px;
}

.chat-head-info{
  flex:1;
  min-width:0;
}

.chat-title{
  font-size:17px;
  font-weight:bold;
}

.chat-status{
  font-size:12px;
  opacity:.9;
  margin-top:3px;
}

.call-buttons{
  display:flex;
  gap:6px;
}

.call-btn{
  width:42px;
  height:42px;
  border:0;
  border-radius:50%;
  background:rgba(255,255,255,.15);
  color:white;
  font-size:19px;
  cursor:pointer;
}

.call-btn:hover{
  background:rgba(255,255,255,.25);
}

.messages{
  flex:1;
  overflow:auto;
  padding:15px;
  background:
    radial-gradient(circle at 20% 20%,rgba(255,255,255,.3),transparent 20%),
    #e5ddd5;
}

.empty{
  text-align:center;
  color:#777;
  margin-top:30px;
}

.msg{
  max-width:75%;
  padding:9px 12px;
  border-radius:10px;
  margin:6px 0;
  clear:both;
  word-break:break-word;
  box-shadow:0 1px 1px rgba(0,0,0,.08);
}

.msg.mine{
  float:right;
  background:#dcf8c6;
}

.msg.theirs{
  float:left;
  background:white;
}

.msg-time{
  display:block;
  font-size:10px;
  color:#777;
  margin-top:4px;
}

.msg audio{
  max-width:230px;
}

.typing{
  min-height:22px;
  padding:0 12px;
  color:#666;
  font-size:12px;
  background:#e5ddd5;
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
  border:0;
  outline:none;
  border-radius:22px;
  padding:12px 15px;
  font-size:15px;
  background:white;
}

.action-btn{
  width:45px;
  height:45px;
  border:0;
  border-radius:50%;
  cursor:pointer;
  font-size:19px;
}

.record{
  background:#ddd;
}

.record.recording{
  background:#e53935;
  color:white;
}

.send{
  background:#128c7e;
  color:white;
}

/* Call screen */

.call-screen{
  position:fixed;
  inset:0;
  z-index:1000;
  background:#101010;
  color:white;
  display:none;
  flex-direction:column;
}

.call-top{
  height:60px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:18px;
  background:#151515;
  z-index:3;
}

.video-area{
  flex:1;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  background:#111;
}

#remoteVideo{
  width:100%;
  height:100%;
  object-fit:contain;
  background:#111;
}

#localVideo{
  position:absolute;
  left:15px;
  top:15px;
  width:130px;
  height:180px;
  object-fit:cover;
  border-radius:12px;
  border:2px solid white;
  background:#222;
  z-index:2;
}

.call-avatar{
  width:100px;
  height:100px;
  border-radius:50%;
  background:#128c7e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:38px;
}

.call-controls{
  min-height:85px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:14px;
  background:#151515;
}

.call-control{
  width:58px;
  height:58px;
  border:0;
  border-radius:50%;
  cursor:pointer;
  background:#333;
  color:white;
  font-size:22px;
}

.call-control.end{
  background:#e53935;
}

.call-control.off{
  background:#555;
}

.incoming{
  position:fixed;
  inset:0;
  z-index:2000;
  background:rgba(0,0,0,.75);
  display:none;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.incoming-box{
  width:100%;
  max-width:350px;
  background:white;
  border-radius:18px;
  padding:25px;
  text-align:center;
}

.incoming-avatar{
  width:75px;
  height:75px;
  border-radius:50%;
  background:#128c7e;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:auto;
  font-size:30px;
}

.incoming-box h3{
  margin:15px 0 5px;
}

.incoming-box p{
  color:#666;
}

.incoming-buttons{
  display:flex;
  gap:10px;
  margin-top:20px;
}

.incoming-buttons button{
  flex:1;
  padding:12px;
  border:0;
  border-radius:10px;
  cursor:pointer;
  color:white;
  font-size:15px;
}

.accept{
  background:#20a04b;
}

.reject{
  background:#e53935;
}

@media(max-width:700px){
  .sidebar{
    width:180px;
  }

  .msg{
    max-width:85%;
  }
}

@media(max-width:430px){
  .sidebar{
    width:155px;
  }

  .call-buttons{
    gap:2px;
  }

  .call-btn{
    width:37px;
    height:37px;
  }

  #localVideo{
    width:100px;
    height:140px;
  }
}
</style>
</head>

<body>

<div id="auth" class="auth">
  <div class="auth-box">
    <h2 id="authTitle">إنشاء حساب</h2>

    <input id="username" autocomplete="username" placeholder="اسم المستخدم">
    <input id="password" type="password" autocomplete="current-password" placeholder="كلمة المرور">

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
      <div class="sidebar-header">
        <strong>المستخدمون</strong>
        <button id="logoutBtn" class="logout">خروج</button>
      </div>

      <div id="users"></div>
    </aside>

    <main class="chat">

      <div class="chat-header">

        <div id="chatAvatar" class="avatar">?</div>

        <div class="chat-head-info">
          <div id="chatTitle" class="chat-title">اختر مستخدمًا</div>
          <div id="chatStatus" class="chat-status"></div>
        </div>

        <div class="call-buttons">
          <button id="voiceCallBtn" class="call-btn" title="مكالمة صوتية">📞</button>
          <button id="videoCallBtn" class="call-btn" title="مكالمة فيديو">📹</button>
        </div>

      </div>

      <div id="messages" class="messages">
        <div class="empty">اختر مستخدمًا لبدء المحادثة</div>
      </div>

      <div id="typing" class="typing"></div>

      <div class="composer">
        <button id="recordBtn" class="action-btn record" title="تسجيل صوتي">🎙️</button>

        <input id="messageInput" placeholder="اكتب رسالة..." autocomplete="off">

        <button id="sendBtn" class="action-btn send">➤</button>
      </div>

    </main>

  </div>
</div>

<!-- Incoming call -->
<div id="incomingCall" class="incoming">

  <div class="incoming-box">

    <div id="incomingAvatar" class="incoming-avatar">?</div>

    <h3 id="incomingName">مكالمة واردة</h3>

    <p id="incomingType">مكالمة صوتية واردة</p>

    <div class="incoming-buttons">
      <button id="acceptCallBtn" class="accept">قبول</button>
      <button id="rejectCallBtn" class="reject">رفض</button>
    </div>

  </div>

</div>

<!-- Active call -->
<div id="callScreen" class="call-screen">

  <div id="callTop" class="call-top">
    مكالمة
  </div>

  <div class="video-area">

    <div id="callAvatar" class="call-avatar">?</div>

    <video id="remoteVideo" autoplay playsinline></video>

    <video id="localVideo" autoplay muted playsinline></video>

  </div>

  <div class="call-controls">

    <button id="muteBtn" class="call-control" title="كتم الميكروفون">
      🎙️
    </button>

    <button id="cameraBtn" class="call-control" title="الكاميرا">
      📹
    </button>

    <button id="endCallBtn" class="call-control end" title="إنهاء المكالمة">
      ☎
    </button>

  </div>

</div>

<audio id="remoteAudio" autoplay playsinline></audio>

<script>
let token = localStorage.getItem("chat_token") || "";
let currentUser = "";
let selectedUser = "";

let ws = null;
let reconnectTimer = null;
let typingTimer = null;

let registerMode = true;

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

/* =========================
   CALL VARIABLES
========================= */

let peerConnection = null;
let localStream = null;
let remoteStream = null;

let callPartner = "";
let callId = "";
let callType = "";

let pendingOffer = null;
let pendingCaller = "";
let pendingCallId = "";
let pendingCallType = "";

let pendingCandidates = [];

let microphoneEnabled = true;
let cameraEnabled = true;

const auth = document.getElementById("auth");
const app = document.getElementById("app");

const authTitle = document.getElementById("authTitle");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const authButton = document.getElementById("authButton");
const switchAuth = document.getElementById("switchAuth");
const errorBox = document.getElementById("error");

const usersBox = document.getElementById("users");

const chatAvatar = document.getElementById("chatAvatar");
const chatTitle = document.getElementById("chatTitle");
const chatStatus = document.getElementById("chatStatus");

const messagesBox = document.getElementById("messages");
const typingBox = document.getElementById("typing");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const recordBtn = document.getElementById("recordBtn");

const voiceCallBtn = document.getElementById("voiceCallBtn");
const videoCallBtn = document.getElementById("videoCallBtn");

const incomingCall = document.getElementById("incomingCall");
const incomingAvatar = document.getElementById("incomingAvatar");
const incomingName = document.getElementById("incomingName");
const incomingType = document.getElementById("incomingType");

const acceptCallBtn = document.getElementById("acceptCallBtn");
const rejectCallBtn = document.getElementById("rejectCallBtn");

const callScreen = document.getElementById("callScreen");
const callTop = document.getElementById("callTop");
const callAvatar = document.getElementById("callAvatar");

const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
const remoteAudio = document.getElementById("remoteAudio");

const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");
const endCallBtn = document.getElementById("endCallBtn");

/* =========================
   HELPERS
========================= */

function showError(text){
  errorBox.textContent = text || "";
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function firstLetter(name){
  return String(name || "?").charAt(0).toUpperCase();
}

function sendWS(data){
  if(!ws || ws.readyState !== WebSocket.OPEN){
    return false;
  }

  ws.send(JSON.stringify(data));
  return true;
}

function formatTime(timestamp){
  try{
    return new Date(timestamp).toLocaleTimeString("ar-EG",{
      hour:"2-digit",
      minute:"2-digit"
    });
  }catch(e){
    return "";
  }
}

/* =========================
   AUTH
========================= */

switchAuth.onclick = function(){
  registerMode = !registerMode;

  if(registerMode){
    authTitle.textContent = "إنشاء حساب";
    authButton.textContent = "إنشاء الحساب";
    switchAuth.textContent = "عندك حساب؟ تسجيل الدخول";
  }else{
    authTitle.textContent = "تسجيل الدخول";
    authButton.textContent = "تسجيل الدخول";
    switchAuth.textContent = "مفيش حساب؟ إنشاء حساب";
  }

  showError("");
};

authButton.onclick = async function(){

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if(!username || !password){
    showError("اكتب اسم المستخدم وكلمة المرور");
    return;
  }

  showError("جاري التحميل...");

  try{

    const endpoint = registerMode
      ? "/api/register"
      : "/api/login";

    const response = await fetch(endpoint,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.error || "حدث خطأ");
    }

    token = data.token;
    currentUser = data.username || username;

    localStorage.setItem("chat_token",token);

    usernameInput.value = "";
    passwordInput.value = "";
    showError("");

    auth.style.display = "none";
    app.style.display = "block";

    await loadUsers();
    connectWS();

  }catch(error){
    showError(error.message || "حدث خطأ");
  }
};

/* =========================
   SESSION
========================= */

async function showApp(){

  if(!token){
    auth.style.display = "flex";
    app.style.display = "none";
    return;
  }

  try{

    const response = await fetch(
      "/api/me?token=" + encodeURIComponent(token),
      {
        cache:"no-store"
      }
    );

    if(!response.ok){
      throw new Error("invalid");
    }

    const data = await response.json();

    currentUser = data.username;

    auth.style.display = "none";
    app.style.display = "block";

    await loadUsers();
    connectWS();

  }catch(error){

    token = "";
    currentUser = "";

    localStorage.removeItem("chat_token");

    auth.style.display = "flex";
    app.style.display = "none";
  }
}

/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn").onclick = async function(){

  try{

    if(token){

      await fetch("/api/logout",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          token
        })
      });

    }

  }catch(e){}

  endCall(false);

  if(ws){
    try{
      ws.close();
    }catch(e){}
  }

  ws = null;

  token = "";
  currentUser = "";
  selectedUser = "";

  localStorage.removeItem("chat_token");

  app.style.display = "none";
  auth.style.display = "flex";

  messagesBox.innerHTML =
    '<div class="empty">اختر مستخدمًا لبدء المحادثة</div>';

  chatTitle.textContent = "اختر مستخدمًا";
  chatStatus.textContent = "";
  chatAvatar.textContent = "?";
};

/* =========================
   USERS
========================= */

async function loadUsers(){

  if(!token) return;

  try{

    const response = await fetch(
      "/api/users?token=" + encodeURIComponent(token),
      {
        cache:"no-store"
      }
    );

    if(response.status === 401){
      return;
    }

    const data = await response.json();

    renderUsers(Array.isArray(data.users) ? data.users : []);

  }catch(error){

    console.error(error);
  }
}

function renderUsers(list){

  const users = Array.isArray(list) ? list.slice() : [];

  const foundCurrent = users.some(function(user){
    return user.username === currentUser;
  });

  if(currentUser && !foundCurrent){

    users.unshift({
      username:currentUser,
      online:true
    });
  }

  users.sort(function(a,b){

    if(a.username === currentUser) return -1;
    if(b.username === currentUser) return 1;

    return String(a.username).localeCompare(
      String(b.username),
      "ar"
    );
  });

  usersBox.innerHTML = "";

  if(users.length === 0){

    usersBox.innerHTML =
      '<div class="empty">لا يوجد مستخدمون</div>';

    return;
  }

  users.forEach(function(user){

    const row = document.createElement("div");
    row.className = "user";

    if(user.username === currentUser){
      row.classList.add("self");
    }

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = firstLetter(user.username);

    const info = document.createElement("div");
    info.className = "user-info";

    const name = document.createElement("div");
    name.className = "username";

    if(user.username === currentUser){
      name.textContent = user.username + " (أنت)";
    }else{
      name.textContent = user.username;
    }

    const status = document.createElement("div");

    if(user.username === currentUser){

      status.className = "status online";
      status.innerHTML =
        '<span class="dot online-dot"></span>أنت متصل الآن';

    }else if(user.online){

      status.className = "status online";
      status.innerHTML =
        '<span class="dot online-dot"></span>متصل الآن';

    }else{

      status.className = "status";
      status.innerHTML =
        '<span class="dot offline-dot"></span>غير متصل';
    }

    info.appendChild(name);
    info.appendChild(status);

    row.appendChild(avatar);
    row.appendChild(info);

    if(user.username !== currentUser){

      row.onclick = function(){
        selectUser(user.username,user.online);
      };

    }

    usersBox.appendChild(row);
  });
}

/* =========================
   SELECT CHAT
========================= */

function selectUser(username,online){

  selectedUser = username;

  chatAvatar.textContent = firstLetter(username);
  chatTitle.textContent = username;

  chatStatus.textContent =
    online ? "متصل الآن" : "غير متصل";

  messagesBox.innerHTML =
    '<div class="empty">جاري تحميل الرسائل...</div>';

  typingBox.textContent = "";

  sendWS({
    type:"history",
    with:username
  });
}

/* =========================
   WEBSOCKET
========================= */

function connectWS(){

  if(!token) return;

  if(ws && (
    ws.readyState === WebSocket.OPEN ||
    ws.readyState === WebSocket.CONNECTING
  )){
    return;
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

  ws.onopen = function(){

    clearTimeout(reconnectTimer);

    loadUsers();

    if(selectedUser){

      sendWS({
        type:"history",
        with:selectedUser
      });
    }
  };

  ws.onmessage = function(event){

    try{

      const data = JSON.parse(event.data);

      handleWSMessage(data);

    }catch(error){

      console.error(error);
    }
  };

  ws.onclose = function(){

    loadUsers();

    if(token){

      clearTimeout(reconnectTimer);

      reconnectTimer = setTimeout(function(){
        connectWS();
      },1500);
    }
  };

  ws.onerror = function(){};
}

/* =========================
   WEBSOCKET MESSAGES
========================= */

function handleWSMessage(data){

  if(data.type === "message"){

    if(
      data.sender === selectedUser ||
      data.receiver === selectedUser
    ){

      addTextMessage(data);
    }

    return;
  }

  if(data.type === "voice"){

    if(
      data.sender === selectedUser ||
      data.receiver === selectedUser
    ){

      addVoiceMessage(data);
    }

    return;
  }

  if(data.type === "history"){

    renderHistory(data.messages || []);
    return;
  }

  if(data.type === "typing"){

    if(data.from === selectedUser){

      if(data.typing){

        typingBox.textContent =
          data.from + " يكتب...";

      }else{

        typingBox.textContent = "";
      }
    }

    return;
  }

  if(data.type === "users_changed"){

    loadUsers();
    return;
  }

  /* =========================
     CALL SIGNAL
  ========================= */

  if(data.type === "call_signal"){

    handleCallSignal(data);
    return;
  }

  if(data.type === "call_error"){

    alert(data.error || "تعذر تنفيذ المكالمة");

    if(
      data.callId &&
      data.callId === callId
    ){

      endCall(false);
    }

    return;
  }
}

/* =========================
   TEXT MESSAGE
========================= */

function addTextMessage(data){

  if(messagesBox.querySelector(".empty")){
    messagesBox.innerHTML = "";
  }

  const div = document.createElement("div");

  div.className =
    "msg " +
    (data.sender === currentUser ? "mine" : "theirs");

  const text = document.createElement("div");
  text.textContent = data.text || "";

  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = formatTime(data.created_at);

  div.appendChild(text);
  div.appendChild(time);

  messagesBox.appendChild(div);

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

/* =========================
   VOICE MESSAGE
========================= */

function addVoiceMessage(data){

  if(messagesBox.querySelector(".empty")){
    messagesBox.innerHTML = "";
  }

  const div = document.createElement("div");

  div.className =
    "msg " +
    (data.sender === currentUser ? "mine" : "theirs");

  const audio = document.createElement("audio");

  audio.controls = true;
  audio.src = data.audio_data || "";

  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = formatTime(data.created_at);

  div.appendChild(audio);
  div.appendChild(time);

  messagesBox.appendChild(div);

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

/* =========================
   HISTORY
========================= */

function renderHistory(messages){

  messagesBox.innerHTML = "";

  if(!messages.length){

    messagesBox.innerHTML =
      '<div class="empty">لا توجد رسائل بعد</div>';

    return;
  }

  messages.forEach(function(message){

    if(message.message_type === "voice"){

      addVoiceMessage(message);

    }else{

      addTextMessage(message);
    }
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

/* =========================
   SEND MESSAGE
========================= */

function sendMessage(){

  const text = messageInput.value.trim();

  if(!text || !selectedUser){
    return;
  }

  if(!sendWS({
    type:"message",
    to:selectedUser,
    text:text
  })){
    alert("الاتصال غير جاهز");
    return;
  }

  messageInput.value = "";

  sendWS({
    type:"typing",
    to:selectedUser,
    typing:false
  });
}

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keydown",function(event){

  if(event.key === "Enter"){

    event.preventDefault();
    sendMessage();

    return;
  }

  if(selectedUser){

    sendWS({
      type:"typing",
      to:selectedUser,
      typing:true
    });

    clearTimeout(typingTimer);

    typingTimer = setTimeout(function(){

      sendWS({
        type:"typing",
        to:selectedUser,
        typing:false
      });

    },900);
  }
});

/* =========================
   VOICE RECORDING
========================= */

recordBtn.onclick = async function(){

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    return;
  }

  if(isRecording){

    try{
      mediaRecorder.stop();
    }catch(e){}

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

    mediaRecorder.ondataavailable = function(event){

      if(event.data && event.data.size > 0){
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async function(){

      isRecording = false;

      recordBtn.classList.remove("recording");
      recordBtn.textContent = "🎙️";

      stream.getTracks().forEach(function(track){
        track.stop();
      });

      const blob =
        new Blob(audioChunks,{
          type:mediaRecorder.mimeType || "audio/webm"
        });

      if(blob.size > 2 * 1024 * 1024){

        alert("الرسالة الصوتية كبيرة جدًا");
        return;
      }

      const reader = new FileReader();

      reader.onload = function(){

        sendWS({
          type:"voice",
          to:selectedUser,
          audio_data:reader.result
        });
      };

      reader.readAsDataURL(blob);
    };

    mediaRecorder.start();

    isRecording = true;

    recordBtn.classList.add("recording");
    recordBtn.textContent = "⏹️";

  }catch(error){

    alert("اسمح للمتصفح باستخدام الميكروفون");
  }
};

/* =========================================================
   WEBRTC CALLS
========================================================= */

function makeCallId(){

  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

function createPeerConnection(){

  const pc = new RTCPeerConnection({
    iceServers:[
      {
        urls:"stun:stun.l.google.com:19302"
      },
      {
        urls:"stun:stun1.l.google.com:19302"
      }
    ]
  });

  pc.onicecandidate = function(event){

    if(event.candidate && callPartner){

      sendWS({
        type:"call_signal",
        signalType:"candidate",
        to:callPartner,
        callId:callId,
        candidate:event.candidate
      });
    }
  };

  pc.ontrack = function(event){

    if(!remoteStream){
      remoteStream = new MediaStream();
    }

    event.streams[0].getTracks().forEach(function(track){

      const already =
        remoteStream.getTracks().some(function(t){
          return t.id === track.id;
        });

      if(!already){
        remoteStream.addTrack(track);
      }
    });

    if(callType === "video"){

      remoteVideo.srcObject = remoteStream;
      remoteVideo.style.display = "block";
      callAvatar.style.display = "none";

    }else{

      remoteAudio.srcObject = remoteStream;

      remoteVideo.style.display = "none";
      callAvatar.style.display = "flex";

      remoteAudio.play().catch(function(){});
    }
  };

  pc.onconnectionstatechange = function(){

    const state = pc.connectionState;

    if(state === "connected"){

      callTop.textContent =
        "متصل مع " + callPartner;

    }

    if(
      state === "failed" ||
      state === "closed"
    ){

      endCall(false);
    }

    if(state === "disconnected"){

      setTimeout(function(){

        if(
          peerConnection === pc &&
          pc.connectionState === "disconnected"
        ){

          endCall(false);
        }

      },5000);
    }
  };

  return pc;
}

async function getLocalMedia(type){

  if(localStream){
    return localStream;
  }

  const constraints =
    type === "video"
      ? {
          audio:true,
          video:{
            facingMode:"user"
          }
        }
      : {
          audio:true,
          video:false
        };

  localStream =
    await navigator.mediaDevices.getUserMedia(
      constraints
    );

  localStream.getTracks().forEach(function(track){

    peerConnection.addTrack(
      track,
      localStream
    );
  });

  if(type === "video"){

    localVideo.srcObject = localStream;
    localVideo.style.display = "block";

  }else{

    localVideo.style.display = "none";
  }

  return localStream;
}

function showCallScreen(){

  callScreen.style.display = "flex";

  callTop.textContent =
    "جاري الاتصال بـ " + callPartner;

  callAvatar.textContent =
    firstLetter(callPartner);

  if(callType === "video"){

    remoteVideo.style.display = "block";

    localVideo.style.display = "block";

    callAvatar.style.display = "none";

  }else{

    remoteVideo.style.display = "none";

    localVideo.style.display = "none";

    callAvatar.style.display = "flex";
  }
}

async function startCall(type){

  if(!selectedUser){

    alert("اختر مستخدمًا أولًا");
    return;
  }

  if(
    peerConnection ||
    callPartner
  ){

    alert("هناك مكالمة بالفعل");
    return;
  }

  if(!ws || ws.readyState !== WebSocket.OPEN){

    alert("الاتصال بالخادم غير جاهز");
    return;
  }

  callPartner = selectedUser;
  callType = type;
  callId = makeCallId();

  try{

    peerConnection = createPeerConnection();

    await getLocalMedia(type);

    const offer =
      await peerConnection.createOffer();

    await peerConnection.setLocalDescription(
      offer
    );

    showCallScreen();

    const sent = sendWS({
      type:"call_signal",
      signalType:"offer",
      to:callPartner,
      callId:callId,
      callType:callType,
      sdp:peerConnection.localDescription
    });

    if(!sent){

      endCall(false);
      alert("تعذر إرسال المكالمة");
    }

  }catch(error){

    console.error(error);

    endCall(false);

    alert(
      "تعذر تشغيل المكالمة. تأكد من السماح بالميكروفون أو الكاميرا."
    );
  }
}

voiceCallBtn.onclick = function(){

  if(peerConnection || callPartner){

    endCall(true);

  }else{

    startCall("audio");
  }
};

videoCallBtn.onclick = function(){

  if(peerConnection || callPartner){

    endCall(true);

  }else{

    startCall("video");
  }
};

/* =========================
   INCOMING CALL
========================= */

function showIncomingCall(data){

  pendingOffer = data.sdp;
  pendingCaller = data.from;
  pendingCallId = data.callId || "";
  pendingCallType = data.callType === "video"
    ? "video"
    : "audio";

  incomingAvatar.textContent =
    firstLetter(pendingCaller);

  incomingName.textContent =
    pendingCaller;

  incomingType.textContent =
    pendingCallType === "video"
      ? "مكالمة فيديو واردة"
      : "مكالمة صوتية واردة";

  incomingCall.style.display = "flex";
}

acceptCallBtn.onclick = async function(){

  if(!pendingOffer || !pendingCaller){
    hideIncomingCall();
    return;
  }

  const offer = pendingOffer;
  const caller = pendingCaller;
  const incomingId = pendingCallId;
  const type = pendingCallType;

  hideIncomingCall();

  callPartner = caller;
  callId = incomingId;
  callType = type;

  try{

    peerConnection =
      createPeerConnection();

    await getLocalMedia(type);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    await addPendingCandidates();

    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(
      answer
    );

    showCallScreen();

    sendWS({
      type:"call_signal",
      signalType:"answer",
      to:callPartner,
      callId:callId,
      sdp:peerConnection.localDescription
    });

  }catch(error){

    console.error(error);

    sendWS({
      type:"call_signal",
      signalType:"reject",
      to:caller,
      callId:incomingId,
      reason:"تعذر تشغيل المكالمة"
    });

    endCall(false);

    alert(
      "تعذر تشغيل المكالمة. اسمح بالميكروفون أو الكاميرا."
    );
  }

  pendingOffer = null;
  pendingCaller = "";
  pendingCallId = "";
  pendingCallType = "";
};

rejectCallBtn.onclick = function(){

  if(pendingCaller){

    sendWS({
      type:"call_signal",
      signalType:"reject",
      to:pendingCaller,
      callId:pendingCallId,
      reason:"تم رفض المكالمة"
    });
  }

  hideIncomingCall();

  pendingOffer = null;
  pendingCaller = "";
  pendingCallId = "";
  pendingCallType = "";
};

function hideIncomingCall(){

  incomingCall.style.display = "none";
}

/* =========================
   CALL SIGNAL HANDLER
========================= */

async function handleCallSignal(data){

  if(data.signalType === "offer"){

    if(peerConnection || callPartner){

      sendWS({
        type:"call_signal",
        signalType:"reject",
        to:data.from,
        callId:data.callId || "",
        reason:"المستخدم مشغول"
      });

      return;
    }

    showIncomingCall(data);

    return;
  }

  if(data.signalType === "answer"){

    if(
      !peerConnection ||
      data.callId !== callId
    ){
      return;
    }

    try{

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );

      await addPendingCandidates();

    }catch(error){

      console.error(error);
      endCall(false);
    }

    return;
  }

  if(data.signalType === "candidate"){

    if(
      !peerConnection ||
      data.callId !== callId
    ){
      return;
    }

    try{

      if(
        peerConnection.remoteDescription &&
        peerConnection.remoteDescription.type
      ){

        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );

      }else{

        pendingCandidates.push(data.candidate);
      }

    }catch(error){

      console.error("ICE error",error);
    }

    return;
  }

  if(data.signalType === "reject"){

    alert(
      data.reason ||
      "تم رفض المكالمة"
    );

    endCall(false);

    return;
  }

  if(data.signalType === "end"){

    endCall(false);

    return;
  }
}

async function addPendingCandidates(){

  if(!peerConnection){
    return;
  }

  const list =
    pendingCandidates.slice();

  pendingCandidates = [];

  for(
    let i = 0;
    i < list.length;
    i++
  ){

    try{

      await peerConnection.addIceCandidate(
        new RTCIceCandidate(list[i])
      );

    }catch(error){

      console.error(error);
    }
  }
}

/* =========================
   CALL CONTROLS
========================= */

muteBtn.onclick = function(){

  if(!localStream) return;

  const tracks =
    localStream.getAudioTracks();

  if(!tracks.length) return;

  microphoneEnabled =
    !microphoneEnabled;

  tracks.forEach(function(track){
    track.enabled = microphoneEnabled;
  });

  muteBtn.textContent =
    microphoneEnabled
      ? "🎙️"
      : "🔇";
};

cameraBtn.onclick = function(){

  if(!localStream || callType !== "video"){
    return;
  }

  const tracks =
    localStream.getVideoTracks();

  if(!tracks.length) return;

  cameraEnabled =
    !cameraEnabled;

  tracks.forEach(function(track){
    track.enabled = cameraEnabled;
  });

  cameraBtn.textContent =
    cameraEnabled
      ? "📹"
      : "🚫";
};

endCallBtn.onclick = function(){

  endCall(true);
};

function endCall(notify){

  const oldPartner = callPartner;
  const oldCallId = callId;

  if(
    notify &&
    oldPartner &&
    ws &&
    ws.readyState === WebSocket.OPEN
  ){

    sendWS({
      type:"call_signal",
      signalType:"end",
      to:oldPartner,
      callId:oldCallId
    });
  }

  if(peerConnection){

    try{
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.close();
    }catch(e){}
  }

  peerConnection = null;

  if(localStream){

    localStream.getTracks().forEach(function(track){
      try{
        track.stop();
      }catch(e){}
    });
  }

  localStream = null;
  remoteStream = null;

  remoteVideo.srcObject = null;
  localVideo.srcObject = null;
  remoteAudio.srcObject = null;

  callPartner = "";
  callId = "";
  callType = "";

  pendingCandidates = [];

  microphoneEnabled = true;
  cameraEnabled = true;

  muteBtn.textContent = "🎙️";
  cameraBtn.textContent = "📹";

  callScreen.style.display = "none";

  hideIncomingCall();

  pendingOffer = null;
  pendingCaller = "";
  pendingCallId = "";
  pendingCallType = "";
}

/* =========================
   START
========================= */

showApp();

</script>
</body>
</html>`;

/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(request, env){

    const url = new URL(request.url);

    /* الصفحة */

    if(request.method === "GET" && url.pathname === "/"){
      return new Response(HTML,{
        headers:{
          "Content-Type":"text/html;charset=UTF-8"
        }
      });
    }

    /* تسجيل */

    if(
      request.method === "POST" &&
      url.pathname === "/api/register"
    ){

      return handleRegister(request,env);
    }

    /* تسجيل الدخول */

    if(
      request.method === "POST" &&
      url.pathname === "/api/login"
    ){

      return handleLogin(request,env);
    }

    /* تسجيل الخروج */

    if(
      request.method === "POST" &&
      url.pathname === "/api/logout"
    ){

      return handleLogout(request,env);
    }

    /* المستخدم الحالي */

    if(
      request.method === "GET" &&
      url.pathname === "/api/me"
    ){

      return handleMe(request,env);
    }

    /* المستخدمون */

    if(
      request.method === "GET" &&
      url.pathname === "/api/users"
    ){

      return handleUsers(request,env);
    }

    /* WebSocket */

    if(
      request.method === "GET" &&
      url.pathname === "/ws"
    ){

      return handleWebSocket(request,env);
    }

    return new Response("Not Found",{
      status:404
    });
  }
};

/* =========================================================
   HELPERS
========================================================= */

function json(data,status=200){

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":"application/json;charset=UTF-8"
      }
    }
  );
}

async function readJSON(request){

  try{
    return await request.json();
  }catch(e){
    return {};
  }
}

function getRoom(env){

  const id =
    env.CHAT_ROOM.idFromName("main");

  return env.CHAT_ROOM.get(id);
}

/* =========================================================
   REGISTER
========================================================= */

async function handleRegister(request,env){

  const body = await readJSON(request);

  const username =
    String(body.username || "").trim();

  const password =
    String(body.password || "");

  if(!username || !password){

    return json({
      error:"اسم المستخدم وكلمة المرور مطلوبان"
    },400);
  }

  if(username.length < 3){

    return json({
      error:"اسم المستخدم يجب أن يكون 3 أحرف على الأقل"
    },400);
  }

  if(username.length > 30){

    return json({
      error:"اسم المستخدم طويل جدًا"
    },400);
  }

  if(password.length < 4){

    return json({
      error:"كلمة المرور قصيرة جدًا"
    },400);
  }

  const room = getRoom(env);

  const response =
    await room.fetch(
      new Request(
        "https://internal/register",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            username,
            password
          })
        }
      )
    );

  return response;
}

/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(request,env){

  const body = await readJSON(request);

  const username =
    String(body.username || "").trim();

  const password =
    String(body.password || "");

  if(!username || !password){

    return json({
      error:"اسم المستخدم وكلمة المرور مطلوبان"
    },400);
  }

  const room = getRoom(env);

  const response =
    await room.fetch(
      new Request(
        "https://internal/login",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            username,
            password
          })
        }
      )
    );

  return response;
}

/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout(request,env){

  const body = await readJSON(request);

  const token =
    String(body.token || "");

  const room = getRoom(env);

  return room.fetch(
    new Request(
      "https://internal/logout",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          token
        })
      }
    )
  );
}

/* =========================================================
   ME
========================================================= */

async function handleMe(request,env){

  const url = new URL(request.url);

  const token =
    url.searchParams.get("token") || "";

  const room = getRoom(env);

  return room.fetch(
    new Request(
      "https://internal/me?token=" +
      encodeURIComponent(token)
    )
  );
}

/* =========================================================
   USERS
========================================================= */

async function handleUsers(request,env){

  const url = new URL(request.url);

  const token =
    url.searchParams.get("token") || "";

  const room = getRoom(env);

  return room.fetch(
    new Request(
      "https://internal/users?token=" +
      encodeURIComponent(token)
    )
  );
}

/* =========================================================
   WEBSOCKET
========================================================= */

async function handleWebSocket(request,env){

  if(request.headers.get("Upgrade") !== "websocket"){

    return new Response(
      "Expected WebSocket",
      {
        status:426
      }
    );
  }

  const room = getRoom(env);

  return room.fetch(
    new Request(
      "https://internal/websocket",
      request
    )
  );
}

/* =========================================================
   DURABLE OBJECT
========================================================= */

export class ChatRoom extends DurableObject{

  constructor(ctx,env){

    super(ctx,env);

    this.ctx = ctx;
    this.env = env;

    this.connections = new Map();

    this.initDatabase();
  }

  /* =========================
     DATABASE
  ========================= */

  initDatabase(){

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT 0,
        expires_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT,
        message_type TEXT NOT NULL DEFAULT 'text',
        audio_data TEXT,
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    /* =========================
       ACCOUNTS MIGRATION
    ========================= */

    try{

      const columns =
        this.ctx.storage.sql
          .exec("PRAGMA table_info(accounts)")
          .toArray();

      const names =
        columns.map(function(row){
          return row.name;
        });

      if(!names.includes("salt")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE accounts
          ADD COLUMN salt TEXT NOT NULL DEFAULT ''
        `);
      }

      if(!names.includes("created_at")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE accounts
          ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0
        `);
      }

    }catch(error){

      console.error("accounts migration",error);
    }

    /* =========================
       SESSIONS MIGRATION
    ========================= */

    try{

      const columns =
        this.ctx.storage.sql
          .exec("PRAGMA table_info(sessions)")
          .toArray();

      const names =
        columns.map(function(row){
          return row.name;
        });

      if(!names.includes("created_at")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE sessions
          ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0
        `);
      }

      if(!names.includes("expires_at")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE sessions
          ADD COLUMN expires_at INTEGER NOT NULL DEFAULT 0
        `);
      }

    }catch(error){

      console.error("sessions migration",error);
    }

    /* =========================
       MESSAGES MIGRATION
    ========================= */

    try{

      const columns =
        this.ctx.storage.sql
          .exec("PRAGMA table_info(messages)")
          .toArray();

      const names =
        columns.map(function(row){
          return row.name;
        });

      if(!names.includes("message_type")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE messages
          ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text'
        `);
      }

      if(!names.includes("audio_data")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE messages
          ADD COLUMN audio_data TEXT
        `);
      }

      if(!names.includes("created_at")){

        this.ctx.storage.sql.exec(`
          ALTER TABLE messages
          ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0
        `);
      }

    }catch(error){

      console.error("messages migration",error);
    }
  }

  /* =========================
     FETCH INSIDE DO
  ========================= */

  async fetch(request){

    const url = new URL(request.url);

    if(url.pathname === "/register"){

      return this.register(request);
    }

    if(url.pathname === "/login"){

      return this.login(request);
    }

    if(url.pathname === "/logout"){

      return this.logout(request);
    }

    if(url.pathname === "/me"){

      return this.me(request);
    }

    if(url.pathname === "/users"){

      return this.users(request);
    }

    if(url.pathname === "/websocket"){

      return this.websocket(request);
    }

    return new Response("Not Found",{
      status:404
    });
  }

  /* =========================
     REGISTER
  ========================= */

  async register(request){

    const body = await request.json();

    const username =
      String(body.username || "").trim();

    const password =
      String(body.password || "");

    try{

      const existing =
        this.ctx.storage.sql
          .exec(
            "SELECT username FROM accounts WHERE username = ?",
            username
          )
          .toArray();

      if(existing.length){

        return json({
          error:"اسم المستخدم موجود بالفعل"
        },409);
      }

      const salt =
        bytesToHex(randomBytes(16));

      const passwordHash =
        await hashPassword(
          password,
          salt
        );

      const now = Date.now();

      this.ctx.storage.sql.exec(
        `
        INSERT INTO accounts
        (
          username,
          password_hash,
          salt,
          created_at
        )
        VALUES(?,?,?,?)
        `,
        username,
        passwordHash,
        salt,
        now
      );

      /* تسجيل الدخول تلقائي */

      const token = randomToken();

      const expiresAt =
        9999999999999;

      this.ctx.storage.sql.exec(
        `
        INSERT INTO sessions
        (
          token,
          username,
          created_at,
          expires_at
        )
        VALUES(?,?,?,?)
        `,
        token,
        username,
        now,
        expiresAt
      );

      this.broadcastUsersChanged();

      return json({
        ok:true,
        token,
        username
      });

    }catch(error){

      console.error(error);

      return json({
        error:
          "حدث خطأ أثناء إنشاء الحساب: " +
          error.message
      },500);
    }
  }

  /* =========================
     LOGIN
  ========================= */

  async login(request){

    const body = await request.json();

    const username =
      String(body.username || "").trim();

    const password =
      String(body.password || "");

    try{

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

        return json({
          error:"اسم المستخدم أو كلمة المرور غير صحيحة"
        },401);
      }

      const account = rows[0];

      const hash =
        await hashPassword(
          password,
          account.salt
        );

      if(hash !== account.password_hash){

        return json({
          error:"اسم المستخدم أو كلمة المرور غير صحيحة"
        },401);
      }

      const token = randomToken();

      const now = Date.now();

      const expiresAt =
        9999999999999;

      this.ctx.storage.sql.exec(
        `
        INSERT INTO sessions
        (
          token,
          username,
          created_at,
          expires_at
        )
        VALUES(?,?,?,?)
        `,
        token,
        username,
        now,
        expiresAt
      );

      return json({
        ok:true,
        token,
        username
      });

    }catch(error){

      console.error(error);

      return json({
        error:
          "حدث خطأ أثناء تسجيل الدخول: " +
          error.message
      },500);
    }
  }

  /* =========================
     LOGOUT
  ========================= */

  async logout(request){

    try{

      const body = await request.json();

      const token =
        String(body.token || "");

      if(token){

        this.ctx.storage.sql.exec(
          "DELETE FROM sessions WHERE token = ?",
          token
        );
      }

      return json({
        ok:true
      });

    }catch(error){

      return json({
        ok:true
      });
    }
  }

  /* =========================
     ME
  ========================= */

  async me(request){

    const url = new URL(request.url);

    const token =
      url.searchParams.get("token") || "";

    const username =
      this.getUserFromToken(token);

    if(!username){

      return json({
        error:"الجلسة غير صالحة"
      },401);
    }

    return json({
      ok:true,
      username
    });
  }

  /* =========================
     USERS
  ========================= */

  async users(request){

    const url = new URL(request.url);

    const token =
      url.searchParams.get("token") || "";

    const current =
      this.getUserFromToken(token);

    if(!current){

      return json({
        error:"الجلسة غير صالحة"
      },401);
    }

    const rows =
      this.ctx.storage.sql
        .exec(
          "SELECT username FROM accounts ORDER BY username"
        )
        .toArray();

    const onlineNames =
      this.getOnlineUsernames();

    const users =
      rows.map(function(row){

        return {
          username:row.username,
          online:
            row.username === current ||
            onlineNames.has(row.username)
        };

      });

    return json({
      users
    });
  }

  /* =========================
     TOKEN
  ========================= */

  getUserFromToken(token){

    if(!token){
      return null;
    }

    try{

      const rows =
        this.ctx.storage.sql
          .exec(
            `
            SELECT username
            FROM sessions
            WHERE token = ?
            `,
            token
          )
          .toArray();

      if(!rows.length){
        return null;
      }

      return rows[0].username;

    }catch(error){

      console.error(error);

      return null;
    }
  }

  /* =========================
     ONLINE USERS
  ========================= */

  getOnlineUsernames(){

    const result =
      new Set();

    try{

      const sockets =
        this.ctx.getWebSockets();

      for(
        let i = 0;
        i < sockets.length;
        i++
      ){

        const socket =
          sockets[i];

        try{

          const attachment =
            socket.deserializeAttachment();

          if(
            attachment &&
            attachment.username
          ){

            result.add(
              attachment.username
            );
          }

        }catch(error){}
      }

    }catch(error){

      for(
        const username of this.connections.keys()
      ){

        result.add(username);
      }
    }

    for(
      const username of this.connections.keys()
    ){

      result.add(username);
    }

    return result;
  }

  /* =========================
     WEBSOCKET
  ========================= */

  async websocket(request){

    const url = new URL(request.url);

    const token =
      url.searchParams.get("token") || "";

    const username =
      this.getUserFromToken(token);

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

    try{

      server.serializeAttachment({
        username
      });

    }catch(error){}

    if(!this.connections.has(username)){

      this.connections.set(
        username,
        new Set()
      );
    }

    this.connections
      .get(username)
      .add(server);

    server.addEventListener(
      "message",
      event => {

        this.webSocketMessage(
          server,
          username,
          event
        );

      }
    );

    server.addEventListener(
      "close",
      () => {

        this.removeConnection(
          username,
          server
        );

      }
    );

    server.addEventListener(
      "error",
      () => {

        this.removeConnection(
          username,
          server
        );

      }
    );

    this.broadcastUsersChanged();

    return new Response(null,{
      status:101,
      webSocket:client
    });
  }

  /* =========================
     REMOVE CONNECTION
  ========================= */

  removeConnection(
    username,
    socket
  ){

    const set =
      this.connections.get(username);

    if(set){

      set.delete(socket);

      if(set.size === 0){

        this.connections.delete(username);
      }
    }

    this.broadcastUsersChanged();
  }

  /* =========================
     SOCKET MESSAGE
  ========================= */

  async webSocketMessage(
    socket,
    username,
    event
  ){

    let data;

    try{

      data =
        JSON.parse(event.data);

    }catch(error){

      return;
    }

    /* =========================
       TEXT
    ========================= */

    if(data.type === "message"){

      const to =
        String(data.to || "").trim();

      const text =
        String(data.text || "");

      if(!to || !text){
        return;
      }

      if(text.length > 5000){
        return;
      }

      const target =
        this.accountExists(to);

      if(!target){
        return;
      }

      const createdAt =
        Date.now();

      this.ctx.storage.sql.exec(
        `
        INSERT INTO messages
        (
          sender,
          receiver,
          text,
          message_type,
          created_at
        )
        VALUES(?,?,?,?,?)
        `,
        username,
        to,
        text,
        "text",
        createdAt
      );

      const message = {
        type:"message",
        sender:username,
        receiver:to,
        text:text,
        created_at:createdAt
      };

      this.sendToUser(
        username,
        JSON.stringify(message)
      );

      if(to !== username){

        this.sendToUser(
          to,
          JSON.stringify(message)
        );
      }

      return;
    }

    /* =========================
       VOICE
    ========================= */

    if(data.type === "voice"){

      const to =
        String(data.to || "").trim();

      const audioData =
        String(data.audio_data || "");

      if(!to || !audioData){
        return;
      }

      if(audioData.length > 3000000){

        this.sendSocket(
          socket,
          JSON.stringify({
            type:"call_error",
            error:"الرسالة الصوتية كبيرة جدًا"
          })
        );

        return;
      }

      if(!this.accountExists(to)){
        return;
      }

      const createdAt =
        Date.now();

      this.ctx.storage.sql.exec(
        `
        INSERT INTO messages
        (
          sender,
          receiver,
          text,
          message_type,
          audio_data,
          created_at
        )
        VALUES(?,?,?,?,?,?)
        `,
        username,
        to,
        "",
        "voice",
        audioData,
        createdAt
      );

      const message = {
        type:"voice",
        sender:username,
        receiver:to,
        audio_data:audioData,
        created_at:createdAt
      };

      this.sendToUser(
        username,
        JSON.stringify(message)
      );

      if(to !== username){

        this.sendToUser(
          to,
          JSON.stringify(message)
        );
      }

      return;
    }

    /* =========================
       HISTORY
    ========================= */

    if(data.type === "history"){

      const withUser =
        String(data.with || "").trim();

      if(!withUser){
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
              message_type,
              audio_data,
              created_at
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
            LIMIT 500
            `,
            username,
            withUser,
            withUser,
            username
          )
          .toArray();

      this.sendSocket(
        socket,
        JSON.stringify({
          type:"history",
          with:withUser,
          messages:rows
        })
      );

      return;
    }

    /* =========================
       TYPING
    ========================= */

    if(data.type === "typing"){

      const to =
        String(data.to || "").trim();

      if(!to){
        return;
      }

      this.sendToUser(
        to,
        JSON.stringify({
          type:"typing",
          from:username,
          typing:Boolean(data.typing)
        })
      );

      return;
    }

    /* =====================================================
       VOICE / VIDEO CALL SIGNALING
    ===================================================== */

    if(data.type === "call_signal"){

      const to =
        String(data.to || "").trim();

      const signalType =
        String(data.signalType || "");

      const allowed = [
        "offer",
        "answer",
        "candidate",
        "reject",
        "end"
      ];

      if(!to || !allowed.includes(signalType)){
        return;
      }

      if(!this.accountExists(to)){

        this.sendSocket(
          socket,
          JSON.stringify({
            type:"call_error",
            error:"المستخدم غير موجود",
            callId:data.callId || ""
          })
        );

        return;
      }

      const payload = {
        type:"call_signal",
        from:username,
        to:to,
        signalType:signalType,
        callId:String(data.callId || ""),
        callType:
          data.callType === "video"
            ? "video"
            : "audio"
      };

      if(signalType === "offer"){

        payload.sdp =
          data.sdp || null;
      }

      if(signalType === "answer"){

        payload.sdp =
          data.sdp || null;
      }

      if(signalType === "candidate"){

        payload.candidate =
          data.candidate || null;
      }

      if(signalType === "reject"){

        payload.reason =
          String(data.reason || "تم رفض المكالمة");
      }

      const sent =
        this.sendToUser(
          to,
          JSON.stringify(payload)
        );

      if(!sent){

        this.sendSocket(
          socket,
          JSON.stringify({
            type:"call_error",
            error:"المستخدم غير متصل حاليًا",
            callId:data.callId || ""
          })
        );
      }

      return;
    }
  }

  /* =========================
     ACCOUNT EXISTS
  ========================= */

  accountExists(username){

    const rows =
      this.ctx.storage.sql
        .exec(
          "SELECT username FROM accounts WHERE username = ?",
          username
        )
        .toArray();

    return rows.length > 0;
  }

  /* =========================
     SEND SOCKET
  ========================= */

  sendSocket(
    socket,
    message
  ){

    try{

      if(socket.readyState === 1){

        socket.send(message);
        return true;
      }

    }catch(error){}

    return false;
  }

  /* =========================
     SEND TO USER
  ========================= */

  sendToUser(
    username,
    message
  ){

    let sent = false;

    const set =
      this.connections.get(username);

    if(set){

      for(
        const socket of set
      ){

        if(
          this.sendSocket(
            socket,
            message
          )
        ){

          sent = true;
        }
      }
    }

    /* Durable Object sockets */

    try{

      const sockets =
        this.ctx.getWebSockets();

      for(
        let i = 0;
        i < sockets.length;
        i++
      ){

        const socket =
          sockets[i];

        try{

          const attachment =
            socket.deserializeAttachment();

          if(
            attachment &&
            attachment.username === username
          ){

            if(
              this.sendSocket(
                socket,
                message
              )
            ){

              sent = true;
            }
          }

        }catch(error){}
      }

    }catch(error){}

    return sent;
  }

  /* =========================
     USERS CHANGED
  ========================= */

  broadcastUsersChanged(){

    const message =
      JSON.stringify({
        type:"users_changed"
      });

    try{

      const sockets =
        this.ctx.getWebSockets();

      for(
        let i = 0;
        i < sockets.length;
        i++
      ){

        this.sendSocket(
          sockets[i],
          message
        );
      }

    }catch(error){}

    for(
      const set of this.connections.values()
    ){

      for(
        const socket of set
      ){

        this.sendSocket(
          socket,
          message
        );
      }
    }
  }
}

/* =========================================================
   PASSWORD HASHING
========================================================= */

async function hashPassword(
  password,
  saltHex
){

  const encoder =
    new TextEncoder();

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      {
        name:"PBKDF2"
      },
      false,
      [
        "deriveBits"
      ]
    );

  const salt =
    hexToBytes(saltHex);

  const bits =
    await crypto.subtle.deriveBits(
      {
        name:"PBKDF2",
        salt:salt,
        iterations:100000,
        hash:"SHA-256"
      },
      keyMaterial,
      256
    );

  return bytesToHex(
    new Uint8Array(bits)
  );
}

/* =========================================================
   RANDOM
========================================================= */

function randomBytes(length){

  const bytes =
    new Uint8Array(length);

  crypto.getRandomValues(bytes);

  return bytes;
}

function randomToken(){

  return bytesToHex(
    randomBytes(32)
  );
}

function bytesToHex(bytes){

  let result = "";

  for(
    let i = 0;
    i < bytes.length;
    i++
  ){

    result +=
      bytes[i]
        .toString(16)
        .padStart(2,"0");
  }

  return result;
}

function hexToBytes(hex){

  const bytes =
    new Uint8Array(
      hex.length / 2
    );

  for(
    let i = 0;
    i < bytes.length;
    i++
  ){

    bytes[i] =
      parseInt(
        hex.substr(i * 2,2),
        16
      );
  }

  return bytes;
}
