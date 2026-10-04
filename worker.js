import { DurableObject } from "cloudflare:workers";

/* =========================================================
   إعدادات
========================================================= */

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SESSION_TIME = 3650 * 24 * 60 * 60 * 1000;
const MAX_MESSAGE = 4000;

/* =========================================================
   HTML
========================================================= */

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>دردشة</title>

<style>
*{box-sizing:border-box}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#e5ddd5;
  color:#222;
}

button{
  border:0;
  border-radius:10px;
  padding:10px 14px;
  background:#128c7e;
  color:white;
  font-size:15px;
  cursor:pointer;
}

button:disabled{
  opacity:.5;
}

input{
  border:1px solid #ccc;
  border-radius:10px;
  padding:12px;
  font-size:15px;
  outline:none;
}

.auth{
  width:min(420px,92%);
  margin:60px auto;
  background:white;
  padding:25px;
  border-radius:18px;
  box-shadow:0 5px 25px #0002;
}

.auth h1{
  text-align:center;
}

.auth input{
  width:100%;
  margin:7px 0;
}

.auth button{
  width:100%;
  margin-top:8px;
}

#error{
  color:#c00;
  min-height:25px;
  margin-top:10px;
  text-align:center;
}

#app{
  display:none;
  height:100vh;
}

.layout{
  height:100%;
  display:flex;
}

.sidebar{
  width:280px;
  background:#f4f4f4;
  border-left:1px solid #ccc;
  overflow:auto;
}

.sideHead{
  background:#075e54;
  color:white;
  padding:17px;
  font-size:20px;
  font-weight:bold;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

#users{
  padding:8px;
}

.user{
  background:white;
  padding:12px;
  margin:6px 0;
  border-radius:12px;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:8px;
  border:1px solid #eee;
}

.user:hover{
  background:#e9f5f3;
}

.user.selected{
  background:#d8eee9;
}

.dot{
  width:10px;
  height:10px;
  border-radius:50%;
  display:inline-block;
  background:#aaa;
}

.dot.online{
  background:#20c65a;
}

.chat{
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
}

.chatHead{
  background:#075e54;
  color:white;
  padding:12px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.chatUser{
  font-size:18px;
  font-weight:bold;
}

.callButtons{
  display:flex;
  gap:6px;
}

.callButtons button{
  background:#ffffff22;
  padding:8px 11px;
}

#messages{
  flex:1;
  overflow:auto;
  padding:15px;
}

.msg{
  max-width:75%;
  padding:9px 12px;
  margin:7px 0;
  border-radius:13px;
  background:white;
  box-shadow:0 1px 2px #0001;
}

.msg.mine{
  margin-right:auto;
  background:#d9ffc9;
}

.msg.theirs{
  margin-left:auto;
}

.msgName{
  font-size:12px;
  color:#075e54;
  font-weight:bold;
  margin-bottom:4px;
}

.msgTime{
  font-size:10px;
  color:#777;
  margin-top:4px;
}

.audioMsg{
  width:220px;
  max-width:100%;
}

.fileMsg{
  display:flex;
  flex-direction:column;
  gap:7px;
}

.fileMsg a{
  color:#075e54;
  font-weight:bold;
}

#typing{
  min-height:22px;
  padding:0 15px;
  color:#666;
  font-size:13px;
}

#bar{
  background:white;
  padding:9px;
  display:flex;
  gap:6px;
  align-items:center;
  border-top:1px solid #ddd;
}

#messageInput{
  flex:1;
  min-width:0;
}

.iconBtn{
  width:45px;
  height:45px;
  padding:0;
  font-size:20px;
}

#recordBtn.recording{
  background:#c62828;
}

#fileInput{
  display:none;
}

.empty{
  text-align:center;
  color:#777;
  margin-top:40px;
}

#incomingCall{
  display:none;
  position:fixed;
  left:15px;
  right:15px;
  bottom:20px;
  z-index:20;
  background:white;
  padding:18px;
  border-radius:16px;
  box-shadow:0 5px 30px #0005;
  text-align:center;
}

#incomingCall button{
  margin:5px;
}

#callPanel{
  display:none;
  position:fixed;
  inset:0;
  z-index:30;
  background:#111;
  color:white;
  flex-direction:column;
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
  background:#222;
}

.callInfo{
  position:absolute;
  top:15px;
  right:15px;
  background:#0008;
  padding:10px 15px;
  border-radius:10px;
}

.callControls{
  position:absolute;
  bottom:25px;
  left:0;
  right:0;
  display:flex;
  justify-content:center;
  gap:10px;
}

.callControls button{
  border-radius:50%;
  width:55px;
  height:55px;
  padding:0;
  font-size:20px;
}

#hangupBtn{
  background:#c62828;
}

@media(max-width:700px){
  .sidebar{
    width:150px;
  }

  .msg{
    max-width:88%;
  }

  .callButtons button{
    padding:7px;
  }
}

@media(max-width:500px){
  .sidebar{
    width:125px;
  }

  .sideHead{
    font-size:16px;
    padding:12px;
  }

  .user{
    font-size:13px;
    padding:9px;
  }
}
</style>
</head>

<body>

<!-- ================= AUTH ================= -->

<div id="auth">
  <div class="auth">
    <h1>💬 دردشة</h1>

    <input id="username" placeholder="اسم المستخدم" autocomplete="username">

    <input
      id="password"
      type="password"
      placeholder="كلمة المرور"
      autocomplete="current-password"
    >

    <button id="registerBtn">إنشاء حساب</button>

    <button id="loginBtn">تسجيل الدخول</button>

    <div id="error"></div>
  </div>
</div>

<!-- ================= APP ================= -->

<div id="app">

  <div class="layout">

    <aside class="sidebar">

      <div class="sideHead">
        <span>👥 المستخدمون</span>
        <button id="logoutBtn">خروج</button>
      </div>

      <div id="users"></div>

    </aside>

    <main class="chat">

      <div class="chatHead">

        <div>
          <div id="chatTitle" class="chatUser">
            اختر مستخدمًا
          </div>

          <div id="chatStatus">
            —
          </div>
        </div>

        <div class="callButtons">

          <button id="audioCallBtn" title="مكالمة صوتية">
            📞
          </button>

          <button id="videoCallBtn" title="مكالمة فيديو">
            📹
          </button>

        </div>

      </div>

      <div id="messages">
        <div class="empty">
          اختر مستخدمًا لبدء محادثة خاصة
        </div>
      </div>

      <div id="typing"></div>

      <div id="bar">

        <label
          for="fileInput"
          class="iconBtn"
          style="
            background:#128c7e;
            color:white;
            border-radius:10px;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
          "
        >
          📎
        </label>

        <input id="fileInput" type="file">

        <button
          id="recordBtn"
          class="iconBtn"
          title="رسالة صوتية"
        >
          🎙️
        </button>

        <input
          id="messageInput"
          placeholder="اكتب رسالة..."
          autocomplete="off"
        >

        <button id="sendBtn" class="iconBtn">
          ➤
        </button>

      </div>

    </main>

  </div>

