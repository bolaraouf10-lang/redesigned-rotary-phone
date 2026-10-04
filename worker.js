import { DurableObject } from "cloudflare:workers";

/* =========================================================
   إعدادات
========================================================= */

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SESSION_FOREVER = 9999999999999;

/* =========================================================
   HTML
========================================================= */

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
  color:#222;
}

button,input{
  font-family:inherit;
}

button{
  cursor:pointer;
}

#auth{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px;
}

.auth-box{
  width:100%;
  max-width:390px;
  background:white;
  padding:25px;
  border-radius:18px;
  box-shadow:0 8px 30px #0002;
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
  outline:none;
}

.auth-box button{
  width:100%;
  padding:13px;
  margin-top:8px;
  border:0;
  border-radius:10px;
  background:#128c7e;
  color:white;
  font-size:16px;
}

#switchAuth{
  background:#eee;
  color:#333;
}

#error{
  color:#d00;
  min-height:22px;
  margin-top:8px;
  text-align:center;
}

#app{
  display:none;
  height:100vh;
  overflow:hidden;
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

.side-head{
  background:#075e54;
  color:white;
  padding:13px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.side-head-title{
  font-size:20px;
  font-weight:bold;
}

.head-actions{
  display:flex;
  gap:5px;
}

.head-actions button{
  border:0;
  background:#ffffff22;
  color:white;
  border-radius:8px;
  padding:8px;
}

#users{
  overflow:auto;
  flex:1;
}

.user{
  padding:13px;
  border-bottom:1px solid #eee;
  display:flex;
  align-items:center;
  gap:10px;
  cursor:pointer;
}

.user:hover{
  background:#f4f4f4;
}

.user.active{
  background:#e8f5f3;
}

.avatar{
  width:43px;
  height:43px;
  border-radius:50%;
  background:#128c7e;
  color:white;
  display:flex;
  justify-content:center;
  align-items:center;
  font-weight:bold;
}

.user-info{
  flex:1;
}

.user-name{
  font-weight:bold;
}

.status{
  font-size:12px;
  color:#777;
  margin-top:3px;
}

.dot{
  width:10px;
  height:10px;
  border-radius:50%;
}

.online-dot{
  background:#20c55a;
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

.chat-head{
  background:#075e54;
  color:white;
  padding:10px 14px;
  display:flex;
  align-items:center;
  gap:10px;
}

.chat-head-info{
  flex:1;
}

#chatTitle{
  font-weight:bold;
}

#chatStatus{
  font-size:12px;
  opacity:.8;
}

.call-actions{
  display:flex;
  gap:5px;
}

.call-actions button{
  border:0;
  background:#ffffff22;
  color:white;
  padding:8px 10px;
  border-radius:8px;
}

#messages{
  flex:1;
  overflow:auto;
  padding:15px;
}

.message{
  max-width:75%;
  margin:6px 0;
  padding:9px 12px;
  border-radius:12px;
  word-break:break-word;
  position:relative;
}

.message.me{
  margin-right:auto;
  background:#dcf8c6;
}

.message.other{
  margin-left:auto;
  background:white;
}

.message-time{
  font-size:10px;
  color:#777;
  margin-top:4px;
}

.file-message{
  display:flex;
  flex-direction:column;
  gap:7px;
}

.file-message a{
  color:#075e54;
  font-weight:bold;
  text-decoration:none;
}

.file-size{
  font-size:11px;
  color:#777;
}

.audio-message audio{
  max-width:230px;
}

#typing{
  min-height:20px;
  padding:0 15px;
  color:#777;
  font-size:12px;
}

.composer{
  background:#eee;
  padding:8px;
  display:flex;
  gap:7px;
  align-items:center;
}

.composer input{
  flex:1;
  border:0;
  border-radius:20px;
  padding:12px 15px;
  outline:none;
}

.composer button{
  width:43px;
  height:43px;
  border:0;
  border-radius:50%;
  background:#128c7e;
  color:white;
  font-size:18px;
}

#fileInput{
  display:none;
}

#progressBox{
  display:none;
  background:#fff;
  padding:7px 12px;
  font-size:12px;
}

#progressBar{
  width:100%;
  height:6px;
}

.modal{
  display:none;
  position:fixed;
  inset:0;
  background:#0008;
  z-index:100;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.modal-box{
  width:100%;
  max-width:390px;
  background:white;
  border-radius:18px;
  padding:20px;
}

.modal-box h3{
  margin-top:0;
}

.modal-box button{
  width:100%;
  padding:12px;
  margin-top:8px;
  border:0;
  border-radius:10px;
}

.danger{
  background:#d93025;
  color:white;
}

.cancel{
  background:#eee;
}

#incomingCall,
#activeCall{
  display:none;
  position:fixed;
  inset:0;
  z-index:200;
  background:#111;
  color:white;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  padding:20px;
}

.call-box{
  text-align:center;
}

.call-avatar{
  width:90px;
  height:90px;
  border-radius:50%;
  background:#128c7e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:40px;
  margin:auto;
}

.call-buttons{
  display:flex;
  gap:10px;
  justify-content:center;
  margin-top:25px;
}

.call-buttons button{
  border:0;
  border-radius:50%;
  width:55px;
  height:55px;
  font-size:20px;
}

.accept{
  background:#20c55a;
  color:white;
}

.reject{
  background:#d93025;
  color:white;
}

.end{
  background:#d93025;
  color:white;
}

#remoteVideo{
  width:90%;
  max-width:700px;
  max-height:65vh;
  background:#000;
  border-radius:12px;
}

#localVideo{
  position:absolute;
  width:130px;
  height:180px;
  object-fit:cover;
  bottom:110px;
  right:20px;
  background:#000;
  border-radius:10px;
}

.call-type{
  margin-top:15px;
  color:#bbb;
}

@media(max-width:700px){

  .sidebar{
    width:180px;
  }

  .message{
    max-width:85%;
  }

}

