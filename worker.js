import { DurableObject } from "cloudflare:workers";

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>الشات</title>

<style>
*{
  box-sizing:border-box;
}

html,body{
  margin:0;
  padding:0;
  width:100%;
  height:100%;
  font-family:Arial,sans-serif;
}

body{
  background:#e5ddd5;
}

button,
input{
  font-family:inherit;
}

#auth{
  width:100%;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.auth-box{
  width:100%;
  max-width:380px;
  background:#fff;
  padding:25px;
  border-radius:18px;
  box-shadow:0 8px 30px rgba(0,0,0,.15);
}

.auth-box h2{
  text-align:center;
  margin:0 0 20px;
}

.auth-box input{
  width:100%;
  padding:13px;
  margin-bottom:12px;
  border:1px solid #ddd;
  border-radius:10px;
  outline:none;
  font-size:15px;
}

.auth-box input:focus{
  border-color:#128c7e;
}

.auth-box button{
  width:100%;
  border:0;
  padding:13px;
  border-radius:10px;
  background:#128c7e;
  color:#fff;
  font-size:16px;
  cursor:pointer;
}

.auth-box button:disabled{
  opacity:.6;
}

.auth-switch{
  text-align:center;
  color:#128c7e;
  margin-top:15px;
  cursor:pointer;
}

#error{
  color:#d00;
  text-align:center;
  margin-top:12px;
  min-height:20px;
}

#app{
  display:none;
  width:100%;
  height:100vh;
  overflow:hidden;
}

.layout{
  width:100%;
  height:100%;
  display:flex;
}