</div>

<!-- ================= INCOMING CALL ================= -->

<div id="incomingCall">

  <div id="incomingText">
    📞 مكالمة واردة
  </div>

  <button id="acceptCallBtn">
    قبول
  </button>

  <button
    id="rejectCallBtn"
    style="background:#c62828"
  >
    رفض
  </button>

</div>

<!-- ================= CALL ================= -->

<div id="callPanel">

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

  <div id="callInfo" class="callInfo">
    مكالمة
  </div>

  <div class="callControls">

    <button id="muteBtn">
      🎙️
    </button>

    <button id="cameraBtn">
      📹
    </button>

    <button id="hangupBtn">
      ☎
    </button>

  </div>

</div>

<script>
/* =========================================================
   عناصر الصفحة
========================================================= */

const auth=document.getElementById("auth");
const app=document.getElementById("app");

const usernameInput=document.getElementById("username");
const passwordInput=document.getElementById("password");
const errorBox=document.getElementById("error");

const usersBox=document.getElementById("users");

const chatTitle=document.getElementById("chatTitle");
const chatStatus=document.getElementById("chatStatus");

const messages=document.getElementById("messages");
const typingBox=document.getElementById("typing");

const messageInput=document.getElementById("messageInput");
const sendBtn=document.getElementById("sendBtn");

const fileInput=document.getElementById("fileInput");
const recordBtn=document.getElementById("recordBtn");

const audioCallBtn=document.getElementById("audioCallBtn");
const videoCallBtn=document.getElementById("videoCallBtn");

const incomingCall=document.getElementById("incomingCall");
const incomingText=document.getElementById("incomingText");

const acceptCallBtn=document.getElementById("acceptCallBtn");
const rejectCallBtn=document.getElementById("rejectCallBtn");

const callPanel=document.getElementById("callPanel");
const callInfo=document.getElementById("callInfo");

const localVideo=document.getElementById("localVideo");
const remoteVideo=document.getElementById("remoteVideo");

const muteBtn=document.getElementById("muteBtn");
const cameraBtn=document.getElementById("cameraBtn");
const hangupBtn=document.getElementById("hangupBtn");

/* =========================================================
   الحالة
========================================================= */

let token=localStorage.getItem("chatToken") || "";
let currentUser=localStorage.getItem("chatUser") || "";

let selectedUser="";

let ws=null;
let reconnectTimer=null;

let onlineUsers=new Set();

let typingTimer=null;

/* WebRTC */

let peer=null;
let localStream=null;

let incomingOffer=null;
let incomingCaller=null;
let incomingCallType=null;

let currentCallUser=null;
let currentCallType=null;

let pendingCandidates=[];

/* File */

let fileTransfer={
  send:null,
  receive:null
};

/* Voice */

let mediaRecorder=null;
let audioChunks=[];

/* =========================================================
   أدوات
========================================================= */

function escapeText(text){
  return String(text ?? "");
}

function showError(text){
  errorBox.textContent=text || "";
}

function sendWS(data){
  if(!ws || ws.readyState!==WebSocket.OPEN){
    return false;
  }

  ws.send(JSON.stringify(data));

  return true;
}

function formatTime(timestamp){
  const d=new Date(timestamp || Date.now());

  return d.toLocaleTimeString("ar-EG",{
    hour:"2-digit",
    minute:"2-digit"
  });
}

async function api(path,body){
  const r=await fetch(path,{
    method:"POST",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify(body)
  });

  const data=await r.json().catch(()=>({}));

  return {
    ok:r.ok,
    data
  };
}

/* =========================================================
   تسجيل
========================================================= */

async function register(){

  const username=usernameInput.value.trim();
  const password=passwordInput.value;

  showError("");

  if(username.length<3){
    showError("اسم المستخدم لازم يكون 3 أحرف على الأقل");
    return;
  }

  if(password.length<6){
    showError("كلمة المرور لازم تكون 6 أحرف على الأقل");
    return;
  }

  const result=await api("/api/register",{
    username,
    password
  });

  if(!result.ok){
    showError(result.data.error || "تعذر إنشاء الحساب");
    return;
  }

  /* دخول تلقائي */

  const loginResult=await api("/api/login",{
    username,
    password
  });

  if(!loginResult.ok){
    showError("تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائيًا");
    return;
  }

  token=loginResult.data.token;
  currentUser=loginResult.data.username;

  localStorage.setItem("chatToken",token);
  localStorage.setItem("chatUser",currentUser);

  openApp();
}

/* =========================================================
   تسجيل الدخول
========================================================= */

async function login(){

  const username=usernameInput.value.trim();
  const password=passwordInput.value;

  showError("");

  if(!username || !password){
    showError("اكتب اسم المستخدم وكلمة المرور");
    return;
  }

  const result=await api("/api/login",{
    username,
    password
  });

  if(!result.ok){
    showError(result.data.error || "بيانات الدخول غير صحيحة");
    return;
  }

  token=result.data.token;
  currentUser=result.data.username;

  localStorage.setItem("chatToken",token);
  localStorage.setItem("chatUser",currentUser);

  openApp();
}

/* =========================================================
   فتح التطبيق
========================================================= */

function openApp(){

  auth.style.display="none";
  app.style.display="block";

  connectWebSocket();
}

/* =========================================================
   WebSocket
========================================================= */

function connectWebSocket(){

  if(!token)return;

  if(ws){
    try{
      ws.close();
    }catch{}
  }

  const protocol=
    location.protocol==="https:"
      ? "wss://"
      : "ws://";

  ws=new WebSocket(
    protocol+
    location.host+
    "/ws?token="+
    encodeURIComponent(token)
  );

  ws.onopen=()=>{

    if(reconnectTimer){
      clearTimeout(reconnectTimer);
      reconnectTimer=null;
    }

    messageInput.focus();

    loadUsersFromServer();
  };

  ws.onmessage=e=>{

    let data;

    try{
      data=JSON.parse(e.data);
    }catch{
      return;
    }

    handleWS(data);
  };

  ws.onclose=()=>{

    if(!token)return;

    clearTimeout(reconnectTimer);

    reconnectTimer=setTimeout(()=>{
      connectWebSocket();
    },2000);
  };

  ws.onerror=()=>{};
}