@media(max-width:430px){

  .sidebar{
    width:155px;
  }

  .side-head-title{
    font-size:16px;
  }

  .call-actions button{
    padding:7px;
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
      placeholder="اسم المستخدم"
      autocomplete="username"
    >

    <input
      id="password"
      type="password"
      placeholder="كلمة المرور"
      autocomplete="current-password"
    >

    <button id="authButton">
      إنشاء الحساب
    </button>

    <button id="switchAuth">
      عندك حساب؟ تسجيل الدخول
    </button>

    <div id="error"></div>

  </div>

</div>

<div id="app">

  <div class="layout">

    <aside class="sidebar">

      <div class="side-head">

        <div class="side-head-title">
          المستخدمون
        </div>

        <div class="head-actions">

          <button id="settingsBtn">
            ⚙️
          </button>

          <button id="logoutBtn">
            خروج
          </button>

        </div>

      </div>

      <div id="users"></div>

    </aside>

    <main class="chat">

      <div class="chat-head">

        <div class="avatar" id="chatAvatar">
          ?
        </div>

        <div class="chat-head-info">

          <div id="chatTitle">
            اختر مستخدمًا
          </div>

          <div id="chatStatus"></div>

        </div>

        <div class="call-actions">

          <button id="voiceCallBtn">
            📞
          </button>

          <button id="videoCallBtn">
            📹
          </button>

        </div>

      </div>

      <div id="messages">
        اختر مستخدمًا لبدء المحادثة
      </div>

      <div id="typing"></div>

      <div id="progressBox">
        <div id="progressText">
          جاري الإرسال...
        </div>
        <progress id="progressBar" value="0" max="100"></progress>
      </div>

      <div class="composer">

        <label for="fileInput">

          <button
            id="fileBtn"
            type="button"
          >
            📎
          </button>

        </label>

        <input
          id="fileInput"
          type="file"
        >

        <button id="recordBtn">
          🎙️
        </button>

        <input
          id="messageInput"
          placeholder="اكتب رسالة..."
        >

        <button id="sendBtn">
          ➤
        </button>

      </div>

    </main>

  </div>

</div>

<div class="modal" id="settingsModal">

  <div class="modal-box">

    <h3>الإعدادات</h3>

    <p>
      الحساب:
      <b id="settingsUsername"></b>
    </p>

    <button
      class="danger"
      id="deleteAccountBtn"
    >
      إغلاق الحساب نهائيًا
    </button>

    <button
      class="cancel"
      id="closeSettingsBtn"
    >
      إلغاء
    </button>

  </div>

</div>

<div id="incomingCall">

  <div class="call-box">

    <div class="call-avatar">
      📞
    </div>

    <h2 id="incomingCaller">
      مكالمة واردة
    </h2>

    <div
      class="call-type"
      id="incomingType"
    ></div>

    <div class="call-buttons">

      <button
        class="accept"
        id="acceptCallBtn"
      >
        ✓
      </button>

      <button
        class="reject"
        id="rejectCallBtn"
      >
        ✕
      </button>

    </div>

  </div>

</div>

<div id="activeCall">

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

  <div id="callInfo">
    المكالمة جارية
  </div>

  <div class="call-buttons">

    <button id="muteBtn">
      🎤
    </button>

    <button id="cameraBtn">
      📷
    </button>

    <button
      class="end"
      id="endCallBtn"
    >
      ☎
    </button>

  </div>

</div>

<script>

/* =========================================================
   GLOBALS
========================================================= */

let token =
  localStorage.getItem("chat_token") || "";

let currentUser = "";
let selectedUser = "";

let ws = null;
let reconnectTimer = null;
let typingTimer = null;

let registerMode = true;

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

/* CALL */

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

/* FILE TRANSFER */

let filePeer = null;
let filePartner = "";
let fileTransferId = "";
let fileSender = false;

let incomingFileMeta = null;
let incomingFileChunks = [];
let incomingFileBytes = 0;

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const FILE_CHUNK_SIZE =
  64 * 1024;

/* =========================================================
   ELEMENTS
========================================================= */

const usernameInput =
  document.getElementById("username");

const passwordInput =
  document.getElementById("password");

const authButton =
  document.getElementById("authButton");

const switchAuth =
  document.getElementById("switchAuth");

const authTitle =
  document.getElementById("authTitle");

const errorBox =
  document.getElementById("error");

const auth =
  document.getElementById("auth");

const app =
  document.getElementById("app");

const usersBox =
  document.getElementById("users");

const chatTitle =
  document.getElementById("chatTitle");

const chatAvatar =
  document.getElementById("chatAvatar");

const chatStatus =
  document.getElementById("chatStatus");

const messages =
  document.getElementById("messages");

const messageInput =
  document.getElementById("messageInput");

const sendBtn =
  document.getElementById("sendBtn");

const typingBox =
  document.getElementById("typing");

const fileInput =
  document.getElementById("fileInput");

const fileBtn =
  document.getElementById("fileBtn");

const recordBtn =
  document.getElementById("recordBtn");

const progressBox =
  document.getElementById("progressBox");

const progressText =
  document.getElementById("progressText");

const progressBar =
  document.getElementById("progressBar");

const settingsModal =
  document.getElementById("settingsModal");

const settingsUsername =
  document.getElementById("settingsUsername");

const incomingCall =
  document.getElementById("incomingCall");

const incomingCaller =
  document.getElementById("incomingCaller");

const incomingType =
  document.getElementById("incomingType");

const activeCall =
  document.getElementById("activeCall");

const remoteVideo =
  document.getElementById("remoteVideo");

const localVideo =
  document.getElementById("localVideo");

/* =========================================================
   HELPERS
========================================================= */

function showError(text){

  errorBox.textContent =
    text || "";

}

function escapeHtml(value){

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}

function api(path,options){

  return fetch(
    path,
    Object.assign(
      {
        cache:"no-store"
      },
      options || {}
    )
  );

}

function formatFileSize(bytes){

  if(bytes < 1024){
    return bytes + " B";
  }

  if(bytes < 1024 * 1024){
    return (
      (bytes / 1024).toFixed(1) +
      " KB"
    );
  }

  return (
    (bytes / 1024 / 1024).toFixed(2) +
    " MB"
  );

}

function randomId(){

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2)
  );

}

/* =========================================================
   AUTH
========================================================= */

switchAuth.onclick =
  function(){

    registerMode =
      !registerMode;

    if(registerMode){

      authTitle.textContent =
        "إنشاء حساب";

      authButton.textContent =
        "إنشاء الحساب";

      switchAuth.textContent =
        "عندك حساب؟ تسجيل الدخول";

    }else{

      authTitle.textContent =
        "تسجيل الدخول";

      authButton.textContent =
        "تسجيل الدخول";

      switchAuth.textContent =
        "ليس لديك حساب؟ إنشاء حساب";

    }

    showError("");

  };

authButton.onclick =
  async function(){

    const username =
      usernameInput.value.trim();

    const password =
      passwordInput.value;

    if(username.length < 2){

      showError(
        "اسم المستخدم قصير جدًا"
      );

      return;

    }

    if(password.length < 4){

      showError(
        "كلمة المرور قصيرة جدًا"
      );

      return;

    }

    authButton.disabled = true;

    showError("");

    try{

      const endpoint =
        registerMode
        ? "/api/register"
        : "/api/login";

      const res =
        await api(
          endpoint,
          {
            method:"POST",
            headers:{
              "Content-Type":
                "application/json"
            },
            body:JSON.stringify({
              username,
              password
            })
          }
        );

      const data =
        await res.json();

      if(!res.ok || !data.ok){

        showError(
          data.error ||
          "حدث خطأ"
        );

        return;

      }

      token =
        data.token;

      currentUser =
        data.username ||
        username;

      localStorage.setItem(
        "chat_token",
        token
      );

      usernameInput.value = "";
      passwordInput.value = "";

      auth.style.display =
        "none";

      app.style.display =
        "block";

      settingsUsername.textContent =
        currentUser;

      await loadUsers();

      connectWS();

    }catch(e){

      showError(
        "تعذر الاتصال بالخادم"
      );

    }finally{

      authButton.disabled = false;

    }

  };

async function restoreSession(){

  if(!token){
    return;
  }

  try{

    const res =
      await api(
        "/api/me?token=" +
        encodeURIComponent(token)
      );

    if(!res.ok){
      throw new Error(
        "invalid"
      );
    }

    const data =
      await res.json();

    if(!data.ok){
      throw new Error(
        "invalid"
      );
    }

    currentUser =
      data.username;

    auth.style.display =
      "none";

    app.style.display =
      "block";

    settingsUsername.textContent =
      currentUser;

    await loadUsers();

    connectWS();

  }catch(e){

    token = "";

    localStorage.removeItem(
      "chat_token"
    );

    auth.style.display =
      "flex";

    app.style.display =
      "none";

  }

}

restoreSession();

/* =========================================================
   USERS
========================================================= */

async function loadUsers(){

  if(!token){
    return;
  }

  try{

    const res =
      await api(
        "/api/users?token=" +
        encodeURIComponent(token)
      );

    if(res.status === 401){

      logoutLocal();

      return;

    }

    const data =
      await res.json();

    renderUsers(
      data.users || []
    );

  }catch(e){}

}

function renderUsers(list){

  usersBox.innerHTML = "";

  let foundCurrent =
    false;

  list.forEach(
    user => {

      if(
        !user ||
        !user.username
      ){
        return;
      }

      if(
        user.username ===
        currentUser
      ){

        foundCurrent =
          true;

      }

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "user";

      if(
        user.username ===
        selectedUser
      ){

        row.classList.add(
          "active"
        );

      }

      const avatar =
        document.createElement(
          "div"
        );

      avatar.className =
        "avatar";

      avatar.textContent =
        user.username
          .charAt(0)
          .toUpperCase();

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "user-info";

      const name =
        document.createElement(
          "div"
        );

      name.className =
        "user-name";

      name.textContent =
        user.username ===
        currentUser
        ? user.username +
          " (أنت)"
        : user.username;

      const status =
        document.createElement(
          "div"
        );

      status.className =
        "status";

      status.textContent =
        user.online
        ? "🟢 متصل الآن"
        : "⚪ غير متصل";

      const dot =
        document.createElement(
          "div"
        );

      dot.className =
        user.online
        ? "dot online-dot"
        : "dot offline-dot";

      info.appendChild(name);
      info.appendChild(status);

      row.appendChild(avatar);
      row.appendChild(info);
      row.appendChild(dot);

      row.onclick =
        function(){

          if(
            user.username ===
            currentUser
          ){

            return;

          }

          selectedUser =
            user.username;

          document
            .querySelectorAll(
              ".user"
            )
            .forEach(
              x =>
                x.classList.remove(
                  "active"
                )
            );

          row.classList.add(
            "active"
          );

          chatTitle.textContent =
            selectedUser;

          chatAvatar.textContent =
            selectedUser
              .charAt(0)
              .toUpperCase();

          chatStatus.textContent =
            user.online
            ? "متصل الآن"
            : "غير متصل";

          loadHistory(
            selectedUser
          );

        };

      usersBox.appendChild(row);

    }
  );

  if(
    !foundCurrent &&
    currentUser
  ){

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "user";

    row.innerHTML =
      '<div class="avatar">' +
      escapeHtml(
        currentUser
          .charAt(0)
          .toUpperCase()
      ) +
      '</div>' +
      '<div class="user-info">' +
      '<div class="user-name">' +
      escapeHtml(
        currentUser
      ) +
      ' (أنت)</div>' +
      '<div class="status">' +
      '🟢 متصل الآن' +
      '</div>' +
      '</div>' +
      '<div class="dot online-dot">' +
      '</div>';

    usersBox.prepend(row);

  }

}