.sidebar{
  width:300px;
  min-width:300px;
  height:100%;
  background:#fff;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

.sidebar-header{
  height:64px;
  min-height:64px;
  background:#075e54;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:10px 14px;
}

.sidebar-title{
  font-size:18px;
  font-weight:bold;
}

.logout-btn{
  border:0;
  background:rgba(255,255,255,.15);
  color:#fff;
  border-radius:8px;
  padding:8px 12px;
  cursor:pointer;
}

.users{
  flex:1;
  overflow-y:auto;
}

.no-users{
  padding:25px 10px;
  text-align:center;
  color:#888;
}

.user{
  width:100%;
  min-height:70px;
  padding:10px;
  display:flex;
  align-items:center;
  gap:9px;
  border-bottom:1px solid #eee;
  cursor:pointer;
}

.user:hover{
  background:#f5f5f5;
}

.user.active{
  background:#e5f5f2;
}

.avatar{
  width:44px;
  height:44px;
  min-width:44px;
  border-radius:50%;
  background:#128c7e;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:18px;
  font-weight:bold;
}

.user-info{
  flex:1;
  min-width:0;
}

.username{
  font-size:15px;
  font-weight:bold;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.status{
  font-size:12px;
  margin-top:4px;
}

.status.online{
  color:#159447;
}

.status.offline{
  color:#888;
}

.online-dot,
.offline-dot{
  width:10px;
  height:10px;
  min-width:10px;
  border-radius:50%;
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
  height:100%;
  display:flex;
  flex-direction:column;
}

.chat-header{
  height:64px;
  min-height:64px;
  background:#075e54;
  color:#fff;
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 14px;
}

.chat-header .avatar{
  width:42px;
  height:42px;
  min-width:42px;
}

.chat-title{
  font-size:16px;
  font-weight:bold;
}

.chat-status{
  font-size:12px;
  margin-top:3px;
  opacity:.9;
}

.messages{
  flex:1;
  overflow-y:auto;
  padding:15px;
  background:#efe7dd;
}

.empty{
  text-align:center;
  color:#888;
  margin-top:40px;
}

.message{
  max-width:75%;
  padding:9px 11px;
  border-radius:10px;
  margin-bottom:8px;
  word-break:break-word;
}

.message.mine{
  background:#dcf8c6;
  margin-right:auto;
}

.message.theirs{
  background:#fff;
  margin-left:auto;
}

.message-time{
  color:#777;
  font-size:10px;
  margin-top:4px;
}

.audio-message audio{
  width:230px;
  max-width:100%;
}

.typing{
  height:22px;
  min-height:22px;
  padding:2px 15px;
  background:#efe7dd;
  color:#777;
  font-size:12px;
}

.composer{
  min-height:64px;
  padding:9px;
  background:#f0f0f0;
  display:flex;
  align-items:center;
  gap:7px;
}

.message-input{
  flex:1;
  min-width:0;
  border:0;
  outline:0;
  border-radius:22px;
  padding:12px 15px;
  font-size:15px;
}

.icon-btn{
  width:45px;
  height:45px;
  min-width:45px;
  border:0;
  border-radius:50%;
  background:#128c7e;
  color:#fff;
  font-size:19px;
  cursor:pointer;
}

.icon-btn.recording{
  background:#d32f2f;
  animation:pulse 1s infinite;
}

@keyframes pulse{
  0%{transform:scale(1)}
  50%{transform:scale(1.08)}
  100%{transform:scale(1)}
}

@media(max-width:700px){

  .sidebar{
    width:180px;
    min-width:180px;
  }

  .sidebar-title{
    font-size:14px;
  }

  .logout-btn{
    font-size:11px;
    padding:7px 8px;
  }

  .user{
    padding:9px 6px;
    gap:6px;
  }

  .avatar{
    width:38px;
    height:38px;
    min-width:38px;
    font-size:15px;
  }

  .username{
    font-size:12px;
  }

  .status{
    font-size:10px;
  }

  .online-dot,
  .offline-dot{
    width:8px;
    height:8px;
    min-width:8px;
  }

  .message{
    max-width:85%;
  }
}

@media(max-width:430px){

  .sidebar{
    width:155px;
    min-width:155px;
  }

  .sidebar-header{
    padding:8px;
  }

  .sidebar-title{
    font-size:12px;
  }

  .logout-btn{
    font-size:10px;
    padding:6px;
  }

  .user{
    min-height:62px;
    padding:7px 4px;
  }

  .avatar{
    width:34px;
    height:34px;
    min-width:34px;
    font-size:14px;
  }

  .username{
    font-size:11px;
  }

  .status{
    font-size:9px;
  }

  .chat-title{
    font-size:14px;
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
      placeholder="اسم المستخدم"
      autocomplete="username"
    >

    <input
      id="password"
      type="password"
      placeholder="كلمة السر"
      autocomplete="current-password"
    >

    <button id="authButton">
      إنشاء الحساب
    </button>

    <div
      class="auth-switch"
      id="switchAuth"
    >
      عندك حساب؟ تسجيل الدخول
    </div>

    <div id="error"></div>

  </div>

</div>

<div id="app">

  <div class="layout">

    <aside class="sidebar">

      <div class="sidebar-header">

        <span class="sidebar-title">
          المستخدمون
        </span>

        <button
          class="logout-btn"
          id="logoutBtn"
        >
          خروج
        </button>

      </div>

      <div
        class="users"
        id="users"
      ></div>

    </aside>

    <main class="chat">

      <div class="chat-header">

        <div
          class="avatar"
          id="chatAvatar"
        >
          ?
        </div>

        <div>

          <div
            class="chat-title"
            id="chatTitle"
          >
            اختر مستخدمًا
          </div>

          <div
            class="chat-status"
            id="chatStatus"
          ></div>

        </div>

      </div>

      <div
        class="messages"
        id="messages"
      >

        <div class="empty">
          اختر مستخدمًا لبدء المحادثة
        </div>

      </div>

      <div
        class="typing"
        id="typing"
      ></div>

      <div class="composer">

        <button
          class="icon-btn"
          id="recordBtn"
          title="تسجيل صوتي"
        >
          🎙️
        </button>

        <input
          class="message-input"
          id="messageInput"
          type="text"
          placeholder="اكتب رسالة..."
        >

        <button
          class="icon-btn"
          id="sendBtn"
        >
          ➤
        </button>

      </div>

    </main>

  </div>

</div>

<script>

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

const auth =
  document.getElementById("auth");

const app =
  document.getElementById("app");

const authTitle =
  document.getElementById("authTitle");

const authButton =
  document.getElementById("authButton");

const switchAuth =
  document.getElementById("switchAuth");

const errorBox =
  document.getElementById("error");

const usernameInput =
  document.getElementById("username");

const passwordInput =
  document.getElementById("password");

const usersBox =
  document.getElementById("users");

const messagesBox =
  document.getElementById("messages");

const messageInput =
  document.getElementById("messageInput");

const chatTitle =
  document.getElementById("chatTitle");

const chatStatus =
  document.getElementById("chatStatus");

const chatAvatar =
  document.getElementById("chatAvatar");

const typingBox =
  document.getElementById("typing");

const recordBtn =
  document.getElementById("recordBtn");

function setError(text){
  errorBox.textContent = text || "";
}

switchAuth.onclick = function(){

  registerMode = !registerMode;

  setError("");

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
      "دخول";

    switchAuth.textContent =
      "مفيش حساب؟ إنشاء حساب";
  }
};

authButton.onclick =
async function(){

  const username =
    usernameInput.value.trim();

  const password =
    passwordInput.value;

  if(!username || !password){

    setError(
      "اكتب اسم المستخدم وكلمة السر"
    );

    return;
  }

  authButton.disabled = true;
  setError("");

  try{

    const endpoint =
      registerMode
        ? "/api/register"
        : "/api/login";

    const response =
      await fetch(
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
      await response.json();

    if(!response.ok){

      throw new Error(
        data.error || "حدث خطأ"
      );
    }

    token = data.token;

    currentUser =
      data.username || username;

    localStorage.setItem(
      "chat_token",
      token
    );

    auth.style.display = "none";
    app.style.display = "block";

    usernameInput.value = "";
    passwordInput.value = "";

    await loadUsers();

    connectWS();

  }catch(error){

    setError(
      error.message
    );

  }finally{

    authButton.disabled = false;
  }
};

async function showApp(){

  if(!token){

    auth.style.display = "flex";
    app.style.display = "none";

    return;
  }

  try{

    const response =
      await fetch(
        "/api/me?token=" +
        encodeURIComponent(token)
      );

    const data =
      await response.json();

    if(!response.ok){

      throw new Error(
        data.error || "الجلسة غير صالحة"
      );
    }

    currentUser =
      data.username;

    auth.style.display = "none";
    app.style.display = "block";

    await loadUsers();

    connectWS();

  }catch(error){

    localStorage.removeItem(
      "chat_token"
    );

    token = "";
    currentUser = "";

    auth.style.display = "flex";
    app.style.display = "none";

    setError(
      "تعذر فتح الجلسة"
    );
  }
}

document.getElementById(
  "logoutBtn"
).onclick =
async function(){

  try{

    await fetch(
      "/api/logout",
      {
        method:"POST",
        headers:{
          "Content-Type":
            "application/json"
        },
        body:JSON.stringify({
          token
        })
      }
    );

  }catch(e){}

  if(ws){

    try{
      ws.close();
    }catch(e){}
  }

  localStorage.removeItem(
    "chat_token"
  );

  token = "";
  currentUser = "";
  selectedUser = "";

  auth.style.display = "flex";
  app.style.display = "none";

  usersBox.innerHTML = "";
  messagesBox.innerHTML = "";

  setError("");
};

async function loadUsers(){

  if(!token){
    return;
  }

  try{

    const response =
      await fetch(
        "/api/users?token=" +
        encodeURIComponent(token),
        {
          cache:"no-store"
        }
      );

    if(!response.ok){

      if(response.status === 401){

        localStorage.removeItem(
          "chat_token"
        );

        token = "";

        return;
      }

      throw new Error(
        "فشل تحميل المستخدمين"
      );
    }

    const data =
      await response.json();

    const list =
      Array.isArray(data.users)
        ? data.users
        : [];

    renderUsers(list);

  }catch(error){

    console.error(
      "users:",
      error
    );
  }
}

function renderUsers(list){

  usersBox.innerHTML = "";

  const others =
    list.filter(
      function(user){
        return user.username !== currentUser;
      }
    );

  if(others.length === 0){

    const empty =
      document.createElement("div");

    empty.className =
      "no-users";

    empty.textContent =
      "لا يوجد مستخدمون آخرون";

    usersBox.appendChild(
      empty
    );

    return;
  }

  others.forEach(
    function(user){

      const row =
        document.createElement("div");

      row.className = "user";

      if(
        user.username === selectedUser
      ){

        row.classList.add("active");
      }

      const avatar =
        document.createElement("div");

      avatar.className = "avatar";

      avatar.textContent =
        user.username
          .charAt(0)
          .toUpperCase();

      const info =
        document.createElement("div");

      info.className = "user-info";

      const name =
        document.createElement("div");

      name.className = "username";

      name.textContent =
        user.username;

      const status =
        document.createElement("div");

      status.className =
        user.online
          ? "status online"
          : "status offline";

      status.textContent =
        user.online
          ? "🟢 متصل الآن"
          : "⚪ غير متصل";

      info.appendChild(name);
      info.appendChild(status);

      const dot =
        document.createElement("div");

      dot.className =
        user.online
          ? "online-dot"
          : "offline-dot";

      row.appendChild(avatar);
      row.appendChild(info);
      row.appendChild(dot);

      row.onclick =
        function(){

          selectUser(
            user.username,
            user.online
          );
        };

      usersBox.appendChild(row);
    }
  );
}

function connectWS(){

  if(!token){
    return;
  }

  if(ws){

    try{
      ws.close();
    }catch(e){}
  }

  const protocol =
    location.protocol === "https:"
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

      if(reconnectTimer){

        clearTimeout(
          reconnectTimer
        );

        reconnectTimer = null;
      }

      loadUsers();

      if(selectedUser){

        sendHistoryRequest();
      }
    };

  ws.onmessage =
    function(event){

      try{

        const data =
          JSON.parse(event.data);

        if(data.type === "message"){

          receiveTextMessage(data);

        }else if(data.type === "voice"){

          receiveVoiceMessage(data);

        }else if(data.type === "history"){

          showHistory(
            data.messages || []
          );

        }else if(data.type === "typing"){

          if(
            data.from === selectedUser
          ){

            typingBox.textContent =
              data.typing
                ? data.from + " يكتب..."
                : "";
          }

        }else if(data.type === "users_changed"){

          loadUsers();
        }

      }catch(error){

        console.error(error);
      }
    };

  ws.onclose =
    function(){

      loadUsers();

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

function selectUser(
  username,
  online
){

  selectedUser =
    username;

  chatTitle.textContent =
    username;

  chatAvatar.textContent =
    username.charAt(0).toUpperCase();

  chatStatus.textContent =
    online
      ? "🟢 متصل الآن"
      : "⚪ غير متصل";

  typingBox.textContent = "";

  messagesBox.innerHTML =
    '<div class="empty">جاري تحميل المحادثة...</div>';

  loadUsers();

  sendHistoryRequest();
}

function sendHistoryRequest(){

  if(
    !ws ||
    ws.readyState !== WebSocket.OPEN ||
    !selectedUser
  ){
    return;
  }

  ws.send(
    JSON.stringify({
      type:"history",
      with:selectedUser
    })
  );
}

function showHistory(messages){

  messagesBox.innerHTML = "";

  if(messages.length === 0){

    messagesBox.innerHTML =
      '<div class="empty">لا توجد رسائل بعد</div>';

    return;
  }

  messages.forEach(
    function(message){
      addMessageToUI(message);
    }
  );

  scrollMessages();
}

function receiveTextMessage(data){

  if(
    data.from !== selectedUser &&
    data.to !== selectedUser
  ){

    loadUsers();

    return;
  }

  addMessageToUI({
    from:data.from,
    to:data.to,
    text:data.text,
    created_at:data.created_at,
    message_type:"text"
  });

  scrollMessages();
  loadUsers();
}

function receiveVoiceMessage(data){

  if(
    data.from !== selectedUser &&
    data.to !== selectedUser
  ){

    loadUsers();

    return;
  }

  addMessageToUI({
    from:data.from,
    to:data.to,
    audio_data:data.audio_data,
    created_at:data.created_at,
    message_type:"voice"
  });

  scrollMessages();
  loadUsers();
}

function addMessageToUI(message){

  const empty =
    messagesBox.querySelector(".empty");

  if(empty){
    empty.remove();
  }

  const box =
    document.createElement("div");

  const mine =
    message.from === currentUser;

  box.className =
    "message " +
    (mine ? "mine" : "theirs");

  if(
    message.message_type === "voice" &&
    message.audio_data
  ){

    const audioBox =
      document.createElement("div");

    audioBox.className =
      "audio-message";

    const audio =
      document.createElement("audio");

    audio.controls = true;

    audio.src =
      message.audio_data;

    audioBox.appendChild(audio);
    box.appendChild(audioBox);

  }else{

    const text =
      document.createElement("div");

    text.textContent =
      message.text || "";

    box.appendChild(text);
  }

  const time =
    document.createElement("div");

  time.className =
    "message-time";

  time.textContent =
    formatTime(
      message.created_at
    );

  box.appendChild(time);

  messagesBox.appendChild(box);
}

function formatTime(timestamp){

  if(!timestamp){
    return "";
  }

  return new Date(
    timestamp
  ).toLocaleTimeString(
    "ar-EG",
    {
      hour:"2-digit",
      minute:"2-digit"
    }
  );
}

function scrollMessages(){

  messagesBox.scrollTop =
    messagesBox.scrollHeight;
}

document.getElementById(
  "sendBtn"
).onclick =
function(){

  sendText();
};

messageInput.addEventListener(
  "keydown",
  function(event){

    if(event.key === "Enter"){

      event.preventDefault();

      sendText();
    }
  }
);

messageInput.addEventListener(
  "input",
  function(){

    if(!selectedUser){
      return;
    }

    if(
      ws &&
      ws.readyState === WebSocket.OPEN
    ){

      ws.send(
        JSON.stringify({
          type:"typing",
          to:selectedUser,
          typing:true
        })
      );
    }

    clearTimeout(
      typingTimer
    );

    typingTimer =
      setTimeout(
        function(){

          if(
            ws &&
            ws.readyState === WebSocket.OPEN
          ){

            ws.send(
              JSON.stringify({
                type:"typing",
                to:selectedUser,
                typing:false
              })
            );
          }

        },
        700
      );
  }
);

function sendText(){

  const text =
    messageInput.value.trim();

  if(
    !text ||
    !selectedUser
  ){
    return;
  }

  if(
    !ws ||
    ws.readyState !== WebSocket.OPEN
  ){

    alert(
      "الاتصال غير متاح، انتظر قليلًا"
    );

    return;
  }

  ws.send(
    JSON.stringify({
      type:"message",
      to:selectedUser,
      text:text
    })
  );

  messageInput.value = "";
}

recordBtn.onclick =
async function(){

  if(isRecording){

    stopRecording();

  }else{

    await startRecording();
  }
};

async function startRecording(){

  if(!selectedUser){

    alert(
      "اختار مستخدم أولًا"
    );

    return;
  }

  if(
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ){

    alert(
      "المتصفح لا يدعم التسجيل الصوتي"
    );

    return;
  }

  try{

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio:true
      });

    audioChunks = [];

    let options = {};

    if(
      MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
    ){

      options.mimeType =
        "audio/webm;codecs=opus";
    }

    mediaRecorder =
      new MediaRecorder(
        stream,
        options
      );

    mediaRecorder.ondataavailable =
      function(event){

        if(
          event.data &&
          event.data.size > 0
        ){

          audioChunks.push(
            event.data
          );
        }
      };

    mediaRecorder.onstop =
      async function(){

        stream
          .getTracks()
          .forEach(
            function(track){
              track.stop();
            }
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

        await sendVoiceMessage(
          blob
        );
      };

    mediaRecorder.start();

    isRecording = true;

    recordBtn.classList.add(
      "recording"
    );

    recordBtn.textContent =
      "⏹️";

  }catch(error){

    alert(
      "اسمح للموقع باستخدام الميكروفون"
    );
  }
}

function stopRecording(){

  if(
    mediaRecorder &&
    mediaRecorder.state !== "inactive"
  ){

    mediaRecorder.stop();
  }

  isRecording = false;

  recordBtn.classList.remove(
    "recording"
  );

  recordBtn.textContent =
    "🎙️";
}

async function sendVoiceMessage(blob){

  if(
    !ws ||
    ws.readyState !== WebSocket.OPEN
  ){

    alert(
      "الاتصال غير متاح"
    );

    return;
  }

  if(
    blob.size >
    2 * 1024 * 1024
  ){

    alert(
      "التسجيل كبير جدًا، سجل رسالة أقصر"
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload =
    function(){

      ws.send(
        JSON.stringify({
          type:"voice",
          to:selectedUser,
          audio_data:reader.result
        })
      );
    };

  reader.readAsDataURL(blob);
}

if(token){

  showApp();

}else{

  auth.style.display = "flex";
  app.style.display = "none";
}

</script>

</body>
</html>`;

export default {

  async fetch(request, env){

    const url =
      new URL(request.url);

    if(
      url.pathname === "/" ||
      url.pathname === ""
    ){

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

    const roomId =
      env.CHAT_ROOM.idFromName("main");

    const room =
      env.CHAT_ROOM.get(roomId);

    if(
      url.pathname === "/ws" &&
      request.headers.get("Upgrade") === "websocket"
    ){

      return room.fetch(request);
    }

    if(url.pathname === "/api/register"){

      return room.fetch(
        new Request(
          new URL(
            "/register",
            request.url
          ),
          request
        )
      );
    }

    if(url.pathname === "/api/login"){

      return room.fetch(
        new Request(
          new URL(
            "/login",
            request.url
          ),
          request
        )
      );
    }

    if(url.pathname === "/api/logout"){

      return room.fetch(
        new Request(
          new URL(
            "/logout",
            request.url
          ),
          request
        )
      );
    }

    if(url.pathname === "/api/me"){

      return room.fetch(
        new Request(
          new URL(
            "/me",
            request.url
          ),
          request
        )
      );
    }

    if(url.pathname === "/api/users"){

      return room.fetch(
        new Request(
          new URL(
            "/users",
            request.url
          ),
          request
        )
      );
    }

    return new Response(
      "Not Found",
      {status:404}
    );
  }
};

export class ChatRoom
extends DurableObject{

  constructor(ctx, env){

    super(ctx, env);

    this.ctx = ctx;
    this.env = env;

    this.sql =
      ctx.storage.sql;

    this.connections =
      new Map();

    this.initDB();
  }

  initDB(){

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    const accountColumns =
      this.sql
        .exec(
          `PRAGMA table_info(accounts)`
        )
        .toArray();

    const accountNames =
      accountColumns.map(
        c => c.name
      );

    if(!accountNames.includes("salt")){

      try{

        this.sql.exec(`
          ALTER TABLE accounts
          ADD COLUMN salt TEXT
          NOT NULL DEFAULT ''
        `);

      }catch(e){}
    }

    if(!accountNames.includes("created_at")){

      try{

        this.sql.exec(`
          ALTER TABLE accounts
          ADD COLUMN created_at INTEGER
          NOT NULL DEFAULT 0
        `);

      }catch(e){}
    }

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT 0,
        expires_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    const sessionColumns =
      this.sql
        .exec(
          `PRAGMA table_info(sessions)`
        )
        .toArray();

    const sessionNames =
      sessionColumns.map(
        c => c.name
      );

    if(!sessionNames.includes("token")){

      try{

        this.sql.exec(`
          ALTER TABLE sessions
          ADD COLUMN token TEXT
        `);

      }catch(e){}
    }

    if(!sessionNames.includes("username")){

      try{

        this.sql.exec(`
          ALTER TABLE sessions
          ADD COLUMN username TEXT
        `);

      }catch(e){}
    }

    if(!sessionNames.includes("created_at")){

      try{

        this.sql.exec(`
          ALTER TABLE sessions
          ADD COLUMN created_at INTEGER
          NOT NULL DEFAULT 0
        `);

      }catch(e){}
    }

    if(!sessionNames.includes("expires_at")){

      try{

        this.sql.exec(`
          ALTER TABLE sessions
          ADD COLUMN expires_at INTEGER
          NOT NULL DEFAULT 0
        `);

      }catch(e){}
    }

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT,
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    const messageColumns =
      this.sql
        .exec(
          `PRAGMA table_info(messages)`
        )
        .toArray();

    const messageNames =
      messageColumns.map(
        c => c.name
      );

    if(!messageNames.includes("message_type")){

      try{

        this.sql.exec(`
          ALTER TABLE messages
          ADD COLUMN message_type TEXT
          NOT NULL DEFAULT 'text'
        `);

      }catch(e){}
    }

    if(!messageNames.includes("audio_data")){

      try{

        this.sql.exec(`
          ALTER TABLE messages
          ADD COLUMN audio_data TEXT
        `);

      }catch(e){}
    }

    if(!messageNames.includes("created_at")){

      try{

        this.sql.exec(`
          ALTER TABLE messages
          ADD COLUMN created_at INTEGER
          NOT NULL DEFAULT 0
        `);

      }catch(e){}
    }
  }

  async fetch(request){

    const url =
      new URL(request.url);

    if(
      url.pathname === "/register" &&
      request.method === "POST"
    ){

      return this.register(request);
    }

    if(
      url.pathname === "/login" &&
      request.method === "POST"
    ){

      return this.login(request);
    }

    if(
      url.pathname === "/logout" &&
      request.method === "POST"
    ){

      return this.logout(request);
    }

    if(url.pathname === "/me"){

      return this.me(request);
    }

    if(url.pathname === "/users"){

      return this.users(request);
    }

    if(
      url.pathname === "/ws" &&
      request.headers.get("Upgrade") === "websocket"
    ){

      return this.websocket(request);
    }

    return new Response(
      "Not Found",
      {status:404}
    );
  }

  json(data, status=200){

    return new Response(
      JSON.stringify(data),
      {
        status:status,
        headers:{
          "content-type":
            "application/json;charset=UTF-8",
          "cache-control":
            "no-store"
        }
      }
    );
  }

  async register(request){

    try{

      const body =
        await request.json();

      const username =
        String(
          body.username || ""
        ).trim();

      const password =
        String(
          body.password || ""
        );

      if(!username || !password){

        return this.json(
          {
            error:
              "اسم المستخدم وكلمة السر مطلوبان"
          },
          400
        );
      }

      if(username.length < 3){

        return this.json(
          {
            error:
              "اسم المستخدم لازم يكون 3 حروف على الأقل"
          },
          400
        );
      }

      if(password.length < 4){

        return this.json(
          {
            error:
              "كلمة السر لازم تكون 4 حروف على الأقل"
          },
          400
        );
      }

      const exists =
        this.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username=?
          LIMIT 1
          `,
          username
        ).toArray();

      if(exists.length > 0){

        return this.json(
          {
            error:
              "اسم المستخدم موجود بالفعل"
          },
          409
        );
      }

      const salt =
        randomBytes(16);

      const passwordHash =
        await hashPassword(
          password,
          salt
        );

      const now =
        Date.now();

      this.sql.exec(
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

      /*
       * الجلسة لا تنتهي تلقائيًا.
       * القيمة الكبيرة فقط موجودة لأن العمود
       * القديم في قاعدة البيانات قد يكون NOT NULL.
       */
      const expiresAt =
        9999999999999;

      const token =
        randomToken();

      this.sql.exec(
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

      return this.json({
        token:token,
        username:username
      });

    }catch(error){

      return this.json(
        {
          error:
            "حدث خطأ أثناء إنشاء الحساب: " +
            error.message
        },
        500
      );
    }
  }

  async login(request){

    try{

      const body =
        await request.json();

      const username =
        String(
          body.username || ""
        ).trim();

      const password =
        String(
          body.password || ""
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
          LIMIT 1
          `,
          username
        ).toArray();

      if(rows.length === 0){

        return this.json(
          {
            error:
              "اسم المستخدم أو كلمة السر غير صحيحة"
          },
          401
        );
      }

      const account =
        rows[0];

      if(!account.salt){

        return this.json(
          {
            error:
              "الحساب القديم يحتاج إعادة إنشاء كلمة السر"
          },
          401
        );
      }

      const hash =
        await hashPassword(
          password,
          account.salt
        );

      if(
        hash !==
        account.password_hash
      ){

        return this.json(
          {
            error:
              "اسم المستخدم أو كلمة السر غير صحيحة"
          },
          401
        );
      }

      const now =
        Date.now();

      const expiresAt =
        9999999999999;

      const token =
        randomToken();

      this.sql.exec(
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

      return this.json({
        token:token,
        username:username
      });

    }catch(error){

      return this.json(
        {
          error:
            "حدث خطأ أثناء تسجيل الدخول: " +
            error.message
        },
        500
      );
    }
  }

  async logout(request){

    try{

      const body =
        await request.json();

      const token =
        String(
          body.token || ""
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

      return this.json({
        ok:true
      });

    }catch(error){

      return this.json(
        {
          error:error.message
        },
        500
      );
    }
  }

  async me(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get("token") || "";

    const username =
      this.getUserFromToken(token);

    if(!username){

      return this.json(
        {
          error:"الجلسة غير صالحة"
        },
        401
      );
    }

    return this.json({
      username:username
    });
  }

  async users(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get("token") || "";

    const username =
      this.getUserFromToken(token);

    if(!username){

      return this.json(
        {
          error:"الجلسة غير صالحة"
        },
        401
      );
    }

    const rows =
      this.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username COLLATE NOCASE
        `
      ).toArray();

    const users =
      rows.map(
        row => ({
          username:row.username,
          online:this.connections.has(
            row.username
          )
        })
      );

    return this.json({
      users:users
    });
  }

  getUserFromToken(token){

    if(!token){
      return null;
    }

    const rows =
      this.sql.exec(
        `
        SELECT username
        FROM sessions
        WHERE token=?
        LIMIT 1
        `,
        token
      ).toArray();

    if(rows.length === 0){

      return null;
    }

    /*
     * لا يوجد فحص لانتهاء الجلسة.
     * الجلسة تظل صالحة حتى يعمل المستخدم
     * تسجيل خروج بنفسه.
     */

    return rows[0].username;
  }

  async websocket(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get("token") || "";

    const username =
      this.getUserFromToken(token);

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

    this.ctx.acceptWebSocket(server);

    /*
     * لو فتح المستخدم اتصالًا جديدًا،
     * نغلق الاتصال القديم لنفس الحساب.
     */
    const old =
      this.connections.get(username);

    if(old){

      try{
        old.close();
      }catch(e){}
    }

    this.connections.set(
      username,
      server
    );

    server.serializeAttachment({
      username:username
    });

    /*
     * تحديث قائمة المستخدمين لكل المتصلين.
     */
    this.broadcastUsersChanged();

    return new Response(
      null,
      {
        status:101,
        webSocket:client
      }
    );
  }

  async webSocketMessage(
    ws,
    message
  ){

    try{

      const attachment =
        ws.deserializeAttachment();

      if(!attachment){
        return;
      }

      const data =
        JSON.parse(message);

      await this.handleMessage(
        ws,
        attachment.username,
        data
      );

    }catch(error){

      try{

        ws.send(
          JSON.stringify({
            type:"error",
            error:error.message
          })
        );

      }catch(e){}
    }
  }

  async webSocketClose(ws){

    this.removeConnection(ws);
  }

  async webSocketError(ws){

    this.removeConnection(ws);
  }

  removeConnection(ws){

    let username = "";

    try{

      const attachment =
        ws.deserializeAttachment();

      if(attachment){
        username =
          attachment.username || "";
      }

    }catch(e){}

    if(
      username &&
      this.connections.get(username) === ws
    ){

      this.connections.delete(
        username
      );

      this.broadcastUsersChanged();
    }
  }

  broadcastUsersChanged(){

    const payload =
      JSON.stringify({
        type:"users_changed"
      });

    for(
      const socket of
      this.connections.values()
    ){

      try{

        socket.send(payload);

      }catch(e){}
    }
  }

  sendToUser(
    username,
    payload
  ){

    const socket =
      this.connections.get(username);

    if(!socket){
      return;
    }

    try{

      socket.send(payload);

    }catch(e){

      if(
        this.connections.get(username) ===
        socket
      ){

        this.connections.delete(
          username
        );

        this.broadcastUsersChanged();
      }
    }
  }

  async handleMessage(
    ws,
    username,
    data
  ){

    if(data.type === "message"){

      const to =
        String(
          data.to || ""
        ).trim();

      const text =
        String(
          data.text || ""
        ).trim();

      if(!to || !text){
        return;
      }

      const exists =
        this.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username=?
          LIMIT 1
          `,
          to
        ).toArray();

      if(exists.length === 0){

        ws.send(
          JSON.stringify({
            type:"error",
            error:"المستخدم غير موجود"
          })
        );

        return;
      }

      const createdAt =
        Date.now();

      this.sql.exec(
        `
        INSERT INTO messages
        (
          sender,
          receiver,
          text,
          created_at,
          message_type,
          audio_data
        )
        VALUES(
          ?,
          ?,
          ?,
          ?,
          'text',
          NULL
        )
        `,
        username,
        to,
        text,
        createdAt
      );

      const payload =
        JSON.stringify({
          type:"message",
          from:username,
          to:to,
          text:text,
          created_at:createdAt
        });

      this.sendToUser(
        to,
        payload
      );

      this.sendToUser(
        username,
        payload
      );

      return;
    }

    if(data.type === "voice"){

      const to =
        String(
          data.to || ""
        ).trim();

      const audioData =
        String(
          data.audio_data || ""
        );

      if(!to || !audioData){
        return;
      }

      const exists =
        this.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username=?
          LIMIT 1
          `,
          to
        ).toArray();

      if(exists.length === 0){

        ws.send(
          JSON.stringify({
            type:"error",
            error:"المستخدم غير موجود"
          })
        );

        return;
      }

      if(audioData.length > 3000000){

        ws.send(
          JSON.stringify({
            type:"error",
            error:"التسجيل الصوتي كبير جدًا"
          })
        );

        return;
      }

      const createdAt =
        Date.now();

      this.sql.exec(
        `
        INSERT INTO messages
        (
          sender,
          receiver,
          text,
          created_at,
          message_type,
          audio_data
        )
        VALUES(
          ?,
          ?,
          NULL,
          ?,
          'voice',
          ?
        )
        `,
        username,
        to,
        createdAt,
        audioData
      );

      const payload =
        JSON.stringify({
          type:"voice",
          from:username,
          to:to,
          audio_data:audioData,
          created_at:createdAt
        });

      this.sendToUser(
        to,
        payload
      );

      this.sendToUser(
        username,
        payload
      );

      return;
    }

    if(data.type === "history"){

      const other =
        String(
          data.with || ""
        ).trim();

      if(!other){
        return;
      }

      const rows =
        this.sql.exec(
          `
          SELECT
            sender,
            receiver,
            text,
            created_at,
            message_type,
            audio_data

          FROM messages

          WHERE
          (
            sender=?
            AND receiver=?
          )
          OR
          (
            sender=?
            AND receiver=?
          )

          ORDER BY created_at ASC

          LIMIT 500
          `,
          username,
          other,
          other,
          username
        ).toArray();

      ws.send(
        JSON.stringify({
          type:"history",
          messages:
            rows.map(
              row => ({
                from:row.sender,
                to:row.receiver,
                text:row.text,
                created_at:row.created_at,
                message_type:
                  row.message_type ||
                  "text",
                audio_data:
                  row.audio_data ||
                  null
              })
            )
        })
      );

      return;
    }

    if(data.type === "typing"){

      const to =
        String(
          data.to || ""
        ).trim();

      if(!to){
        return;
      }

      this.sendToUser(
        to,
        JSON.stringify({
          type:"typing",
          from:username,
          to:to,
          typing:Boolean(data.typing)
        })
      );
    }
  }
}

function randomBytes(length){

  const bytes =
    new Uint8Array(length);

  crypto.getRandomValues(bytes);

  let result = "";

  for(
    let i=0;
    i<bytes.length;
    i++
  ){

    result +=
      bytes[i]
        .toString(16)
        .padStart(2,"0");
  }

  return result;
}

function randomToken(){

  return (
    randomBytes(32) +
    randomBytes(32)
  );
}

async function hashPassword(
  password,
  saltHex
){

  const salt =
    hexToBytes(saltHex);

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      {
        name:"PBKDF2"
      },
      false,
      ["deriveBits"]
    );

  const bits =
    await crypto.subtle.deriveBits(
      {
        name:"PBKDF2",
        salt:salt,
        iterations:100000,
        hash:"SHA-256"
      },
      key,
      256
    );

  return bytesToHex(
    new Uint8Array(bits)
  );
}

function hexToBytes(hex){

  const bytes =
    new Uint8Array(
      Math.floor(hex.length / 2)
    );

  for(
    let i=0;
    i<bytes.length;
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

function bytesToHex(bytes){

  let result = "";

  for(
    let i=0;
    i<bytes.length;
    i++
  ){

    result +=
      bytes[i]
        .toString(16)
        .padStart(2,"0");
  }

  return result;
  }