/* =========================================================
   استقبال WebSocket
========================================================= */

function handleWS(data){

  /* المستخدمون */

  if(data.type==="users"){
    onlineUsers=new Set(data.users || []);
    renderUsers(data.users || []);
    updateSelectedStatus();
    return;
  }

  /* رسالة خاصة */

  if(data.type==="private_message"){

    addTextMessage(data);

    if(
      data.from!==currentUser &&
      data.from!==selectedUser
    ){
      notifyMessage(data.from);
    }

    return;
  }

  /* سجل المحادثة */

  if(data.type==="history"){

    renderHistory(data.messages || []);

    return;
  }

  /* typing */

  if(data.type==="typing"){

    if(data.from===selectedUser){

      typingBox.textContent=
        data.typing
          ? data.from+" يكتب..."
          : "";

    }

    return;
  }

  /* WebRTC signaling */

  if(data.type==="rtc_offer"){
    receiveOffer(data);
    return;
  }

  if(data.type==="rtc_answer"){
    receiveAnswer(data);
    return;
  }

  if(data.type==="rtc_candidate"){
    receiveCandidate(data);
    return;
  }

  if(data.type==="rtc_reject"){
    closeCallUI();
    alert("تم رفض المكالمة");
    return;
  }

  if(data.type==="rtc_hangup"){
    closeCallUI();
    return;
  }

  /* file */

  if(data.type==="file_offer"){
    receiveFileOffer(data);
    return;
  }

  if(data.type==="file_answer"){
    receiveFileAnswer(data);
    return;
  }

  if(data.type==="file_candidate"){
    receiveFileCandidate(data);
    return;
  }

  if(data.type==="file_reject"){
    alert("تم رفض الملف");
    return;
  }

  if(data.type==="file_start"){
    receiveFileStart(data);
    return;
  }

  if(data.type==="file_end"){
    receiveFileEnd(data);
    return;
  }

  if(data.type==="error"){
    alert(data.message || "حدث خطأ");
  }
}

/* =========================================================
   المستخدمون
========================================================= */

function renderUsers(list){

  usersBox.innerHTML="";

  const users=list
    .filter(x=>x!==currentUser)
    .sort((a,b)=>a.localeCompare(b));

  if(!users.length){

    const empty=document.createElement("div");

    empty.style.padding="15px";
    empty.style.color="#777";

    empty.textContent="لا يوجد مستخدمون آخرون";

    usersBox.appendChild(empty);

    return;
  }

  users.forEach(user=>{

    const el=document.createElement("div");

    el.className=
      "user"+
      (user===selectedUser ? " selected" : "");

    const dot=document.createElement("span");

    dot.className=
      "dot"+
      (onlineUsers.has(user) ? " online" : "");

    const name=document.createElement("span");

    name.textContent=user;

    el.append(dot,name);

    el.onclick=()=>{
      selectUser(user);
    };

    usersBox.appendChild(el);
  });
}

async function loadUsersFromServer(){

  sendWS({
    type:"get_users"
  });
}

/* =========================================================
   اختيار مستخدم
========================================================= */

function selectUser(user){

  if(!user || user===currentUser)return;

  selectedUser=user;

  chatTitle.textContent=user;

  updateSelectedStatus();

  messages.innerHTML=
    '<div class="empty">جاري تحميل المحادثة...</div>';

  sendWS({
    type:"history",
    with:user
  });

  renderUsers([...onlineUsers]);
}

function updateSelectedStatus(){

  if(!selectedUser){
    chatStatus.textContent="—";
    return;
  }

  chatStatus.textContent=
    onlineUsers.has(selectedUser)
      ? "🟢 متصل الآن"
      : "⚪ غير متصل";
}

/* =========================================================
   الرسائل
========================================================= */

function renderHistory(list){

  messages.innerHTML="";

  if(!list.length){

    messages.innerHTML=
      '<div class="empty">لا توجد رسائل بعد</div>';

    return;
  }

  list.forEach(msg=>{
    addTextMessage(msg,false);
  });

  messages.scrollTop=messages.scrollHeight;
}

function addTextMessage(data,scroll=true){

  if(
    data.from!==currentUser &&
    data.from!==selectedUser
  ){
    return;
  }

  if(
    data.to!==currentUser &&
    data.to!==selectedUser
  ){
    return;
  }

  const box=document.createElement("div");

  box.className=
    "msg "+
    (data.from===currentUser
      ? "mine"
      : "theirs");

  const name=document.createElement("div");

  name.className="msgName";

  name.textContent=
    data.from===currentUser
      ? "أنت"
      : data.from;

  const text=document.createElement("div");

  text.textContent=data.text || "";

  const time=document.createElement("div");

  time.className="msgTime";

  time.textContent=formatTime(data.created_at);

  box.append(name,text,time);

  messages.appendChild(box);

  if(scroll){
    messages.scrollTop=messages.scrollHeight;
  }
}

function sendMessage(){

  const text=messageInput.value.trim();

  if(!text)return;

  if(!selectedUser){
    alert("اختر مستخدمًا أولًا");
    return;
  }

  if(!sendWS({
    type:"private_message",
    to:selectedUser,
    text:text.slice(0,MAX_MESSAGE)
  })){
    alert("الاتصال غير متاح");
    return;
  }

  messageInput.value="";

  sendWS({
    type:"typing",
    to:selectedUser,
    typing:false
  });

  messageInput.focus();
}

/* =========================================================
   الكتابة
========================================================= */

messageInput.addEventListener("input",()=>{

  if(!selectedUser)return;

  sendWS({
    type:"typing",
    to:selectedUser,
    typing:true
  });

  clearTimeout(typingTimer);

  typingTimer=setTimeout(()=>{

    sendWS({
      type:"typing",
      to:selectedUser,
      typing:false
    });

  },700);
});

messageInput.addEventListener("keydown",e=>{

  if(e.key==="Enter" && !e.shiftKey){

    e.preventDefault();

    sendMessage();
  }
});