/* =========================================================
   WEBSOCKET
========================================================= */

function connectWS(){

  if(!token){
    return;
  }

  if(
    ws &&
    (
      ws.readyState ===
      WebSocket.OPEN ||
      ws.readyState ===
      WebSocket.CONNECTING
    )
  ){

    return;

  }

  const protocol =
    location.protocol ===
    "https:"
    ? "wss:"
    : "ws:";

  ws =
    new WebSocket(
      protocol +
      "//" +
      location.host +
      "/ws?token=" +
      encodeURIComponent(token)
    );

  ws.onopen =
    function(){

      clearTimeout(
        reconnectTimer
      );

      loadUsers();

    };

  ws.onmessage =
    function(event){

      try{

        const data =
          JSON.parse(
            event.data
          );

        handleSocketMessage(
          data
        );

      }catch(e){}

    };

  ws.onclose =
    function(){

      if(token){

        clearTimeout(
          reconnectTimer
        );

        reconnectTimer =
          setTimeout(
            function(){
              connectWS();
            },
            1500
          );

      }

    };

  ws.onerror =
    function(){

      try{
        ws.close();
      }catch(e){}

    };

}

async function ensureWebSocket(
  timeout
){

  timeout =
    timeout || 7000;

  if(
    ws &&
    ws.readyState ===
    WebSocket.OPEN
  ){

    return true;

  }

  connectWS();

  const start =
    Date.now();

  while(
    Date.now() -
    start <
    timeout
  ){

    if(
      ws &&
      ws.readyState ===
      WebSocket.OPEN
    ){

      return true;

    }

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          150
        )
    );

  }

  return false;

}

function sendWS(data){

  if(
    ws &&
    ws.readyState ===
    WebSocket.OPEN
  ){

    ws.send(
      JSON.stringify(data)
    );

    return true;

  }

  return false;

}

/* =========================================================
   SOCKET
========================================================= */

function handleSocketMessage(
  data
){

  if(data.type === "message"){

    if(
      data.from ===
      selectedUser ||
      data.to ===
      selectedUser
    ){

      addMessage(data);

    }

    loadUsers();

  }

  else if(
    data.type === "history"
  ){

    renderHistory(
      data.messages || []
    );

  }

  else if(
    data.type === "typing"
  ){

    if(
      data.from ===
      selectedUser
    ){

      typingBox.textContent =
        data.value
        ? "يكتب الآن..."
        : "";

    }

  }

  else if(
    data.type ===
    "users_changed"
  ){

    loadUsers();

  }

  /* CALL */

  else if(
    data.type ===
    "call_offer"
  ){

    handleIncomingOffer(
      data
    );

  }

  else if(
    data.type ===
    "call_answer"
  ){

    handleCallAnswer(
      data
    );

  }

  else if(
    data.type ===
    "call_candidate"
  ){

    handleCandidate(
      data
    );

  }

  else if(
    data.type ===
    "call_reject"
  ){

    alert(
      "تم رفض المكالمة"
    );

    endCall(false);

  }

  else if(
    data.type ===
    "call_end"
  ){

    endCall(false);

  }

  else if(
    data.type ===
    "call_error"
  ){

    alert(
      data.error ||
      "تعذر بدء المكالمة"
    );

    endCall(false);

  }

  /* FILE */

  else if(
    data.type ===
    "file_offer"
  ){

    handleIncomingFileOffer(
      data
    );

  }

  else if(
    data.type ===
    "file_answer"
  ){

    handleFileAnswer(
      data
    );

  }

  else if(
    data.type ===
    "file_candidate"
  ){

    handleFileCandidate(
      data
    );

  }

  else if(
    data.type ===
    "file_error"
  ){

    finishProgress();

    alert(
      data.error ||
      "تعذر إرسال الملف"
    );

  }

}

/* =========================================================
   TEXT CHAT
========================================================= */

sendBtn.onclick =
  sendMessage;

messageInput.addEventListener(
  "keydown",
  function(e){

    if(e.key === "Enter"){

      e.preventDefault();

      sendMessage();

    }

  }
);

messageInput.addEventListener(
  "input",
  function(){

    if(!selectedUser){
      return;
    }

    sendWS({
      type:"typing",
      to:selectedUser,
      value:true
    });

    clearTimeout(
      typingTimer
    );

    typingTimer =
      setTimeout(
        function(){

          sendWS({
            type:"typing",
            to:selectedUser,
            value:false
          });

        },
        700
      );

  }
);

function sendMessage(){

  const text =
    messageInput.value.trim();

  if(
    !text ||
    !selectedUser
  ){

    return;

  }

  if(
    !sendWS({
      type:"message",
      to:selectedUser,
      text:text
    })
  ){

    alert(
      "الاتصال بالخادم غير جاهز"
    );

    connectWS();

    return;

  }

  messageInput.value = "";

}

async function loadHistory(
  username
){

  messages.innerHTML =
    "جاري تحميل الرسائل...";

  const ready =
    await ensureWebSocket();

  if(!ready){

    messages.innerHTML =
      "تعذر الاتصال بالخادم";

    return;

  }

  sendWS({
    type:"history",
    with:username
  });

}

function renderHistory(list){

  messages.innerHTML = "";

  if(!list.length){

    messages.textContent =
      "لا توجد رسائل بعد";

    return;

  }

  list.forEach(
    addMessage
  );

  messages.scrollTop =
    messages.scrollHeight;

}

function addMessage(msg){

  const box =
    document.createElement(
      "div"
    );

  box.className =
    "message " +
    (
      msg.sender ===
      currentUser
      ? "me"
      : "other"
    );

  if(
    msg.kind ===
    "file"
  ){

    const fileBox =
      document.createElement(
        "div"
      );

    fileBox.className =
      "file-message";

    const name =
      document.createElement(
        "div"
      );

    name.textContent =
      "📎 " +
      (
        msg.fileName ||
        "ملف"
      );

    const note =
      document.createElement(
        "div"
      );

    note.className =
      "file-size";

    note.textContent =
      "الملف تم إرساله مباشرة";

    fileBox.appendChild(name);
    fileBox.appendChild(note);

    box.appendChild(
      fileBox
    );

  }

  else if(
    msg.kind ===
    "audio"
  ){

    const audioBox =
      document.createElement(
        "div"
      );

    audioBox.className =
      "audio-message";

    const note =
      document.createElement(
        "div"
      );

    note.textContent =
      "🎙️ رسالة صوتية";

    audioBox.appendChild(
      note
    );

    box.appendChild(
      audioBox
    );

  }

  else{

    const text =
      document.createElement(
        "div"
      );

    text.textContent =
      msg.text || "";

    box.appendChild(
      text
    );

  }

  const time =
    document.createElement(
      "div"
    );

  time.className =
    "message-time";

  time.textContent =
    msg.createdAt
    ? new Date(
        msg.createdAt
      ).toLocaleTimeString(
        "ar-EG",
        {
          hour:"2-digit",
          minute:"2-digit"
        }
      )
    : "";

  box.appendChild(
    time
  );

  messages.appendChild(
    box
  );

  messages.scrollTop =
    messages.scrollHeight;

}

/* =========================================================
   FILE TRANSFER UI
========================================================= */

function showProgress(text){

  progressBox.style.display =
    "block";

  progressText.textContent =
    text;

  progressBar.value =
    0;

}

function updateProgress(
  sent,
  total
){

  const percent =
    Math.floor(
      (
        sent /
        total
      ) * 100
    );

  progressBar.value =
    percent;

  progressText.textContent =
    "جاري الإرسال: " +
    percent +
    "%";

}

function finishProgress(){

  progressBar.value =
    100;

  progressBox.style.display =
    "none";

}

/* =========================================================
   FILE SEND
========================================================= */

fileBtn.onclick =
  function(){

    fileInput.click();

  };

fileInput.onchange =
  async function(){

    const file =
      fileInput.files[0];

    if(!file){
      return;
    }

    if(!selectedUser){

      alert(
        "اختر مستخدمًا أولًا"
      );

      fileInput.value =
        "";

      return;

    }

    if(
      file.size >
      MAX_FILE_SIZE
    ){

      alert(
        "الحد الأقصى للملف هو 20 ميجابايت"
      );

      fileInput.value =
        "";

      return;

    }

    const ready =
      await ensureWebSocket(
        8000
      );

    if(!ready){

      alert(
        "الاتصال بالخادم غير متاح"
      );

      fileInput.value =
        "";

      return;

    }

    await sendFileDirect(
      file,
      selectedUser,
      "file"
    );

    fileInput.value =
      "";

  };

/* =========================================================
   SEND FILE USING WEBRTC
========================================================= */

async function sendFileDirect(
  file,
  target,
  kind
){

  if(
    file.size >
    MAX_FILE_SIZE
  ){

    alert(
      "الحد الأقصى للملف هو 20 ميجابايت"
    );

    return;

  }

  if(
    !target ||
    target === currentUser
  ){

    alert(
      "المستخدم غير صحيح"
    );

    return;

  }

  closeFilePeer();

  fileSender =
    true;

  filePartner =
    target;

  fileTransferId =
    randomId();

  showProgress(
    "جاري تجهيز الملف..."
  );

  try{

    filePeer =
      createFilePeer(
        true
      );

    filePeer.onicecandidate =
      function(event){

        if(
          event.candidate
        ){

          sendWS({
            type:
              "file_candidate",
            to:
              target,
            transferId:
              fileTransferId,
            candidate:
              event.candidate
          });

        }

      };

    const channel =
      filePeer.createDataChannel(
        "file",
        {
          ordered:true
        }
      );

    channel.binaryType =
      "arraybuffer";

    channel.onopen =
      async function(){

        try{

          await sendFileOverChannel(
            channel,
            file,
            kind
          );

        }catch(e){

          alert(
            "تعذر إرسال الملف"
          );

        }

      };

    channel.onerror =
      function(){

        finishProgress();

        alert(
          "انقطع اتصال نقل الملف"
        );

        closeFilePeer();

      };

    const offer =
      await filePeer.createOffer();

    await filePeer.setLocalDescription(
      offer
    );

    sendWS({
      type:"file_offer",
      to:target,
      transferId:
        fileTransferId,
      fileName:
        file.name ||
        "file",
      fileSize:
        file.size,
      fileType:
        file.type ||
        "application/octet-stream",
      kind:
        kind ||
        "file",
      offer:offer
    });

    progressText.textContent =
      "في انتظار اتصال المستخدم...";

  }catch(e){

    finishProgress();

    closeFilePeer();

    alert(
      "تعذر تجهيز إرسال الملف: " +
      e.message
    );

  }

}

async function sendFileOverChannel(
  channel,
  file,
  kind
){

  const meta = {
    type:"file_meta",
    name:
      file.name ||
      "file",
    size:
      file.size,
    mime:
      file.type ||
      "application/octet-stream",
    kind:
      kind ||
      "file"
  };

  channel.send(
    JSON.stringify(meta)
  );

  let offset = 0;

  while(
    offset <
    file.size
  ){

    while(
      channel.bufferedAmount >
      1024 * 1024
    ){

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            20
          )
      );

    }

    const end =
      Math.min(
        offset +
        FILE_CHUNK_SIZE,
        file.size
      );

    const chunk =
      await file.slice(
        offset,
        end
      ).arrayBuffer();

    channel.send(
      chunk
    );

    offset =
      end;

    updateProgress(
      offset,
      file.size
    );

  }

  channel.send(
    JSON.stringify({
      type:"file_end"
    })
  );

  addLocalFileMessage(
    file,
    kind
  );

  setTimeout(
    function(){

      finishProgress();

      closeFilePeer();

    },
    700
  );

}

/* =========================================================
   RECEIVE FILE OFFER
========================================================= */

async function handleIncomingFileOffer(
  data
){

  if(
    !data ||
    !data.from ||
    !data.offer
  ){

    return;

  }

  if(
    Number(data.fileSize || 0) >
    MAX_FILE_SIZE
  ){

    sendWS({
      type:"file_error",
      to:data.from,
      transferId:
        data.transferId,
      error:
        "الملف أكبر من 20 ميجابايت"
    });

    return;

  }

  const accept =
    confirm(
      "هل تريد استقبال الملف؟\\n\\n" +
      (
        data.fileName ||
        "ملف"
      ) +
      "\\nالحجم: " +
      formatFileSize(
        Number(
          data.fileSize || 0
        )
      )
    );

  if(!accept){

    sendWS({
      type:"file_error",
      to:data.from,
      transferId:
        data.transferId,
      error:
        "تم رفض استقبال الملف"
    });

    return;

  }

  closeFilePeer();

  fileSender =
    false;

  filePartner =
    data.from;

  fileTransferId =
    data.transferId;

  incomingFileMeta = {
    name:
      data.fileName ||
      "file",
    size:
      Number(
        data.fileSize || 0
      ),
    mime:
      data.fileType ||
      "application/octet-stream",
    kind:
      data.kind ||
      "file"
  };

  incomingFileChunks =
    [];

  incomingFileBytes =
    0;

  showProgress(
    "جاري استقبال الملف..."
  );

  try{

    filePeer =
      createFilePeer(
        false
      );

    filePeer.onicecandidate =
      function(event){

        if(
          event.candidate
        ){

          sendWS({
            type:
              "file_candidate",
            to:
              data.from,
            transferId:
              data.transferId,
            candidate:
              event.candidate
          });

        }

      };

    filePeer.ondatachannel =
      function(event){

        const channel =
          event.channel;

        channel.binaryType =
          "arraybuffer";

        channel.onmessage =
          function(ev){

            receiveFileData(
              ev.data
            );

          };

        channel.onclose =
          function(){

            if(
              incomingFileMeta &&
              incomingFileBytes >=
              incomingFileMeta.size
            ){

              finishIncomingFile();

            }

          };

      };

    await filePeer.setRemoteDescription(
      new RTCSessionDescription(
        data.offer
      )
    );

    const answer =
      await filePeer.createAnswer();

    await filePeer.setLocalDescription(
      answer
    );

    sendWS({
      type:"file_answer",
      to:data.from,
      transferId:
        data.transferId,
      answer:answer
    });

  }catch(e){

    finishProgress();

    closeFilePeer();

    alert(
      "تعذر استقبال الملف"
    );

  }

}

/* =========================================================
   FILE ANSWER
========================================================= */

async function handleFileAnswer(
  data
){

  if(
    !filePeer ||
    data.transferId !==
    fileTransferId
  ){

    return;

  }

  try{

    await filePeer.setRemoteDescription(
      new RTCSessionDescription(
        data.answer
      )
    );

  }catch(e){}

}

/* =========================================================
   FILE ICE
========================================================= */

async function handleFileCandidate(
  data
){

  if(
    data.transferId !==
    fileTransferId
  ){

    return;

  }

  if(
    !filePeer ||
    !data.candidate
  ){

    return;

  }

  try{

    await filePeer.addIceCandidate(
      new RTCIceCandidate(
        data.candidate
      )
    );

  }catch(e){}

}

/* =========================================================
   RECEIVE DATA
========================================================= */

function receiveFileData(
  data
){

  if(
    typeof data ===
    "string"
  ){

    try{

      const msg =
        JSON.parse(data);

      if(
        msg.type ===
        "file_meta"
      ){

        incomingFileMeta = {
          name:
            msg.name ||
            "file",
          size:
            Number(
              msg.size || 0
            ),
          mime:
            msg.mime ||
            "application/octet-stream",
          kind:
            msg.kind ||
            "file"
        };

        incomingFileChunks =
          [];

        incomingFileBytes =
          0;

        showProgress(
          "جاري استقبال الملف..."
        );

      }

      else if(
        msg.type ===
        "file_end"
      ){

        finishIncomingFile();

      }

    }catch(e){}

    return;

  }

  let buffer = null;

  if(
    data instanceof ArrayBuffer
  ){

    buffer =
      data;

  }else if(
    data instanceof Blob
  ){

    data.arrayBuffer()
      .then(
        receiveFileData
      );

    return;

  }

  if(!buffer){
    return;
  }

  incomingFileChunks.push(
    buffer
  );

  incomingFileBytes +=
    buffer.byteLength;

  if(
    incomingFileMeta &&
    incomingFileMeta.size
  ){

    updateProgress(
      incomingFileBytes,
      incomingFileMeta.size
    );

  }

}