/* =========================================================
   ملف 20MB WebRTC
========================================================= */

fileInput.onchange=async()=>{

  const file=fileInput.files?.[0];

  fileInput.value="";

  if(!file)return;

  if(!selectedUser){

    alert("اختر مستخدمًا لإرسال الملف إليه");

    return;
  }

  if(file.size>20*1024*1024){

    alert("الحد الأقصى للملف هو 20MB");

    return;
  }

  await sendFile(file);
};

async function sendFile(file){

  const id=
    crypto.randomUUID();

  const pc=createPeerConnection();

  const channel=
    pc.createDataChannel("file");

  fileTransfer.send={
    id,
    file,
    pc,
    channel
  };

  const offer=
    await pc.createOffer();

  await pc.setLocalDescription(offer);

  sendWS({
    type:"file_offer",
    to:selectedUser,
    id,
    name:file.name,
    size:file.size,
    mime:file.type || "application/octet-stream",
    offer
  });

  channel.binaryType="arraybuffer";

  channel.onopen=async()=>{

    sendWS({
      type:"file_start",
      to:selectedUser,
      id,
      name:file.name,
      size:file.size,
      mime:file.type || "application/octet-stream"
    });

    const buffer=await file.arrayBuffer();

    const chunkSize=64*1024;

    for(
      let offset=0;
      offset<buffer.byteLength;
      offset+=chunkSize
    ){

      while(channel.bufferedAmount>4*1024*1024){

        await new Promise(resolve=>{

          const old=channel.onbufferedamountlow;

          channel.onbufferedamountlow=()=>{

            channel.onbufferedamountlow=old;

            resolve();
          };

          setTimeout(resolve,1000);
        });
      }

      channel.send(
        buffer.slice(
          offset,
          Math.min(
            offset+chunkSize,
            buffer.byteLength
          )
        )
      );
    }

    sendWS({
      type:"file_end",
      to:selectedUser,
      id
    });

    addFileMessage(
      currentUser,
      file.name,
      null,
      true
    );
  };
}

/* =========================================================
   File signaling
========================================================= */

function receiveFileOffer(data){

  const ok=confirm(
    "المستخدم "+data.from+
    " يريد إرسال الملف:\\n\\n"+
    data.name+
    "\\nالحجم: "+
    formatSize(data.size)
  );

  if(!ok){

    sendWS({
      type:"file_reject",
      to:data.from,
      id:data.id
    });

    return;
  }

  const pc=createPeerConnection();

  fileTransfer.receive={
    id:data.id,
    from:data.from,
    name:data.name,
    size:data.size,
    mime:data.mime,
    pc,
    chunks:[],
    bytes:0,
    started:false
  };

  pc.ondatachannel=e=>{

    const channel=e.channel;

    channel.binaryType="arraybuffer";

    channel.onmessage=ev=>{

      if(!fileTransfer.receive)return;

      fileTransfer.receive.chunks.push(ev.data);

      fileTransfer.receive.bytes+=
        ev.data.byteLength ||
        ev.data.size ||
        0;
    };
  };

  pc.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  )
  .then(async()=>{

    await flushPendingCandidates(pc);

    const answer=
      await pc.createAnswer();

    await pc.setLocalDescription(answer);

    sendWS({
      type:"file_answer",
      to:data.from,
      id:data.id,
      answer
    });

  })
  .catch(()=>{

    sendWS({
      type:"file_reject",
      to:data.from,
      id:data.id
    });

  });
}

async function receiveFileAnswer(data){

  const t=fileTransfer.send;

  if(!t || t.id!==data.id)return;

  try{

    await t.pc.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    await flushPendingCandidates(t.pc);

  }catch{}
}

async function receiveFileCandidate(data){

  let pc=null;

  if(
    fileTransfer.send &&
    fileTransfer.send.id===data.id
  ){
    pc=fileTransfer.send.pc;
  }

  if(
    fileTransfer.receive &&
    fileTransfer.receive.id===data.id
  ){
    pc=fileTransfer.receive.pc;
  }

  if(!pc)return;

  try{

    if(pc.remoteDescription){

      await pc.addIceCandidate(data.candidate);

    }else{

      pendingCandidates.push({
        pc,
        candidate:data.candidate
      });

    }

  }catch{}
}

async function flushPendingCandidates(pc){

  const list=pendingCandidates.filter(
    x=>x.pc===pc
  );

  pendingCandidates=
    pendingCandidates.filter(
      x=>x.pc!==pc
    );

  for(const item of list){

    try{
      await pc.addIceCandidate(item.candidate);
    }catch{}
  }
}

function receiveFileStart(data){

  if(
    fileTransfer.receive &&
    fileTransfer.receive.id===data.id
  ){
    fileTransfer.receive.started=true;
  }
}

function receiveFileEnd(data){

  const t=fileTransfer.receive;

  if(!t || t.id!==data.id)return;

  if(t.bytes!==t.size){

    alert(
      "لم يكتمل استقبال الملف. "+
      "تم استلام "+
      formatSize(t.bytes)+
      " من "+
      formatSize(t.size)
    );

    return;
  }

  const blob=new Blob(
    t.chunks,
    {
      type:t.mime || "application/octet-stream"
    }
  );

  const url=URL.createObjectURL(blob);

  addFileMessage(
    t.from,
    t.name,
    url,
    false
  );

  try{
    t.pc.close();
  }catch{}

  fileTransfer.receive=null;
}

function formatSize(size){

  if(size<1024){
    return size+" B";
  }

  if(size<1024*1024){
    return (size/1024).toFixed(1)+" KB";
  }

  return (size/1024/1024).toFixed(2)+" MB";
}

function addFileMessage(from,name,url,mine){

  const box=document.createElement("div");

  box.className=
    "msg "+
    (mine ? "mine" : "theirs");

  const title=document.createElement("div");

  title.className="msgName";

  title.textContent=
    mine ? "أنت" : from;

  const content=document.createElement("div");

  content.className="fileMsg";

  const icon=document.createElement("div");

  icon.textContent="📎 "+name;

  content.appendChild(icon);

  if(url){

    const link=document.createElement("a");

    link.href=url;
    link.download=name;
    link.textContent="⬇️ فتح / حفظ الملف";

    content.appendChild(link);
  }else{

    const small=document.createElement("div");

    small.textContent=
      "تم إرسال الملف مباشرة";

    small.style.color="#777";

    content.appendChild(small);
  }

  box.append(title,content);

  messages.appendChild(box);

  messages.scrollTop=messages.scrollHeight;
}