function finishIncomingFile(){

  if(
    !incomingFileMeta ||
    !incomingFileChunks.length
  ){

    finishProgress();

    return;

  }

  const blob =
    new Blob(
      incomingFileChunks,
      {
        type:
          incomingFileMeta.mime
      }
    );

  if(
    blob.size >
    MAX_FILE_SIZE
  ){

    finishProgress();

    alert(
      "الملف المستلم أكبر من 20 ميجابايت"
    );

    closeFilePeer();

    return;

  }

  const url =
    URL.createObjectURL(
      blob
    );

  addReceivedFileMessage(
    incomingFileMeta,
    url
  );

  finishProgress();

  incomingFileMeta =
    null;

  incomingFileChunks =
    [];

  incomingFileBytes =
    0;

  setTimeout(
    function(){
      closeFilePeer();
    },
    1000
  );

}

function addLocalFileMessage(
  file,
  kind
){

  const msg = {
    sender:
      currentUser,
    receiver:
      filePartner,
    kind:
      kind ||
      "file",
    fileName:
      file.name,
    fileSize:
      file.size,
    createdAt:
      Date.now()
  };

  addMessage(
    msg
  );

}

function addReceivedFileMessage(
  meta,
  url
){

  const box =
    document.createElement(
      "div"
    );

  box.className =
    "message other";

  const fileBox =
    document.createElement(
      "div"
    );

  fileBox.className =
    "file-message";

  if(
    meta.kind ===
    "audio"
  ){

    const audio =
      document.createElement(
        "audio"
      );

    audio.controls =
      true;

    audio.src =
      url;

    fileBox.appendChild(
      audio
    );

  }else{

    const name =
      document.createElement(
        "div"
      );

    name.textContent =
      "📎 " +
      meta.name;

    const size =
      document.createElement(
        "div"
      );

    size.className =
      "file-size";

    size.textContent =
      formatFileSize(
        meta.size
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      meta.name ||
      "file";

    link.textContent =
      "⬇️ فتح / تحميل الملف";

    fileBox.appendChild(
      name
    );

    fileBox.appendChild(
      size
    );

    fileBox.appendChild(
      link
    );

  }

  box.appendChild(
    fileBox
  );

  const time =
    document.createElement(
      "div"
    );

  time.className =
    "message-time";

  time.textContent =
    new Date()
      .toLocaleTimeString(
        "ar-EG",
        {
          hour:"2-digit",
          minute:"2-digit"
        }
      );

  box.appendChild(
    time
  );

  messages.appendChild(
    box
  );

  messages.scrollTop =
    messages.scrollHeight;

}

/* =========================================================
   FILE PEER
========================================================= */

function createFilePeer(
  sender
){

  const pc =
    new RTCPeerConnection({
      iceServers:[
        {
          urls:
            "stun:stun.l.google.com:19302"
        },
        {
          urls:
            "stun:stun1.l.google.com:19302"
        }
      ]
    });

  if(!sender){

    pc.ondatachannel =
      function(){

      };

  }

  return pc;

}

function closeFilePeer(){

  if(filePeer){

    try{
      filePeer.close();
    }catch(e){}

  }

  filePeer =
    null;

  filePartner =
    "";

  fileTransferId =
    "";

  fileSender =
    false;

}

/* =========================================================
   VOICE MESSAGE
========================================================= */

recordBtn.onclick =
  async function(){

    if(isRecording){

      stopRecording();

      return;

    }

    if(!selectedUser){

      alert(
        "اختر مستخدمًا أولًا"
      );

      return;

    }

    try{

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio:true
          });

      audioChunks =
        [];

      mediaRecorder =
        new MediaRecorder(
          stream
        );

      mediaRecorder.ondataavailable =
        function(e){

          if(
            e.data.size > 0
          ){

            audioChunks.push(
              e.data
            );

          }

        };

      mediaRecorder.onstop =
        async function(){

          const blob =
            new Blob(
              audioChunks,
              {
                type:
                  "audio/webm"
              }
            );

          stream
            .getTracks()
            .forEach(
              track =>
                track.stop()
            );

          await sendAudioDirect(
            blob
          );

        };

      mediaRecorder.start();

      isRecording =
        true;

      recordBtn.textContent =
        "⏹️";

    }catch(e){

      alert(
        "تعذر استخدام الميكروفون"
      );

    }

  };

function stopRecording(){

  if(mediaRecorder){

    mediaRecorder.stop();

  }

  isRecording =
    false;

  recordBtn.textContent =
    "🎙️";

}

async function sendAudioDirect(
  blob
){

  if(
    blob.size >
    MAX_FILE_SIZE
  ){

    alert(
      "الرسالة الصوتية أكبر من 20 ميجابايت"
    );

    return;

  }

  const file =
    new File(
      [blob],
      "voice.webm",
      {
        type:
          "audio/webm"
      }
    );

  await sendFileDirect(
    file,
    selectedUser,
    "audio"
  );

}

/* =========================================================
   CALLS
========================================================= */

document.getElementById(
  "voiceCallBtn"
).onclick =
  function(){

    startCall(
      "audio"
    );

  };

document.getElementById(
  "videoCallBtn"
).onclick =
  function(){

    startCall(
      "video"
    );

  };

async function startCall(
  type
){

  if(!selectedUser){

    alert(
      "اختر مستخدمًا أولًا"
    );

    return;

  }

  const ready =
    await ensureWebSocket(
      8000
    );

  if(!ready){

    alert(
      "الاتصال بالخادم غير متاح"
    );

    return;

  }

  callPartner =
    selectedUser;

  callType =
    type;

  callId =
    randomId();

  try{

    await preparePeer(
      type
    );

    const offer =
      await peerConnection
        .createOffer();

    await peerConnection
      .setLocalDescription(
        offer
      );

    sendWS({
      type:"call_offer",
      to:callPartner,
      callId:callId,
      callType:type,
      offer:offer
    });

    showActiveCall();

  }catch(e){

    alert(
      "تعذر تشغيل المكالمة: " +
      e.message
    );

    endCall(false);

  }

}

async function preparePeer(
  type
){

  peerConnection =
    new RTCPeerConnection({
      iceServers:[
        {
          urls:
            "stun:stun.l.google.com:19302"
        },
        {
          urls:
            "stun:stun1.l.google.com:19302"
        }
      ]
    });

  remoteStream =
    new MediaStream();

  remoteVideo.srcObject =
    remoteStream;

  peerConnection.ontrack =
    function(event){

      event.streams[0]
        .getTracks()
        .forEach(
          function(track){

            remoteStream.addTrack(
              track
            );

          }
        );

    };

  peerConnection.onicecandidate =
    function(event){

      if(
        event.candidate &&
        callPartner
      ){

        sendWS({
          type:
            "call_candidate",
          to:
            callPartner,
          callId:
            callId,
          candidate:
            event.candidate
        });

      }

    };

  localStream =
    await navigator
      .mediaDevices
      .getUserMedia({
        audio:true,
        video:
          type === "video"
      });

  localStream
    .getTracks()
    .forEach(
      function(track){

        peerConnection.addTrack(
          track,
          localStream
        );

      }
    );

  localVideo.srcObject =
    type === "video"
    ? localStream
    : null;

  microphoneEnabled =
    true;

  cameraEnabled =
    true;

}

function showActiveCall(){

  activeCall.style.display =
    "flex";

  document.getElementById(
    "callInfo"
  ).textContent =
    callType === "video"
    ? "مكالمة فيديو مع " +
      callPartner
    : "مكالمة صوتية مع " +
      callPartner;

}

async function handleIncomingOffer(
  data
){

  pendingOffer =
    data.offer;

  pendingCaller =
    data.from;

  pendingCallId =
    data.callId;

  pendingCallType =
    data.callType;

  incomingCaller.textContent =
    data.from;

  incomingType.textContent =
    data.callType === "video"
    ? "مكالمة فيديو"
    : "مكالمة صوتية";

  incomingCall.style.display =
    "flex";

}

document.getElementById(
  "acceptCallBtn"
).onclick =
  async function(){

    incomingCall.style.display =
      "none";

    callPartner =
      pendingCaller;

    callId =
      pendingCallId;

    callType =
      pendingCallType;

    try{

      await preparePeer(
        callType
      );

      await peerConnection
        .setRemoteDescription(
          new RTCSessionDescription(
            pendingOffer
          )
        );

      for(
        const candidate of
        pendingCandidates
      ){

        try{

          await peerConnection
            .addIceCandidate(
              candidate
            );

        }catch(e){}

      }

      pendingCandidates =
        [];

      const answer =
        await peerConnection
          .createAnswer();

      await peerConnection
        .setLocalDescription(
          answer
        );

      sendWS({
        type:
          "call_answer",
        to:
          callPartner,
        callId:
          callId,
        answer:
          answer
      });

      showActiveCall();

    }catch(e){

      alert(
        "تعذر قبول المكالمة"
      );

      endCall(false);

    }

  };

document.getElementById(
  "rejectCallBtn"
).onclick =
  function(){

    if(pendingCaller){

      sendWS({
        type:
          "call_reject",
        to:
          pendingCaller,
        callId:
          pendingCallId
      });

    }

    incomingCall.style.display =
      "none";

    pendingOffer =
      null;

    pendingCaller =
      "";

    pendingCallId =
      "";

    pendingCallType =
      "";

    pendingCandidates =
      [];

  };

async function handleCallAnswer(
  data
){

  if(!peerConnection){
    return;
  }

  if(
    data.callId !==
    callId
  ){

    return;

  }

  try{

    await peerConnection
      .setRemoteDescription(
        new RTCSessionDescription(
          data.answer
        )
      );

  }catch(e){}

}

async function handleCandidate(
  data
){

  if(
    data.callId !== callId &&
    data.callId !== pendingCallId
  ){

    return;

  }

  const candidate =
    new RTCIceCandidate(
      data.candidate
    );

  if(
    peerConnection &&
    peerConnection.remoteDescription
  ){

    try{

      await peerConnection
        .addIceCandidate(
          candidate
        );

    }catch(e){}

  }else{

    pendingCandidates.push(
      candidate
    );

  }

}

document.getElementById(
  "endCallBtn"
).onclick =
  function(){

    if(callPartner){

      sendWS({
        type:
          "call_end",
        to:
          callPartner,
        callId:
          callId
      });

    }

    endCall(false);

  };

document.getElementById(
  "muteBtn"
).onclick =
  function(){

    if(!localStream){
      return;
    }

    microphoneEnabled =
      !microphoneEnabled;

    localStream
      .getAudioTracks()
      .forEach(
        function(track){

          track.enabled =
            microphoneEnabled;

        }
      );

    document.getElementById(
      "muteBtn"
    ).textContent =
      microphoneEnabled
      ? "🎤"
      : "🔇";

  };

document.getElementById(
  "cameraBtn"
).onclick =
  function(){

    if(!localStream){
      return;
    }

    cameraEnabled =
      !cameraEnabled;

    localStream
      .getVideoTracks()
      .forEach(
        function(track){

          track.enabled =
            cameraEnabled;

        }
      );

    document.getElementById(
      "cameraBtn"
    ).textContent =
      cameraEnabled
      ? "📷"
      : "🚫";

  };

function endCall(
  sendSignal
){

  if(
    sendSignal &&
    callPartner
  ){

    sendWS({
      type:
        "call_end",
      to:
        callPartner,
      callId:
        callId
    });

  }

  if(peerConnection){

    try{
      peerConnection.close();
    }catch(e){}

  }

  if(localStream){

    localStream
      .getTracks()
      .forEach(
        track =>
          track.stop()
      );

  }

  peerConnection =
    null;

  localStream =
    null;

  remoteStream =
    null;

  callPartner =
    "";

  callId =
    "";

  callType =
    "";

  pendingOffer =
    null;

  pendingCaller =
    "";

  pendingCallId =
    "";

  pendingCallType =
    "";

  pendingCandidates =
    [];

  remoteVideo.srcObject =
    null;

  localVideo.srcObject =
    null;

  incomingCall.style.display =
    "none";

  activeCall.style.display =
    "none";

}

/* =========================================================
   SETTINGS
========================================================= */

document.getElementById(
  "settingsBtn"
).onclick =
  function(){

    settingsUsername.textContent =
      currentUser;

    settingsModal.style.display =
      "flex";

  };

document.getElementById(
  "closeSettingsBtn"
).onclick =
  function(){

    settingsModal.style.display =
      "none";

  };

document.getElementById(
  "deleteAccountBtn"
).onclick =
  async function(){

    const yes =
      confirm(
        "هل أنت متأكد؟ سيتم حذف الحساب والرسائل نهائيًا."
      );

    if(!yes){
      return;
    }

    try{

      const res =
        await api(
          "/api/delete-account",
          {
            method:"POST",
            headers:{
              "Content-Type":
                "application/json"
            },
            body:JSON.stringify({
              token:token
            })
          }
        );

      const data =
        await res.json();

      if(
        !res.ok ||
        !data.ok
      ){

        alert(
          data.error ||
          "تعذر حذف الحساب"
        );

        return;

      }

      logoutLocal();

    }catch(e){

      alert(
        "تعذر الاتصال بالخادم"
      );

    }

  };

/* =========================================================
   LOGOUT
========================================================= */

document.getElementById(
  "logoutBtn"
).onclick =
  async function(){

    try{

      await api(
        "/api/logout",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            token:token
          })
        }
      );

    }catch(e){}

    logoutLocal();

  };

function logoutLocal(){

  endCall(false);

  closeFilePeer();

  if(ws){

    try{
      ws.close();
    }catch(e){}

  }

  ws = null;

  token = "";

  currentUser = "";

  selectedUser = "";

  localStorage.removeItem(
    "chat_token"
  );

  app.style.display =
    "none";

  auth.style.display =
    "flex";

  messages.textContent =
    "اختر مستخدمًا لبدء المحادثة";

  usersBox.innerHTML =
    "";

  chatTitle.textContent =
    "اختر مستخدمًا";

  chatAvatar.textContent =
    "?";

  settingsModal.style.display =
    "none";

}