/* =========================================================
   رسائل صوتية
========================================================= */

recordBtn.onclick=async()=>{

  if(mediaRecorder){

    if(mediaRecorder.state==="recording"){

      mediaRecorder.stop();

      recordBtn.classList.remove("recording");

      recordBtn.textContent="🎙️";

    }

    return;
  }

  if(!selectedUser){

    alert("اختر مستخدمًا أولًا");

    return;
  }

  try{

    const stream=
      await navigator.mediaDevices.getUserMedia({
        audio:true
      });

    audioChunks=[];

    let mime="";

    const options=[
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus"
    ];

    for(const x of options){

      if(
        window.MediaRecorder &&
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported(x)
      ){
        mime=x;
        break;
      }
    }

    mediaRecorder=
      mime
        ? new MediaRecorder(stream,{mimeType:mime})
        : new MediaRecorder(stream);

    mediaRecorder.ondataavailable=e=>{

      if(e.data && e.data.size){
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop=async()=>{

      stream.getTracks().forEach(
        track=>track.stop()
      );

      const blob=new Blob(
        audioChunks,
        {
          type:mediaRecorder.mimeType || "audio/webm"
        }
      );

      mediaRecorder=null;

      await sendVoice(blob);
    };

    mediaRecorder.start();

    recordBtn.classList.add("recording");
    recordBtn.textContent="⏹️";

  }catch{

    alert("لا يمكن الوصول إلى الميكروفون");
  }
};

async function sendVoice(blob){

  if(blob.size>20*1024*1024){

    alert("الرسالة الصوتية كبيرة جدًا");

    return;
  }

  if(!selectedUser)return;

  const id=crypto.randomUUID();

  const pc=createPeerConnection();

  const channel=pc.createDataChannel("voice");

  fileTransfer.send={
    id,
    file:blob,
    pc,
    channel
  };

  channel.binaryType="arraybuffer";

  const offer=await pc.createOffer();

  await pc.setLocalDescription(offer);

  sendWS({
    type:"file_offer",
    to:selectedUser,
    id,
    name:"رسالة صوتية.webm",
    size:blob.size,
    mime:blob.type,
    offer,
    voice:true
  });

  channel.onopen=async()=>{

    const buffer=await blob.arrayBuffer();

    const chunkSize=64*1024;

    for(
      let offset=0;
      offset<buffer.byteLength;
      offset+=chunkSize
    ){

      while(channel.bufferedAmount>4*1024*1024){
        await new Promise(resolve=>{
          setTimeout(resolve,30);
        });
      }

      channel.send(
        buffer.slice(
          offset,
          Math.min(
            offset+chunkSize,
            buffer.byteLength
          )
        )
      );
    }

    sendWS({
      type:"file_end",
      to:selectedUser,
      id,
      voice:true
    });

    addVoiceMessage(
      currentUser,
      blob,
      true
    );
  };
}

/* =========================================================
   تعديل استقبال الصوت
========================================================= */

const oldReceiveFileEnd=receiveFileEnd;

receiveFileEnd=function(data){

  const t=fileTransfer.receive;

  if(!t || t.id!==data.id)return;

  if(t.bytes!==t.size){

    alert("لم يكتمل استقبال الرسالة الصوتية");

    return;
  }

  const blob=new Blob(
    t.chunks,
    {
      type:t.mime || "audio/webm"
    }
  );

  const url=URL.createObjectURL(blob);

  if(t.voice){

    addVoiceMessage(
      t.from,
      blob,
      false
    );

  }else{

    addFileMessage(
      t.from,
      t.name,
      url,
      false
    );
  }

  try{
    t.pc.close();
  }catch{}

  fileTransfer.receive=null;
};

/* =========================================================
   اعتراض Offer للصوت
========================================================= */

const originalReceiveFileOffer=receiveFileOffer;

receiveFileOffer=function(data){

  const ok=confirm(
    data.voice
      ? "🎙️ رسالة صوتية واردة من "+data.from
      :
        "📎 "+data.from+
        " يريد إرسال الملف:\\n"+
        data.name+
        "\\nالحجم: "+
        formatSize(data.size)
  );

  if(!ok){

    sendWS({
      type:"file_reject",
      to:data.from,
      id:data.id
    });

    return;
  }

  const pc=createPeerConnection();

  fileTransfer.receive={
    id:data.id,
    from:data.from,
    name:data.name,
    size:data.size,
    mime:data.mime,
    voice:!!data.voice,
    pc,
    chunks:[],
    bytes:0
  };

  pc.ondatachannel=e=>{

    const channel=e.channel;

    channel.binaryType="arraybuffer";

    channel.onmessage=ev=>{

      const t=fileTransfer.receive;

      if(!t)return;

      t.chunks.push(ev.data);

      t.bytes+=
        ev.data.byteLength ||
        ev.data.size ||
        0;
    };
  };

  pc.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  )
  .then(async()=>{

    await flushPendingCandidates(pc);

    const answer=
      await pc.createAnswer();

    await pc.setLocalDescription(answer);

    sendWS({
      type:"file_answer",
      to:data.from,
      id:data.id,
      answer
    });

  })
  .catch(()=>{

    sendWS({
      type:"file_reject",
      to:data.from,
      id:data.id
    });

  });
};

/* =========================================================
   صوت في الرسائل
========================================================= */

function addVoiceMessage(from,blob,mine){

  const url=URL.createObjectURL(blob);

  const box=document.createElement("div");

  box.className=
    "msg "+
    (mine ? "mine" : "theirs");

  const name=document.createElement("div");

  name.className="msgName";

  name.textContent=
    mine ? "أنت 🎙️" : from+" 🎙️";

  const audio=document.createElement("audio");

  audio.className="audioMsg";
  audio.controls=true;
  audio.src=url;

  box.append(name,audio);

  messages.appendChild(box);

  messages.scrollTop=messages.scrollHeight;
}

/* =========================================================
   WebRTC للمكالمات
========================================================= */

function createPeerConnection(){

  const pc=new RTCPeerConnection({

    iceServers:[
      {
        urls:"stun:stun.l.google.com:19302"
      },
      {
        urls:"stun:stun.cloudflare.com:3478"
      }
    ]

  });

  pc.onicecandidate=e=>{

    if(
      e.candidate &&
      selectedOrCallUser()
    ){

      sendWS({
        type:"rtc_candidate",
        to:selectedOrCallUser(),
        candidate:e.candidate
      });
    }
  };

  pc.onconnectionstatechange=()=>{

    if(
      ["failed","disconnected","closed"]
        .includes(pc.connectionState)
    ){

      if(
        currentCallUser &&
        currentCallUser!==selectedUser
      ){
        closeCallUI();
      }
    }
  };

  return pc;
}

function selectedOrCallUser(){

  return currentCallUser ||
         selectedUser ||
         incomingCaller ||
         null;
}

/* =========================================================
   بدء مكالمة
========================================================= */

async function startCall(type){

  if(!selectedUser){

    alert("اختر المستخدم الذي تريد الاتصال به");

    return;
  }

  if(
    currentCallUser ||
    incomingCaller
  ){
    return;
  }

  currentCallUser=selectedUser;
  currentCallType=type;

  try{

    const constraints={
      audio:true,
      video:type==="video"
    };

    localStream=
      await navigator.mediaDevices.getUserMedia(
        constraints
      );

    showCallUI(
      selectedUser,
      type
    );

    peer=createPeerConnection();

    localStream.getTracks().forEach(
      track=>{
        peer.addTrack(track,localStream);
      }
    );

    peer.ontrack=e=>{

      if(e.streams && e.streams[0]){

        remoteVideo.srcObject=
          e.streams[0];

      }
    };

    if(type!=="video"){
      localVideo.style.display="none";
    }else{
      localVideo.style.display="block";
      localVideo.srcObject=localStream;
    }

    const offer=
      await peer.createOffer();

    await peer.setLocalDescription(offer);

    sendWS({
      type:"rtc_offer",
      to:selectedUser,
      callType:type,
      offer
    });

  }catch{

    alert(
      "تعذر تشغيل الكاميرا أو الميكروفون"
    );

    closeCallUI();
  }
}

/* =========================================================
   استقبال مكالمة
========================================================= */

function receiveOffer(data){

  if(currentCallUser || incomingCaller){

    sendWS({
      type:"rtc_reject",
      to:data.from
    });

    return;
  }

  incomingOffer=data.offer;
  incomingCaller=data.from;
  incomingCallType=data.callType || "audio";

  incomingText.textContent=
    incomingCallType==="video"
      ? "📹 مكالمة فيديو من "+data.from
      : "📞 مكالمة صوتية من "+data.from;

  incomingCall.style.display="block";
}

acceptCallBtn.onclick=async()=>{

  incomingCall.style.display="none";

  const from=incomingCaller;
  const offer=incomingOffer;
  const type=incomingCallType;

  currentCallUser=from;
  currentCallType=type;

  incomingCaller=null;
  incomingOffer=null;

  try{

    localStream=
      await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:type==="video"
      });

    showCallUI(from,type);

    peer=createPeerConnection();

    localStream.getTracks().forEach(
      track=>{
        peer.addTrack(track,localStream);
      }
    );

    peer.ontrack=e=>{

      if(e.streams && e.streams[0]){
        remoteVideo.srcObject=
          e.streams[0];
      }
    };

    if(type==="video"){
      localVideo.style.display="block";
      localVideo.srcObject=localStream;
    }else{
      localVideo.style.display="none";
    }

    await peer.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    await flushPendingCandidates(peer);

    const answer=
      await peer.createAnswer();

    await peer.setLocalDescription(answer);

    sendWS({
      type:"rtc_answer",
      to:from,
      answer
    });

  }catch{

    sendWS({
      type:"rtc_reject",
      to:from
    });

    closeCallUI();
  }
};