</script>
</body>
</html>`;

/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(
    request,
    env
  ){

    const url =
      new URL(request.url);

    if(
      url.pathname === "/ws" &&
      request.headers.get(
        "Upgrade"
      ) === "websocket"
    ){

      const id =
        env.CHAT_ROOM.idFromName(
          "main"
        );

      const room =
        env.CHAT_ROOM.get(id);

      return room.fetch(
        request
      );

    }

    if(
      url.pathname ===
      "/api/register"
    ){

      return forward(
        env,
        request,
        "register"
      );

    }

    if(
      url.pathname ===
      "/api/login"
    ){

      return forward(
        env,
        request,
        "login"
      );

    }

    if(
      url.pathname ===
      "/api/logout"
    ){

      return forward(
        env,
        request,
        "logout"
      );

    }

    if(
      url.pathname ===
      "/api/me"
    ){

      return forward(
        env,
        request,
        "me"
      );

    }

    if(
      url.pathname ===
      "/api/users"
    ){

      return forward(
        env,
        request,
        "users"
      );

    }

    if(
      url.pathname ===
      "/api/delete-account"
    ){

      return forward(
        env,
        request,
        "delete-account"
      );

    }

    /*
      لا يوجد /api/upload
      ولا /api/file
      لأن الملفات تنتقل مباشرة
      بين المتصفحات.
    */

    return new Response(
      HTML,
      {
        headers:{
          "Content-Type":
            "text/html;charset=UTF-8"
        }
      }
    );

  }

};

async function forward(
  env,
  request,
  action
){

  const id =
    env.CHAT_ROOM.idFromName(
      "main"
    );

  const room =
    env.CHAT_ROOM.get(id);

  const headers =
    new Headers(
      request.headers
    );

  headers.set(
    "X-Chat-Action",
    action
  );

  const req =
    new Request(
      request,
      {
        headers
      }
    );

  return room.fetch(
    req
  );

}

/* =========================================================
   DURABLE OBJECT
========================================================= */

export class ChatRoom
  extends DurableObject {

  constructor(
    ctx,
    env
  ){

    super(
      ctx,
      env
    );

    this.env =
      env;

    this.sql =
      ctx.storage.sql;

    this.connections =
      new Map();

    this.setupDatabase();

  }

  setupDatabase(){

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS accounts(
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sessions(
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT 0,
        expires_at INTEGER NOT NULL DEFAULT 9999999999999
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT,
        kind TEXT NOT NULL DEFAULT 'text',
        file_id TEXT,
        file_name TEXT,
        created_at INTEGER NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS app_meta(
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    this.migrateAccounts();
    this.migrateSessions();
    this.migrateMessages();

  }

  migrateAccounts(){

    const cols =
      this.sql.exec(
        "PRAGMA table_info(accounts)"
      ).toArray();

    const names =
      cols.map(
        x => x.name
      );

    if(
      !names.includes(
        "salt"
      )
    ){

      this.sql.exec(
        `
        ALTER TABLE accounts
        ADD COLUMN salt TEXT NOT NULL DEFAULT ''
        `
      );

    }

  }

  migrateSessions(){

    const cols =
      this.sql.exec(
        "PRAGMA table_info(sessions)"
      ).toArray();

    const names =
      cols.map(
        x => x.name
      );

    if(
      !names.includes(
        "created_at"
      )
    ){

      this.sql.exec(
        `
        ALTER TABLE sessions
        ADD COLUMN created_at
        INTEGER NOT NULL DEFAULT 0
        `
      );

    }

    if(
      !names.includes(
        "expires_at"
      )
    ){

      this.sql.exec(
        `
        ALTER TABLE sessions
        ADD COLUMN expires_at
        INTEGER NOT NULL
        DEFAULT 9999999999999
        `
      );

    }

  }

  migrateMessages(){

    const cols =
      this.sql.exec(
        "PRAGMA table_info(messages)"
      ).toArray();

    const names =
      cols.map(
        x => x.name
      );

    if(
      !names.includes(
        "kind"
      )
    ){

      this.sql.exec(
        `
        ALTER TABLE messages
        ADD COLUMN kind TEXT
        NOT NULL DEFAULT 'text'
        `
      );

    }

    if(
      !names.includes(
        "file_id"
      )
    ){

      this.sql.exec(
        `
        ALTER TABLE messages
        ADD COLUMN file_id TEXT
        `
      );

    }

    if(
      !names.includes(
        "file_name"
      )
    ){

      this.sql.exec(
        `
        ALTER TABLE messages
        ADD COLUMN file_name TEXT
        `
      );

    }

  }

  async fetch(
    request
  ){

    const action =
      request.headers.get(
        "X-Chat-Action"
      );

    if(
      request.headers.get(
        "Upgrade"
      ) === "websocket"
    ){

      return this.websocket(
        request
      );

    }

    if(
      action === "register"
    ){

      return this.register(
        request
      );

    }

    if(
      action === "login"
    ){

      return this.login(
        request
      );

    }

    if(
      action === "logout"
    ){

      return this.logout(
        request
      );

    }

    if(
      action === "me"
    ){

      return this.me(
        request
      );

    }

    if(
      action === "users"
    ){

      return this.users(
        request
      );

    }

    if(
      action ===
      "delete-account"
    ){

      return this.deleteAccount(
        request
      );

    }

    return json(
      {
        ok:false,
        error:"Not found"
      },
      404
    );

  }

  /* =======================================================
     REGISTER
  ======================================================= */

  async register(
    request
  ){

    try{

      const body =
        await request.json();

      const username =
        String(
          body.username ||
          ""
        ).trim();

      const password =
        String(
          body.password ||
          ""
        );

      if(
        username.length < 2
      ){

        return json(
          {
            ok:false,
            error:
              "اسم المستخدم قصير جدًا"
          },
          400
        );

      }

      if(
        password.length < 4
      ){

        return json(
          {
            ok:false,
            error:
              "كلمة المرور قصيرة جدًا"
          },
          400
        );

      }

      const existing =
        this.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username=?
          `,
          username
        ).toArray();

      if(existing.length){

        return json(
          {
            ok:false,
            error:
              "اسم المستخدم موجود بالفعل"
          },
          409
        );

      }

      const salt =
        randomHex(16);

      const hash =
        await hashPassword(
          password,
          salt
        );

      this.sql.exec(
        `
        INSERT INTO accounts
        (username,password_hash,salt)
        VALUES(?,?,?)
        `,
        username,
        hash,
        salt
      );

      const token =
        randomToken();

      const now =
        Date.now();

      this.sql.exec(
        `
        INSERT INTO sessions
        (token,username,created_at,expires_at)
        VALUES(?,?,?,?)
        `,
        token,
        username,
        now,
        SESSION_FOREVER
      );

      return json({
        ok:true,
        username,
        token
      });

    }catch(e){

      return json(
        {
          ok:false,
          error:
            "حدث خطأ أثناء إنشاء الحساب: " +
            e.message
        },
        500
      );

    }

  }

  /* =======================================================
     LOGIN
  ======================================================= */

  async login(
    request
  ){

    try{

      const body =
        await request.json();

      const username =
        String(
          body.username ||
          ""
        ).trim();

      const password =
        String(
          body.password ||
          ""
        );

      const rows =
        this.sql.exec(
          `
          SELECT
            username,
            password_hash,
            salt
          FROM accounts
          WHERE username=?
          `,
          username
        ).toArray();

      if(!rows.length){

        return json(
          {
            ok:false,
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
          account.salt
        );

      if(
        hash !==
        account.password_hash
      ){

        return json(
          {
            ok:false,
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

      this.sql.exec(
        `
        INSERT INTO sessions
        (token,username,created_at,expires_at)
        VALUES(?,?,?,?)
        `,
        token,
        username,
        now,
        SESSION_FOREVER
      );

      return json({
        ok:true,
        username,
        token
      });

    }catch(e){

      return json(
        {
          ok:false,
          error:
            "حدث خطأ أثناء تسجيل الدخول: " +
            e.message
        },
        500
      );

    }

  }

  /* =======================================================
     ME
  ======================================================= */

  async me(
    request
  ){

    const url =
      new URL(
        request.url
      );

    const token =
      url.searchParams.get(
        "token"
      );

    const username =
      this.getUserFromToken(
        token
      );

    if(!username){

      return json(
        {
          ok:false
        },
        401
      );

    }

    return json({
      ok:true,
      username
    });

  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async logout(
    request
  ){

    try{

      const body =
        await request.json();

      const token =
        String(
          body.token ||
          ""
        );

      if(token){

        this.sql.exec(
          `
          DELETE FROM sessions
          WHERE token=?
          `,
          token
        );

      }

      return json({
        ok:true
      });

    }catch(e){

      return json({
        ok:true
      });

    }

  }

  /* =======================================================
     USERS
  ======================================================= */

  async users(
    request
  ){

    const url =
      new URL(
        request.url
      );

    const token =
      url.searchParams.get(
        "token"
      );

    const current =
      this.getUserFromToken(
        token
      );

    if(!current){

      return json(
        {
          ok:false,
          error:
            "جلسة غير صالحة"
        },
        401
      );

    }

    const accounts =
      this.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username
        `
      ).toArray();

    const online =
      this.getOnlineUsernames();

    const result =
      accounts.map(
        row => ({
          username:
            row.username,
          online:
            online.has(
              row.username
            )
        })
      );

    return json({
      ok:true,
      users:result
    });

  }

  getOnlineUsernames(){

    const set =
      new Set();

    for(
      const username of
      this.connections.keys()
    ){

      set.add(
        username
      );

    }

    try{

      for(
        const socket of
        this.ctx.getWebSockets()
      ){

        const data =
          socket.deserializeAttachment();

        if(
          data &&
          data.username
        ){

          set.add(
            data.username
          );

        }

      }

    }catch(e){}

    return set;

  }

  /* =======================================================
     DELETE ACCOUNT
  ======================================================= */

  async deleteAccount(
    request
  ){

    try{

      const body =
        await request.json();

      const token =
        String(
          body.token ||
          ""
        );

      const username =
        this.getUserFromToken(
          token
        );

      if(!username){

        return json(
          {
            ok:false,
            error:
              "جلسة غير صالحة"
          },
          401
        );

      }

      this.sql.exec(
        `
        DELETE FROM messages
        WHERE sender=?
        OR receiver=?
        `,
        username,
        username
      );

      this.sql.exec(
        `
        DELETE FROM sessions
        WHERE username=?
        `,
        username
      );

      this.sql.exec(
        `
        DELETE FROM accounts
        WHERE username=?
        `,
        username
      );

      const sockets =
        this.getSocketsForUser(
          username
        );

      for(
        const socket of
        sockets
      ){

        try{

          socket.send(
            JSON.stringify({
              type:
                "account_deleted"
            })
          );

          socket.close();

        }catch(e){}

      }

      this.connections.delete(
        username
      );

      this.broadcastUsersChanged();

      return json({
        ok:true
      });

    }catch(e){

      return json(
        {
          ok:false,
          error:
            "تعذر حذف الحساب: " +
            e.message
        },
        500
      );

    }

  }

  /* =======================================================
     WEBSOCKET
  ======================================================= */

  async websocket(
    request
  ){

    const url =
      new URL(
        request.url
      );

    const token =
      url.searchParams.get(
        "token"
      );

    const username =
      this.getUserFromToken(
        token
      );

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

    this.ctx.acceptWebSocket(
      server
    );

    server.serializeAttachment({
      username
    });

    if(
      !this.connections.has(
        username
      )
    ){

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

        this.onSocketMessage(
          server,
          event.data
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

        this.broadcastUsersChanged();

      }
    );

    server.addEventListener(
      "error",
      () => {

        this.removeConnection(
          username,
          server
        );

        this.broadcastUsersChanged();

      }
    );

    this.broadcastUsersChanged();

    return new Response(
      null,
      {
        status:101,
        webSocket:client
      }
    );

  }

  removeConnection(
    username,
    socket
  ){

    const set =
      this.connections.get(
        username
      );

    if(!set){
      return;
    }

    set.delete(
      socket
    );

    if(!set.size){

      this.connections.delete(
        username
      );

    }

  }

  getSocketsForUser(
    username
  ){

    const result =
      new Set();

    const set =
      this.connections.get(
        username
      );

    if(set){

      for(
        const socket of set
      ){

        result.add(
          socket
        );

      }

    }

    try{

      for(
        const socket of
        this.ctx.getWebSockets()
      ){

        const data =
          socket.deserializeAttachment();

        if(
          data &&
          data.username ===
          username
        ){

          result.add(
            socket
          );

        }

      }

    }catch(e){}

    return result;

  }

  sendToUser(
    username,
    data
  ){

    const sockets =
      this.getSocketsForUser(
        username
      );

    const payload =
      JSON.stringify(
        data
      );

    let sent =
      false;

    for(
      const socket of
      sockets
    ){

      try{

        if(
          socket.readyState ===
          WebSocket.OPEN
        ){

          socket.send(
            payload
          );

          sent =
            true;

        }

      }catch(e){}

    }

    return sent;

  }

  broadcastUsersChanged(){

    const payload =
      JSON.stringify({
        type:
          "users_changed"
      });

    try{

      for(
        const socket of
        this.ctx.getWebSockets()
      ){

        try{

          if(
            socket.readyState ===
            WebSocket.OPEN
          ){

            socket.send(
              payload
            );

          }

        }catch(e){}

      }

    }catch(e){}

  }

  /* =======================================================
     SOCKET HANDLER
  ======================================================= */

  onSocketMessage(
    socket,
    raw
  ){

    try{

      const data =
        JSON.parse(
          raw
        );

      const attachment =
        socket.deserializeAttachment();

      const username =
        attachment &&
        attachment.username;

      if(!username){
        return;
      }

      if(
        data.type ===
        "message"
      ){

        this.handleMessage(
          username,
          data
        );

      }

      else if(
        data.type ===
        "history"
      ){

        this.handleHistory(
          username,
          data
        );

      }

      else if(
        data.type ===
        "typing"
      ){

        this.sendToUser(
          data.to,
          {
            type:
              "typing",
            from:
              username,
            value:
              !!data.value
          }
        );

      }

      else if(
        data.type ===
          "call_offer" ||
        data.type ===
          "call_answer" ||
        data.type ===
          "call_candidate" ||
        data.type ===
          "call_reject" ||
        data.type ===
          "call_end" ||

        data.type ===
          "file_offer" ||
        data.type ===
          "file_answer" ||
        data.type ===
          "file_candidate" ||
        data.type ===
          "file_error"
      ){

        this.handleCallSignal(
          username,
          data
        );

      }

    }catch(e){}

  }

  /* =======================================================
     MESSAGE
  ======================================================= */

  handleMessage(
    sender,
    data
  ){

    const receiver =
      String(
        data.to ||
        ""
      ).trim();

    const text =
      String(
        data.text ||
        ""
      );

    if(
      !receiver ||
      !text
    ){

      return;

    }

    const exists =
      this.sql.exec(
        `
        SELECT username
        FROM accounts
        WHERE username=?
        `,
        receiver
      ).toArray();

    if(!exists.length){
      return;
    }

    const now =
      Date.now();

    this.sql.exec(
      `
      INSERT INTO messages
      (
        sender,
        receiver,
        text,
        kind,
        created_at
      )
      VALUES(?,?,?,?,?)
      `,
      sender,
      receiver,
      text,
      "text",
      now
    );

    const packet = {
      type:
        "message",
      from:
        sender,
      sender:
        sender,
      to:
        receiver,
      text:
        text,
      kind:
        "text",
      createdAt:
        now
    };

    this.sendToUser(
      receiver,
      packet
    );

    this.sendToUser(
      sender,
      packet
    );

  }

  /* =======================================================
     HISTORY
  ======================================================= */

  handleHistory(
    username,
    data
  ){

    const other =
      String(
        data.with ||
        ""
      ).trim();

    if(!other){
      return;
    }

    const rows =
      this.sql.exec(
        `
        SELECT
          id,
          sender,
          receiver,
          text,
          kind,
          file_id,
          file_name,
          created_at
        FROM messages
        WHERE
          (
            sender=? AND
            receiver=?
          )
          OR
          (
            sender=? AND
            receiver=?
          )
        ORDER BY created_at ASC
        LIMIT 500
        `,
        username,
        other,
        other,
        username
      ).toArray();

    const list =
      rows.map(
        row => ({
          id:
            row.id,
          sender:
            row.sender,
          receiver:
            row.receiver,
          text:
            row.text || "",
          kind:
            row.kind || "text",
          fileId:
            row.file_id || "",
          fileName:
            row.file_name || "",
          createdAt:
            row.created_at
        })
      );

    this.sendToUser(
      username,
      {
        type:
          "history",
        with:
          other,
        messages:
          list
      }
    );

  }

  /* =======================================================
     CALL / FILE SIGNALING
  ======================================================= */

  handleCallSignal(
    sender,
    data
  ){

    const target =
      String(
        data.to ||
        ""
      ).trim();

    if(!target){
      return;
    }

    const exists =
      this.sql.exec(
        `
        SELECT username
        FROM accounts
        WHERE username=?
        `,
        target
      ).toArray();

    if(!exists.length){

      this.sendToUser(
        sender,
        {
          type:
            data.type ===
            "file_offer"
            ? "file_error"
            : "call_error",

          error:
            "المستخدم غير موجود",

          callId:
            data.callId ||
            "",

          transferId:
            data.transferId ||
            ""
        }
      );

      return;

    }

    const sent =
      this.sendToUser(
        target,
        Object.assign(
          {},
          data,
          {
            from:
              sender,
            type:
              data.type
          }
        )
      );

    if(
      !sent &&
      (
        data.type ===
        "call_offer" ||
        data.type ===
        "file_offer"
      )
    ){

      this.sendToUser(
        sender,
        {
          type:
            data.type ===
            "file_offer"
            ? "file_error"
            : "call_error",

          error:
            "المستخدم غير متصل حاليًا",

          callId:
            data.callId ||
            "",

          transferId:
            data.transferId ||
            ""
        }
      );

    }

  }

  /* =======================================================
     TOKEN
  ======================================================= */

  getUserFromToken(
    token
  ){

    if(!token){
      return null;
    }

    const rows =
      this.sql.exec(
        `
        SELECT username
        FROM sessions
        WHERE token=?
        `,
        token
      ).toArray();

    if(!rows.length){
      return null;
    }

    return rows[0].username;

  }

}

/* =========================================================
   HELPERS
========================================================= */

function json(
  data,
  status
){

  return new Response(
    JSON.stringify(
      data
    ),
    {
      status:
        status || 200,

      headers:{
        "Content-Type":
          "application/json;charset=UTF-8"
      }
    }
  );

}

function randomToken(){

  const bytes =
    new Uint8Array(
      32
    );

  crypto.getRandomValues(
    bytes
  );

  return Array.from(
    bytes
  )
    .map(
      b =>
        b
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");

}

function randomHex(
  length
){

  const bytes =
    new Uint8Array(
      length
    );

  crypto.getRandomValues(
    bytes
  );

  return Array.from(
    bytes
  )
    .map(
      b =>
        b
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");

}

async function hashPassword(
  password,
  saltHex
){

  const salt =
    hexToBytes(
      saltHex
    );

  const key =
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder()
        .encode(
          password
        ),
      "PBKDF2",
      false,
      [
        "deriveBits"
      ]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name:
          "PBKDF2",

        salt:
          salt,

        iterations:
          100000,

        hash:
          "SHA-256"
      },

      key,

      256
    );

  return bytesToHex(
    new Uint8Array(
      bits
    )
  );

}

function hexToBytes(
  hex
){

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
        hex.substr(
          i * 2,
          2
        ),
        16
      );

  }

  return bytes;

}

function bytesToHex(
  bytes
){

  return Array.from(
    bytes
  )
    .map(
      b =>
        b
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");

}