rejectCallBtn.onclick=()=>{

  if(incomingCaller){

    sendWS({
      type:"rtc_reject",
      to:incomingCaller
    });
  }

  incomingCall.style.display="none";

  incomingCaller=null;
  incomingOffer=null;
};

/* =========================================================
   Answer
========================================================= */

async function receiveAnswer(data){

  if(!peer)return;

  try{

    await peer.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    await flushPendingCandidates(peer);

  }catch{}
}

/* =========================================================
   ICE
========================================================= */

async function receiveCandidate(data){

  if(!data.candidate)return;

  if(peer){

    try{

      if(peer.remoteDescription){

        await peer.addIceCandidate(
          data.candidate
        );

      }else{

        pendingCandidates.push({
          pc:peer,
          candidate:data.candidate
        });

      }

    }catch{}
  }
}

/* =========================================================
   واجهة المكالمة
========================================================= */

function showCallUI(user,type){

  callPanel.style.display="flex";

  callInfo.textContent=
    (type==="video" ? "📹 " : "📞 ")+
    user;

  if(type==="video"){
    cameraBtn.style.display="block";
  }else{
    cameraBtn.style.display="none";
  }
}

function closeCallUI(){

  if(peer){

    try{
      peer.close();
    }catch{}

    peer=null;
  }

  if(localStream){

    localStream.getTracks().forEach(
      track=>track.stop()
    );

    localStream=null;
  }

  remoteVideo.srcObject=null;
  localVideo.srcObject=null;

  callPanel.style.display="none";

  currentCallUser=null;
  currentCallType=null;

  incomingCaller=null;
  incomingOffer=null;

  pendingCandidates=[];
}

hangupBtn.onclick=()=>{

  if(currentCallUser){

    sendWS({
      type:"rtc_hangup",
      to:currentCallUser
    });
  }

  closeCallUI();
};

muteBtn.onclick=()=>{

  if(!localStream)return;

  const tracks=
    localStream.getAudioTracks();

  if(!tracks.length)return;

  tracks[0].enabled=
    !tracks[0].enabled;

  muteBtn.textContent=
    tracks[0].enabled
      ? "🎙️"
      : "🔇";
};

cameraBtn.onclick=()=>{

  if(!localStream)return;

  const tracks=
    localStream.getVideoTracks();

  if(!tracks.length)return;

  tracks[0].enabled=
    !tracks[0].enabled;

  cameraBtn.textContent=
    tracks[0].enabled
      ? "📹"
      : "🚫";
};

audioCallBtn.onclick=()=>{
  startCall("audio");
};

videoCallBtn.onclick=()=>{
  startCall("video");
};

/* =========================================================
   إشعار
========================================================= */

function notifyMessage(from){

  try{

    if(
      "Notification" in window &&
      Notification.permission==="granted"
    ){
      new Notification(
        "رسالة من "+from
      );
    }

  }catch{}
}

/* =========================================================
   تسجيل الخروج
========================================================= */

document.getElementById("logoutBtn").onclick=async()=>{

  if(ws){

    try{
      ws.close();
    }catch{}

  }

  if(token){

    await api("/api/logout",{
      token
    });
  }

  closeCallUI();

  token="";
  currentUser="";
  selectedUser="";

  localStorage.removeItem("chatToken");
  localStorage.removeItem("chatUser");

  app.style.display="none";
  auth.style.display="block";

  usernameInput.value="";
  passwordInput.value="";

  showError("");
};

/* =========================================================
   أزرار الدخول
========================================================= */

document.getElementById("registerBtn").onclick=register;

document.getElementById("loginBtn").onclick=login;

sendBtn.onclick=sendMessage;

/* =========================================================
   استعادة الجلسة
========================================================= */

if(token && currentUser){

  openApp();
}

/* =========================================================
   طلب الإشعارات
========================================================= */

if(
  "Notification" in window &&
  Notification.permission==="default"
){

  try{
    Notification.requestPermission();
  }catch{}
}
</script>

</body>
</html>`;

/* =========================================================
   JSON
========================================================= */

function json(data,status=200){

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "content-type":
          "application/json;charset=UTF-8"
      }
    }
  );
}

/* =========================================================
   Base64
========================================================= */

function bytesToBase64(bytes){

  let binary="";

  for(const byte of bytes){
    binary+=String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(text){

  const binary=atob(text);

  const bytes=
    new Uint8Array(binary.length);

  for(let i=0;i<binary.length;i++){
    bytes[i]=binary.charCodeAt(i);
  }

  return bytes;
}

/* =========================================================
   تشفير كلمة السر
========================================================= */

async function hashPassword(
  password,
  saltBytes
){

  const key=
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const bits=
    await crypto.subtle.deriveBits(
      {
        name:"PBKDF2",
        salt:saltBytes,
        iterations:100000,
        hash:"SHA-256"
      },
      key,
      256
    );

  return new Uint8Array(bits);
}

function randomBytes(length){

  const bytes=
    new Uint8Array(length);

  crypto.getRandomValues(bytes);

  return bytes;
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

    const url=
      new URL(request.url);

    /* الصفحة */

    if(
      url.pathname==="/" &&
      request.method==="GET"
    ){

      return new Response(
        HTML,
        {
          headers:{
            "content-type":
              "text/html;charset=UTF-8"
          }
        }
      );
    }

    /* WebSocket */

    if(
      url.pathname==="/ws" &&
      request.headers
        .get("Upgrade")
        ?.toLowerCase()==="websocket"
    ){

      const token=
        url.searchParams.get("token");

      if(!token){
        return new Response(
          "Unauthorized",
          {status:401}
        );
      }

      const room=
        env.CHAT_ROOM.getByName("main");

      return room.fetch(
        new Request(
          new URL(
            "/websocket?token="+
            encodeURIComponent(token),
            request.url
          ),
          request
        )
      );
    }

    /* API */

    if(
      url.pathname==="/api/register" ||
      url.pathname==="/api/login" ||
      url.pathname==="/api/logout"
    ){

      const room=
        env.CHAT_ROOM.getByName("main");

      return room.fetch(request);
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

export class ChatRoom extends DurableObject {

  constructor(ctx,env){

    super(ctx,env);

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS accounts(
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions(
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    this.sessions=new Map();

    for(
      const ws of this.ctx.getWebSockets()
    ){

      const data=
        ws.deserializeAttachment();

      if(data?.username){

        this.sessions.set(
          ws,
          data
        );
      }
    }
  }

  /* =======================================================
     Fetch
  ======================================================= */

  async fetch(request){

    const url=
      new URL(request.url);

    if(url.pathname==="/api/register"){
      return this.register(request);
    }

    if(url.pathname==="/api/login"){
      return this.login(request);
    }

    if(url.pathname==="/api/logout"){
      return this.logout(request);
    }

    if(
      url.pathname==="/websocket" &&
      request.headers
        .get("Upgrade")
        ?.toLowerCase()==="websocket"
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

    let data;

    try{
      data=await request.json();
    }catch{
      return json(
        {error:"بيانات غير صحيحة"},
        400
      );
    }

    const username=
      String(data.username||"").trim();

    const password=
      String(data.password||"");

    if(
      !/^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/
        .test(username)
    ){

      return json(
        {
          error:
            "اسم المستخدم من 3 إلى 20 حرفًا أو رقمًا"
        },
        400
      );
    }

    if(password.length<6){

      return json(
        {
          error:
            "كلمة المرور لازم تكون 6 أحرف على الأقل"
        },
        400
      );
    }

    const existing=
      this.ctx.storage.sql
        .exec(
          "SELECT username FROM accounts WHERE username=?",
          username
        )
        .toArray();

    if(existing.length){

      return json(
        {
          error:
            "اسم المستخدم موجود بالفعل"
        },
        409
      );
    }

    const salt=
      randomBytes(16);

    const hash=
      await hashPassword(
        password,
        salt
      );

    this.ctx.storage.sql.exec(
      `
      INSERT INTO accounts(
        username,
        password_hash,
        salt,
        created_at
      )
      VALUES(?,?,?,?)
      `,
      username,
      bytesToBase64(hash),
      bytesToBase64(salt),
      Date.now()
    );

    return json({
      ok:true
    });
  }

  /* =======================================================
     Login
  ======================================================= */

  async login(request){

    let data;

    try{
      data=await request.json();
    }catch{
      return json(
        {error:"بيانات غير صحيحة"},
        400
      );
    }

    const username=
      String(data.username||"").trim();

    const password=
      String(data.password||"");

    const rows=
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            username,
            password_hash,
            salt
          FROM accounts
          WHERE username=?
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

    const account=rows[0];

    const salt=
      base64ToBytes(account.salt);

    const hash=
      await hashPassword(
        password,
        salt
      );

    if(
      bytesToBase64(hash)!==
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

    const token=
      randomToken();

    const expires=
      Date.now()+SESSION_TIME;

    this.ctx.storage.sql.exec(
      `
      INSERT INTO sessions(
        token,
        username,
        expires_at
      )
      VALUES(?,?,?)
      `,
      token,
      account.username,
      expires
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

    let data;

    try{
      data=await request.json();
    }catch{
      return json({ok:true});
    }

    const token=
      String(data.token||"");

    if(token){

      this.ctx.storage.sql.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );
    }

    return json({
      ok:true
    });
  }

  /* =======================================================
     Session
  ======================================================= */

  getUsernameFromToken(token){

    if(!token)return null;

    const rows=
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            username,
            expires_at
          FROM sessions
          WHERE token=?
          `,
          token
        )
        .toArray();

    if(!rows.length){
      return null;
    }

    const session=rows[0];

    if(
      Number(session.expires_at)<
      Date.now()
    ){

      this.ctx.storage.sql.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );

      return null;
    }

    return session.username;
  }

  /* =======================================================
     WebSocket
  ======================================================= */

  async openWebSocket(request){

    const url=
      new URL(request.url);

    const token=
      url.searchParams.get("token");

    const username=
      this.getUsernameFromToken(token);

    if(!username){

      return new Response(
        "Unauthorized",
        {status:401}
      );
    }

    const pair=
      new WebSocketPair();

    const client=pair[0];
    const server=pair[1];

    this.ctx.acceptWebSocket(server);

    const attachment={
      username
    };

    server.serializeAttachment(
      attachment
    );

    this.sessions.set(
      server,
      attachment
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
     WebSocket message
  ======================================================= */

  async webSocketMessage(
    ws,
    message
  ){

    const session=
      this.sessions.get(ws) ||
      ws.deserializeAttachment();

    if(!session?.username){
      return;
    }

    let data;

    try{
      data=JSON.parse(message);
    }catch{
      return;
    }

    /* المستخدمون */

    if(data.type==="get_users"){

      this.sendUsers(ws);

      return;
    }

    /* رسالة خاصة */

    if(data.type==="private_message"){

      await this.privateMessage(
        session.username,
        data
      );

      return;
    }

    /* سجل المحادثة */

    if(data.type==="history"){

      this.sendHistory(
        ws,
        session.username,
        String(data.with||"")
      );

      return;
    }

    /* typing */

    if(data.type==="typing"){

      const to=
        String(data.to||"");

      this.sendToUser(
        to,
        {
          type:"typing",
          from:session.username,
          typing:!!data.typing
        }
      );

      return;
    }

    /* =====================================================
       WebRTC مكالمات
    ===================================================== */

    if(
      data.type==="rtc_offer" ||
      data.type==="rtc_answer" ||
      data.type==="rtc_candidate" ||
      data.type==="rtc_reject" ||
      data.type==="rtc_hangup"
    ){

      const to=
        String(data.to||"");

      if(!to)return;

      this.sendToUser(
        to,
        {
          ...data,
          from:session.username
        }
      );

      return;
    }

    /* =====================================================
       WebRTC ملفات وصوت
    ===================================================== */

    if(
      data.type==="file_offer" ||
      data.type==="file_answer" ||
      data.type==="file_candidate" ||
      data.type==="file_reject" ||
      data.type==="file_start" ||
      data.type==="file_end"
    ){

      const to=
        String(data.to||"");

      if(!to)return;

      this.sendToUser(
        to,
        {
          ...data,
          from:session.username
        }
      );

      return;
    }
  }

  /* =======================================================
     رسالة خاصة
  ======================================================= */

  async privateMessage(
    sender,
    data
  ){

    const receiver=
      String(data.to||"").trim();

    const text=
      String(data.text||"")
        .trim()
        .slice(0,MAX_MESSAGE);

    if(!receiver || !text){
      return;
    }

    if(receiver===sender){
      return;
    }

    const exists=
      this.ctx.storage.sql
        .exec(
          "SELECT username FROM accounts WHERE username=?",
          receiver
        )
        .toArray();

    if(!exists.length){

      this.sendToUser(
        sender,
        {
          type:"error",
          message:
            "المستخدم غير موجود"
        }
      );

      return;
    }

    const created_at=
      Date.now();

    this.ctx.storage.sql.exec(
      `
      INSERT INTO messages(
        sender,
        receiver,
        text,
        created_at
      )
      VALUES(?,?,?,?)
      `,
      sender,
      receiver,
      text,
      created_at
    );

    const msg={
      type:"private_message",
      from:sender,
      to:receiver,
      text,
      created_at
    };

    /* المرسل */

    this.sendToUser(
      sender,
      msg
    );

    /* المستقبل */

    if(receiver!==sender){

      this.sendToUser(
        receiver,
        msg
      );
    }
  }

  /* =======================================================
     History
  ======================================================= */

  sendHistory(
    ws,
    username,
    other
  ){

    if(!other){
      return;
    }

    const rows=
      this.ctx.storage.sql
        .exec(
          `
          SELECT
            id,
            sender,
            receiver,
            text,
            created_at
          FROM messages
          WHERE
            (
              sender=? AND receiver=?
            )
            OR
            (
              sender=? AND receiver=?
            )
          ORDER BY id ASC
          LIMIT 500
          `,
          username,
          other,
          other,
          username
        )
        .toArray();

    const messages=
      rows.map(row=>({
        id:row.id,
        from:row.sender,
        to:row.receiver,
        text:row.text,
        created_at:row.created_at
      }));

    try{

      ws.send(
        JSON.stringify({
          type:"history",
          with:other,
          messages
        })
      );

    }catch{}
  }

  /* =======================================================
     Send to user
  ======================================================= */

  sendToUser(
    username,
    data
  ){

    for(
      const [ws,session]
      of this.sessions.entries()
    ){

      if(
        session?.username===
        username
      ){

        try{

          ws.send(
            JSON.stringify(data)
          );

        }catch{}
      }
    }
  }

  /* =======================================================
     Users
  ======================================================= */

  sendUsers(ws){

    const users=
      this.getOnlineUsers();

    try{

      ws.send(
        JSON.stringify({
          type:"users",
          users
        })
      );

    }catch{}
  }

  getOnlineUsers(){

    return [
      ...new Set(
        [...this.sessions.values()]
          .map(x=>x.username)
          .filter(Boolean)
      )
    ];
  }

  broadcastUsers(){

    const users=
      this.getOnlineUsers();

    const message=
      JSON.stringify({
        type:"users",
        users
      });

    for(
      const ws of this.ctx.getWebSockets()
    ){

      try{
        ws.send(message);
      }catch{}
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

    this.sessions.delete(ws);

    this.broadcastUsers();

    try{
      ws.close(code,reason);
    }catch{}
  }

  async webSocketError(ws){

    this.sessions.delete(ws);

    this.broadcastUsers();
  }
}
