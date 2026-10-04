import { DurableObject } from "cloudflare:workers";

/* =========================================================
   SETTINGS
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
 transition:.2s;
}

body.dark{
 background:#111b21;
 color:#eee;
}

button,input{
 font-family:inherit;
}

button{
 border:0;
 border-radius:10px;
 padding:10px 14px;
 background:#128c7e;
 color:#fff;
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
 background:#fff;
 color:#222;
}

body.dark input{
 background:#202c33;
 color:#fff;
 border-color:#445;
}

.auth{
 width:min(420px,92%);
 margin:60px auto;
 background:#fff;
 padding:25px;
 border-radius:18px;
 box-shadow:0 5px 25px #0002;
}

body.dark .auth{
 background:#202c33;
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
 width:290px;
 background:#f4f4f4;
 border-left:1px solid #ccc;
 overflow:auto;
}

body.dark .sidebar{
 background:#202c33;
 border-color:#334;
}

.sideHead{
 background:#075e54;
 color:white;
 padding:12px;
 font-size:18px;
 font-weight:bold;
 display:flex;
 justify-content:space-between;
 align-items:center;
 gap:5px;
}

.sideBtns{
 display:flex;
 gap:4px;
}

.sideBtns button{
 background:#ffffff22;
 padding:7px 9px;
}

#users{
 padding:8px;
}

.user{
 background:white;
 padding:11px;
 margin:6px 0;
 border-radius:12px;
 cursor:pointer;
 display:flex;
 align-items:center;
 gap:9px;
 border:1px solid #eee;
}

body.dark .user{
 background:#182229;
 border-color:#334;
}

.user:hover{
 background:#e9f5f3;
}

body.dark .user:hover{
 background:#26343d;
}

.user.selected{
 background:#d8eee9;
}

body.dark .user.selected{
 background:#174b45;
}

.avatar{
 width:38px;
 height:38px;
 border-radius:50%;
 background:#128c7e;
 color:white;
 display:flex;
 align-items:center;
 justify-content:center;
 font-weight:bold;
 flex:none;
}

.userInfo{
 min-width:0;
 flex:1;
}

.userName{
 font-weight:bold;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
}

.userStatus{
 font-size:11px;
 color:#777;
 margin-top:3px;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
}

body.dark .userStatus{
 color:#aaa;
}

.dot{
 width:9px;
 height:9px;
 border-radius:50%;
 display:inline-block;
 background:#aaa;
 flex:none;
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

#chatStatus{
 font-size:12px;
 opacity:.9;
 margin-top:3px;
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

body.dark .msg{
 background:#202c33;
}

.msg.mine{
 margin-right:auto;
 background:#d9ffc9;
 color:#222;
}

body.dark .msg.mine{
 background:#005c4b;
 color:#fff;
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

body.dark .msgName{
 color:#7ee2d3;
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

body.dark #bar{
 background:#202c33;
 border-color:#334;
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

.modal{
 display:none;
 position:fixed;
 inset:0;
 background:#0008;
 z-index:100;
 align-items:center;
 justify-content:center;
 padding:15px;
}

.modalBox{
 width:min(440px,100%);
 max-height:90vh;
 overflow:auto;
 background:white;
 border-radius:18px;
 padding:20px;
 box-shadow:0 10px 40px #0006;
}

body.dark .modalBox{
 background:#202c33;
 color:#fff;
}

.modalBox h2{
 margin-top:0;
}

.modalBox input{
 width:100%;
 margin:6px 0 10px;
}

.settingRow{
 margin:12px 0;
}

.settingRow label{
 display:block;
 margin-bottom:5px;
 font-weight:bold;
}

.modalActions{
 display:flex;
 gap:8px;
 margin-top:15px;
}

.modalActions button{
 flex:1;
}

.danger{
 background:#c62828;
}

.profile{
 text-align:center;
}

.profileAvatar{
 width:75px;
 height:75px;
 border-radius:50%;
 background:#128c7e;
 color:#fff;
 display:flex;
 align-items:center;
 justify-content:center;
 font-size:30px;
 font-weight:bold;
 margin:0 auto 10px;
}

#incomingCall{
 display:none;
 position:fixed;
 left:15px;
 right:15px;
 bottom:20px;
 z-index:200;
 background:white;
 padding:18px;
 border-radius:16px;
 box-shadow:0 5px 30px #0005;
 text-align:center;
}

body.dark #incomingCall{
 background:#202c33;
 color:#fff;
}

#incomingCall button{
 margin:5px;
}

#callPanel{
 display:none;
 position:fixed;
 inset:0;
 z-index:300;
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
 .sidebar{width:155px}
 .msg{max-width:88%}
 .callButtons button{padding:7px}
}

@media(max-width:450px){
 .sidebar{width:125px}
 .sideHead{font-size:14px}
 .user{padding:8px}
 .avatar{width:30px;height:30px}
 .userStatus{display:none}
}
</style>
</head>

<body>

<div id="auth">
 <div class="auth">
  <h1>💬 دردشة 🔥</h1>
  <input id="username" placeholder="اسم المستخدم" autocomplete="username">
  <input id="password" type="password" placeholder="كلمة المرور" autocomplete="current-password">
  <button id="registerBtn">🔥 إنشاء حساب</button>
  <button id="loginBtn">🚀 تسجيل الدخول</button>
  <div id="error"></div>
 </div>
</div>

<div id="app">

 <div class="layout">

  <aside class="sidebar">

   <div class="sideHead">
    <span>👥 المستخدمون</span>

    <div class="sideBtns">
     <button id="profileBtn" title="الملف الشخصي">👤</button>
     <button id="settingsBtn" title="الإعدادات">⚙️</button>
     <button id="logoutBtn" title="خروج">🚪</button>
    </div>
   </div>

   <div id="users"></div>

  </aside>

  <main class="chat">

   <div class="chatHead">

    <div>
     <div id="chatTitle" class="chatUser">اختر مستخدمًا</div>
     <div id="chatStatus">—</div>
    </div>

    <div class="callButtons">
     <button id="audioCallBtn">📞</button>
     <button id="videoCallBtn">📹</button>
    </div>

   </div>

   <div id="messages">
    <div class="empty">🔥 اختر مستخدمًا لبدء محادثة خاصة</div>
   </div>

   <div id="typing"></div>

   <div id="bar">

    <label for="fileInput"
      class="iconBtn"
      style="background:#128c7e;color:white;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer">
      📎
    </label>

    <input id="fileInput" type="file">

    <button id="recordBtn" class="iconBtn">🎙️</button>

    <input id="messageInput" placeholder="اكتب رسالة..." autocomplete="off">

    <button id="sendBtn" class="iconBtn">➤</button>

   </div>

  </main>

 </div>
</div>

<!-- SETTINGS -->

<div id="settingsModal" class="modal">

 <div class="modalBox">

  <h2>⚙️ الإعدادات</h2>

  <div class="settingRow">
   <label>👤 اسم العرض</label>
   <input id="displayNameInput" placeholder="اسمك الظاهر للناس">
  </div>

  <div class="settingRow">
   <label>💬 الحالة</label>
   <input id="statusInput" maxlength="100" placeholder="مثلاً: متاح للدردشة 🔥">
  </div>

  <div class="settingRow">
   <label>
    <input id="darkModeInput" type="checkbox" style="width:auto">
    🌙 الوضع الداكن
   </label>
  </div>

  <div class="modalActions">
   <button id="saveSettingsBtn">💾 حفظ</button>
   <button id="closeSettingsBtn">إغلاق</button>
  </div>

  <hr style="margin:20px 0">

  <h3>🗑️ إغلاق الحساب نهائيًا</h3>

  <p style="color:#c62828">
   ⚠️ سيتم حذف الحساب والجلسات والرسائل نهائيًا ولا يمكن التراجع.
  </p>

  <input
    id="deletePassword"
    type="password"
    placeholder="كلمة المرور الحالية"
  >

  <input
    id="deleteConfirm"
    placeholder="اكتب: حذف نهائي"
  >

  <button id="deleteAccountBtn" class="danger">
   🗑️ حذف الحساب نهائيًا
  </button>

 </div>
</div>

<!-- PROFILE -->

<div id="profileModal" class="modal">

 <div class="modalBox profile">

  <div id="profileAvatar" class="profileAvatar">👤</div>

  <h2 id="profileName">—</h2>

  <p id="profileUsername">—</p>

  <p id="profileStatus">—</p>

  <button id="closeProfileBtn">إغلاق</button>

 </div>
</div>

<!-- INCOMING CALL -->

<div id="incomingCall">

 <div id="incomingText">📞 مكالمة واردة</div>

 <button id="acceptCallBtn">قبول</button>

 <button id="rejectCallBtn" style="background:#c62828">
  رفض
 </button>

</div>

<!-- CALL -->

<div id="callPanel">

 <video id="remoteVideo" autoplay playsinline></video>

 <video id="localVideo" autoplay muted playsinline></video>

 <div id="callInfo" class="callInfo">مكالمة</div>

 <div class="callControls">

  <button id="muteBtn">🎙️</button>

  <button id="cameraBtn">📹</button>

  <button id="hangupBtn">☎</button>

 </div>

</div>

<script>
/* =========================================================
 STATE
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

const settingsModal=document.getElementById("settingsModal");
const profileModal=document.getElementById("profileModal");

const displayNameInput=document.getElementById("displayNameInput");
const statusInput=document.getElementById("statusInput");
const darkModeInput=document.getElementById("darkModeInput");

const deletePassword=document.getElementById("deletePassword");
const deleteConfirm=document.getElementById("deleteConfirm");

const profileName=document.getElementById("profileName");
const profileUsername=document.getElementById("profileUsername");
const profileStatus=document.getElementById("profileStatus");
const profileAvatar=document.getElementById("profileAvatar");

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

let token=localStorage.getItem("chatToken")||"";
let currentUser=localStorage.getItem("chatUser")||"";

let selectedUser="";
let ws=null;
let reconnectTimer=null;
let typingTimer=null;

let usersData=[];
let onlineUsers=new Set();

let profile={
 username:"",
 display_name:"",
 status_text:"",
 dark_mode:0
};

/* =========================================================
 RTC
========================================================= */

let peer=null;
let localStream=null;

let incomingOffer=null;
let incomingCaller=null;
let incomingCallType=null;

let currentCallUser=null;
let currentCallType=null;

let pendingCandidates=[];

/* =========================================================
 FILE / VOICE
========================================================= */

let fileTransfer={
 send:null,
 receive:null
};

let mediaRecorder=null;
let audioChunks=[];

/* =========================================================
 HELPERS
========================================================= */

function showError(text){
 errorBox.textContent=text||"";
}

function sendWS(data){
 if(!ws||ws.readyState!==WebSocket.OPEN)return false;
 ws.send(JSON.stringify(data));
 return true;
}

function formatTime(t){
 return new Date(t||Date.now()).toLocaleTimeString("ar-EG",{
  hour:"2-digit",
  minute:"2-digit"
 });
}

function formatSize(size){
 if(size<1024)return size+" B";
 if(size<1024*1024)return(size/1024).toFixed(1)+" KB";
 return(size/1024/1024).toFixed(2)+" MB";
}

async function api(path,body){
 const r=await fetch(path,{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify(body)
 });

 const data=await r.json().catch(()=>({}));

 return{ok:r.ok,data};
}

function applyDarkMode(){
 document.body.classList.toggle("dark",!!profile.dark_mode);
}

function avatarLetter(name){
 return String(name||"?").trim().charAt(0).toUpperCase()||"👤";
}

/* =========================================================
 AUTH
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

 const r=await api("/api/register",{username,password});

 if(!r.ok){
  showError(r.data.error||"تعذر إنشاء الحساب");
  return;
 }

 const loginResult=await api("/api/login",{username,password});

 if(!loginResult.ok){
  showError("تم إنشاء الحساب لكن تعذر تسجيل الدخول");
  return;
 }

 token=loginResult.data.token;
 currentUser=loginResult.data.username;

 localStorage.setItem("chatToken",token);
 localStorage.setItem("chatUser",currentUser);

 openApp();
}

async function login(){

 const username=usernameInput.value.trim();
 const password=passwordInput.value;

 showError("");

 if(!username||!password){
  showError("اكتب اسم المستخدم وكلمة المرور");
  return;
 }

 const r=await api("/api/login",{username,password});

 if(!r.ok){
  showError(r.data.error||"بيانات الدخول غير صحيحة");
  return;
 }

 token=r.data.token;
 currentUser=r.data.username;

 localStorage.setItem("chatToken",token);
 localStorage.setItem("chatUser",currentUser);

 openApp();
}

function openApp(){

 auth.style.display="none";
 app.style.display="block";

 connectWebSocket();
}

/* =========================================================
 WEBSOCKET
========================================================= */

function connectWebSocket(){

 if(!token)return;

 if(ws){
  try{ws.close()}catch{}
 }

 const protocol=
  location.protocol==="https:"?"wss://":"ws://";

 ws=new WebSocket(
  protocol+
  location.host+
  "/ws?token="+
  encodeURIComponent(token)
 );

 ws.onopen=()=>{

  clearTimeout(reconnectTimer);

  messageInput.focus();

  sendWS({type:"get_users"});
  sendWS({type:"get_profile"});
 };

 ws.onmessage=e=>{

  let d;

  try{
   d=JSON.parse(e.data);
  }catch{
   return;
  }

  handleWS(d);
 };

 ws.onclose=()=>{

  if(token){

   clearTimeout(reconnectTimer);

   reconnectTimer=setTimeout(
    connectWebSocket,
    2000
   );
  }
 };
}

function handleWS(data){

 if(data.type==="users"){

  usersData=data.users||[];

  onlineUsers=new Set(
   usersData
    .filter(x=>x.online)
    .map(x=>x.username)
  );

  renderUsers(usersData);
  updateSelectedStatus();

  return;
 }

 if(data.type==="profile"){

  profile=data.profile||profile;

  displayNameInput.value=
   profile.display_name||"";

  statusInput.value=
   profile.status_text||"";

  darkModeInput.checked=
   !!profile.dark_mode;

  applyDarkMode();
  updateProfileUI();

  return;
 }

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

 if(data.type==="history"){

  renderHistory(data.messages||[]);
  return;
 }

 if(data.type==="typing"){

  if(data.from===selectedUser){

   typingBox.textContent=
    data.typing
     ? data.from+" يكتب..."
     : "";
  }

  return;
 }

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
  alert(data.message||"حدث خطأ");
 }
}

/* =========================================================
 USERS
========================================================= */

function renderUsers(list){

 usersBox.innerHTML="";

 const users=list
  .filter(x=>x.username!==currentUser)
  .sort((a,b)=>
   String(a.display_name||a.username)
    .localeCompare(
     String(b.display_name||b.username),
     "ar"
    )
  );

 if(!users.length){

  const e=document.createElement("div");

  e.style.padding="15px";
  e.style.color="#777";
  e.textContent="لا يوجد مستخدمون آخرون 👥";

  usersBox.appendChild(e);

  return;
 }

 users.forEach(user=>{

  const el=document.createElement("div");

  el.className=
   "user"+
   (user.username===selectedUser
    ?" selected":"");

  const avatar=document.createElement("div");

  avatar.className="avatar";
  avatar.textContent=
   avatarLetter(
    user.display_name||user.username
   );

  const info=document.createElement("div");

  info.className="userInfo";

  const name=document.createElement("div");

  name.className="userName";

  name.textContent=
   user.display_name||user.username;

  const status=document.createElement("div");

  status.className="userStatus";

  status.textContent=
   user.online
    ? "🟢 متصل الآن"
    : (
      user.status_text||
      "⚪ غير متصل"
     );

  const dot=document.createElement("span");

  dot.className=
   "dot"+
   (user.online?" online":"");

  info.append(name,status);

  el.append(dot,avatar,info);

  el.onclick=()=>{
   selectUser(user.username);
  };

  usersBox.appendChild(el);
 });
}

function selectUser(user){

 if(!user||user===currentUser)return;

 selectedUser=user;

 const info=
  usersData.find(x=>x.username===user);

 chatTitle.textContent=
  info?.display_name||user;

 updateSelectedStatus();

 messages.innerHTML=
  '<div class="empty">جاري تحميل المحادثة... 🔥</div>';

 sendWS({
  type:"history",
  with:user
 });

 renderUsers(usersData);
}

function updateSelectedStatus(){

 if(!selectedUser){
  chatStatus.textContent="—";
  return;
 }

 const info=
  usersData.find(x=>x.username===selectedUser);

 chatStatus.textContent=
  info?.online
   ? "🟢 متصل الآن"
   : "⚪ غير متصل";
}

/* =========================================================
 PROFILE
========================================================= */

function updateProfileUI(){

 const name=
  profile.display_name||
  currentUser;

 profileName.textContent=name;

 profileUsername.textContent=
  "@"+currentUser;

 profileStatus.textContent=
  profile.status_text||
  "لا توجد حالة";

 profileAvatar.textContent=
  avatarLetter(name);
}

document.getElementById("profileBtn").onclick=()=>{

 updateProfileUI();

 profileModal.style.display="flex";
};

document.getElementById("closeProfileBtn").onclick=()=>{
 profileModal.style.display="none";
};

/* =========================================================
 SETTINGS
========================================================= */

document.getElementById("settingsBtn").onclick=()=>{

 displayNameInput.value=
  profile.display_name||"";

 statusInput.value=
  profile.status_text||"";

 darkModeInput.checked=
  !!profile.dark_mode;

 settingsModal.style.display="flex";
};

document.getElementById("closeSettingsBtn").onclick=()=>{
 settingsModal.style.display="none";
};

darkModeInput.onchange=()=>{
 profile.dark_mode=
  darkModeInput.checked?1:0;

 applyDarkMode();
};

document.getElementById("saveSettingsBtn").onclick=()=>{

 const display_name=
  displayNameInput.value.trim().slice(0,40);

 const status_text=
  statusInput.value.trim().slice(0,100);

 const dark_mode=
  darkModeInput.checked?1:0;

 if(!sendWS({
  type:"update_profile",
  display_name,
  status_text,
  dark_mode
 })){
  alert("الاتصال غير متاح");
  return;
 }

 settingsModal.style.display="none";
};

/* =========================================================
 DELETE ACCOUNT
========================================================= */

document.getElementById("deleteAccountBtn").onclick=async()=>{

 const password=
  deletePassword.value;

 const confirmText=
  deleteConfirm.value.trim();

 if(!password){
  alert("اكتب كلمة المرور الحالية");
  return;
 }

 if(confirmText!=="حذف نهائي"){
  alert('اكتب "حذف نهائي" للتأكيد');
  return;
 }

 if(
  !confirm(
   "⚠️ سيتم حذف الحساب وكل الرسائل نهائيًا. هل أنت متأكد؟"
  )
 ){
  return;
 }

 const r=await api(
  "/api/delete-account",
  {
   token,
   password,
   confirm:confirmText
  }
 );

 if(!r.ok){
  alert(r.data.error||"تعذر حذف الحساب");
  return;
 }

 alert("تم حذف الحساب نهائيًا 🗑️");

 location.reload();
};

/* =========================================================
 MESSAGES
========================================================= */

function renderHistory(list){

 messages.innerHTML="";

 if(!list.length){

  messages.innerHTML=
   '<div class="empty">لا توجد رسائل بعد 💬</div>';

  return;
 }

 list.forEach(x=>{
  addTextMessage(x,false);
 });

 messages.scrollTop=messages.scrollHeight;
}

function addTextMessage(data,scroll=true){

 if(
  data.from!==currentUser &&
  data.from!==selectedUser
 )return;

 if(
  data.to!==currentUser &&
  data.to!==selectedUser
 )return;

 const box=document.createElement("div");

 box.className=
  "msg "+
  (data.from===currentUser
   ?"mine":"theirs");

 const name=document.createElement("div");

 name.className="msgName";

 name.textContent=
  data.from===currentUser
   ?"أنت"
   :data.from;

 const text=document.createElement("div");

 text.textContent=data.text||"";

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

 const text=
  messageInput.value.trim();

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
}

sendBtn.onclick=sendMessage;

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

 if(e.key==="Enter"&&!e.shiftKey){

  e.preventDefault();
  sendMessage();
 }
});

/* =========================================================
 FILE 20MB
========================================================= */

fileInput.onchange=async()=>{

 const file=fileInput.files?.[0];

 fileInput.value="";

 if(!file)return;

 if(!selectedUser){
  alert("اختر مستخدمًا أولًا");
  return;
 }

 if(file.size>20*1024*1024){
  alert("الحد الأقصى للملف هو 20MB");
  return;
 }

 await sendFile(file);
};

function createDataPeer(target,onIce){

 const pc=new RTCPeerConnection({
  iceServers:[
   {urls:"stun:stun.l.google.com:19302"},
   {urls:"stun:stun.cloudflare.com:3478"}
  ]
 });

 pc.onicecandidate=e=>{

  if(e.candidate){

   sendWS({
    type:"file_candidate",
    to:target,
    candidate:e.candidate
   });
  }
 };

 return pc;
}

async function sendFile(file){

 const id=crypto.randomUUID();

 const pc=createDataPeer(
  selectedUser
 );

 const channel=
  pc.createDataChannel("file");

 fileTransfer.send={
  id,
  file,
  pc,
  channel,
  target:selectedUser
 };

 channel.binaryType="arraybuffer";

 const offer=
  await pc.createOffer();

 await pc.setLocalDescription(offer);

 sendWS({
  type:"file_offer",
  to:selectedUser,
  id,
  name:file.name,
  size:file.size,
  mime:file.type||"application/octet-stream",
  offer,
  voice:false
 });

 channel.onopen=async()=>{

  sendWS({
   type:"file_start",
   to:selectedUser,
   id
  });

  const buffer=
   await file.arrayBuffer();

  const chunkSize=64*1024;

  for(
   let offset=0;
   offset<buffer.byteLength;
   offset+=chunkSize
  ){

   while(channel.bufferedAmount>4*1024*1024){
    await new Promise(r=>setTimeout(r,50));
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

async function receiveFileOffer(data){

 const text=
  data.voice
   ?"🎙️ رسالة صوتية من "
   :"📎 ملف من ";

 const ok=confirm(
  text+
  data.from+
  "\\n\\n"+
  (data.voice
   ?"رسالة صوتية"
   :data.name+
    "\\nالحجم: "+
    formatSize(data.size))
 );

 if(!ok){

  sendWS({
   type:"file_reject",
   to:data.from,
   id:data.id
  });

  return;
 }

 const pc=createDataPeer(
  data.from
 );

 fileTransfer.receive={
  id:data.id,
  from:data.from,
  name:data.name,
  size:Number(data.size),
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

   if(!t||t.id!==data.id)return;

   t.chunks.push(ev.data);

   t.bytes+=
    ev.data.byteLength||
    ev.data.size||
    0;
  };
 };

 pc.setRemoteDescription(
  new RTCSessionDescription(data.offer)
 )
 .then(async()=>{

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

 if(!t||t.id!==data.id)return;

 try{

  await t.pc.setRemoteDescription(
   new RTCSessionDescription(data.answer)
  );

 }catch{}
}

async function receiveFileCandidate(data){

 const pcs=[];

 if(
  fileTransfer.send&&
  fileTransfer.send.id===data.id
 ){
  pcs.push(fileTransfer.send.pc);
 }

 if(
  fileTransfer.receive&&
  fileTransfer.receive.id===data.id
 ){
  pcs.push(fileTransfer.receive.pc);
 }

 for(const pc of pcs){

  try{

   if(pc.remoteDescription){
    await pc.addIceCandidate(
     data.candidate
    );
   }

  }catch{}
 }
}

function receiveFileStart(){}

function receiveFileEnd(data){

 const t=fileTransfer.receive;

 if(!t||t.id!==data.id)return;

 if(t.bytes!==t.size){

  alert(
   "لم يكتمل استقبال الملف.\\n"+
   formatSize(t.bytes)+
   " من "+
   formatSize(t.size)
  );

  return;
 }

 const blob=new Blob(
  t.chunks,
  {type:t.mime||"application/octet-stream"}
 );

 if(t.voice){

  addVoiceMessage(
   t.from,
   blob,
   false
  );

 }else{

  const url=
   URL.createObjectURL(blob);

  addFileMessage(
   t.from,
   t.name,
   url,
   false
  );
 }

 try{t.pc.close()}catch{}

 fileTransfer.receive=null;
}

function addFileMessage(
 from,
 name,
 url,
 mine
){

 const box=document.createElement("div");

 box.className=
  "msg "+
  (mine?"mine":"theirs");

 const title=document.createElement("div");

 title.className="msgName";

 title.textContent=
  mine?"أنت":from;

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

  small.textContent="تم إرسال الملف مباشرة 🔥";
  small.style.color="#777";

  content.appendChild(small);
 }

 box.append(title,content);

 messages.appendChild(box);

 messages.scrollTop=messages.scrollHeight;
}

/* =========================================================
 VOICE
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

  for(const x of[
   "audio/webm;codecs=opus",
   "audio/webm",
   "audio/ogg;codecs=opus"
  ]){

   if(
    MediaRecorder.isTypeSupported&&
    MediaRecorder.isTypeSupported(x)
   ){
    mime=x;
    break;
   }
  }

  mediaRecorder=
   mime
    ?new MediaRecorder(stream,{mimeType:mime})
    :new MediaRecorder(stream);

  mediaRecorder.ondataavailable=e=>{

   if(e.data?.size){
    audioChunks.push(e.data);
   }
  };

  mediaRecorder.onstop=async()=>{

   stream.getTracks().forEach(
    t=>t.stop()
   );

   const blob=new Blob(
    audioChunks,
    {
     type:
      mediaRecorder.mimeType||
      "audio/webm"
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

 if(!selectedUser)return;

 const id=crypto.randomUUID();

 const pc=createDataPeer(
  selectedUser
 );

 const channel=
  pc.createDataChannel("voice");

 fileTransfer.send={
  id,
  file:blob,
  pc,
  channel,
  target:selectedUser
 };

 channel.binaryType="arraybuffer";

 const offer=
  await pc.createOffer();

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

  const buffer=
   await blob.arrayBuffer();

  const chunkSize=64*1024;

  for(
   let offset=0;
   offset<buffer.byteLength;
   offset+=chunkSize
  ){

   while(channel.bufferedAmount>4*1024*1024){
    await new Promise(r=>setTimeout(r,50));
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

  addVoiceMessage(
   currentUser,
   blob,
   true
  );
 };
}

function addVoiceMessage(from,blob,mine){

 const url=
  URL.createObjectURL(blob);

 const box=document.createElement("div");

 box.className=
  "msg "+
  (mine?"mine":"theirs");

 const name=document.createElement("div");

 name.className="msgName";

 name.textContent=
  mine?"أنت 🎙️":from+" 🎙️";

 const audio=document.createElement("audio");

 audio.className="audioMsg";
 audio.controls=true;
 audio.src=url;

 box.append(name,audio);

 messages.appendChild(box);

 messages.scrollTop=messages.scrollHeight;
}

/* =========================================================
 CALLS
========================================================= */

function createCallPeer(target){

 const pc=new RTCPeerConnection({
  iceServers:[
   {urls:"stun:stun.l.google.com:19302"},
   {urls:"stun:stun.cloudflare.com:3478"}
  ]
 });

 pc.onicecandidate=e=>{

  if(e.candidate){

   sendWS({
    type:"rtc_candidate",
    to:target,
    candidate:e.candidate
   });
  }
 };

 pc.ontrack=e=>{

  if(e.streams?.[0]){
   remoteVideo.srcObject=e.streams[0];
  }
 };

 return pc;
}

async function startCall(type){

 if(!selectedUser){
  alert("اختر المستخدم أولًا");
  return;
 }

 if(currentCallUser||incomingCaller)return;

 currentCallUser=selectedUser;
 currentCallType=type;

 try{

  localStream=
   await navigator.mediaDevices.getUserMedia({
    audio:true,
    video:type==="video"
   });

  showCallUI(
   selectedUser,
   type
  );

  peer=createCallPeer(selectedUser);

  localStream.getTracks().forEach(
   t=>peer.addTrack(t,localStream)
  );

  if(type==="video"){
   localVideo.style.display="block";
   localVideo.srcObject=localStream;
  }else{
   localVideo.style.display="none";
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

  alert("تعذر تشغيل الكاميرا أو الميكروفون");
  closeCallUI();
 }
}

function receiveOffer(data){

 if(currentCallUser||incomingCaller){

  sendWS({
   type:"rtc_reject",
   to:data.from
  });

  return;
 }

 incomingOffer=data.offer;
 incomingCaller=data.from;
 incomingCallType=data.callType||"audio";

 incomingText.textContent=
  incomingCallType==="video"
   ?"📹 مكالمة فيديو من "+data.from
   :"📞 مكالمة صوتية من "+data.from;

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

  peer=createCallPeer(from);

  localStream.getTracks().forEach(
   t=>peer.addTrack(t,localStream)
  );

  if(type==="video"){
   localVideo.style.display="block";
   localVideo.srcObject=localStream;
  }else{
   localVideo.style.display="none";
  }

  await peer.setRemoteDescription(
   new RTCSessionDescription(offer)
  );

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

async function receiveAnswer(data){

 if(!peer)return;

 try{

  await peer.setRemoteDescription(
   new RTCSessionDescription(data.answer)
  );

 }catch{}
}

async function receiveCandidate(data){

 if(!peer||!data.candidate)return;

 try{

  if(peer.remoteDescription){

   await peer.addIceCandidate(
    data.candidate
   );
  }else{

   pendingCandidates.push(data.candidate);
  }

 }catch{}
}

function showCallUI(user,type){

 callPanel.style.display="flex";

 callInfo.textContent=
  (type==="video"?"📹 ":"📞 ")+user;

 cameraBtn.style.display=
  type==="video"?"block":"none";
}

function closeCallUI(){

 if(peer){
  try{peer.close()}catch{}
  peer=null;
 }

 if(localStream){

  localStream.getTracks().forEach(
   t=>t.stop()
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
  tracks[0].enabled?"🎙️":"🔇";
};

cameraBtn.onclick=()=>{

 if(!localStream)return;

 const tracks=
  localStream.getVideoTracks();

 if(!tracks.length)return;

 tracks[0].enabled=
  !tracks[0].enabled;

 cameraBtn.textContent=
  tracks[0].enabled?"📹":"🚫";
};

audioCallBtn.onclick=()=>{
 startCall("audio");
};

videoCallBtn.onclick=()=>{
 startCall("video");
};

/* =========================================================
 NOTIFICATION
========================================================= */

function notifyMessage(from){

 try{

  if(
   "Notification" in window&&
   Notification.permission==="granted"
  ){
   new Notification(
    "رسالة من "+from
   );
  }

 }catch{}
}

/* =========================================================
 LOGOUT
========================================================= */

document.getElementById("logoutBtn").onclick=async()=>{

 clearTimeout(reconnectTimer);

 closeCallUI();

 if(ws){
  try{ws.close()}catch{}
 }

 if(token){
  await api("/api/logout",{token});
 }

 token="";
 currentUser="";
 selectedUser="";

 localStorage.removeItem("chatToken");
 localStorage.removeItem("chatUser");

 app.style.display="none";
 auth.style.display="block";

 usernameInput.value="";
 passwordInput.value="";

 messages.innerHTML="";
 usersBox.innerHTML="";
};

/* =========================================================
 BUTTONS
========================================================= */

document.getElementById("registerBtn").onclick=register;
document.getElementById("loginBtn").onclick=login;

if(token&&currentUser){
 openApp();
}

if(
 "Notification" in window&&
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
 PASSWORD
========================================================= */

function bytesToBase64(bytes){

 let binary="";

 for(const b of bytes){
  binary+=String.fromCharCode(b);
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
 WORKER
========================================================= */

export default {

 async fetch(request,env){

  const url=
   new URL(request.url);

  if(
   url.pathname==="/"&&
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

  if(
   url.pathname==="/ws"&&
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

  if([
   "/api/register",
   "/api/login",
   "/api/logout",
   "/api/delete-account"
  ].includes(url.pathname)){

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
 DURABLE OBJECT
========================================================= */

export class ChatRoom extends DurableObject {

 constructor(ctx,env){

  super(ctx,env);

  this.ctx=ctx;
  this.env=env;

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
    created_at INTEGER NOT NULL DEFAULT 0,
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

  this.ensureSchema();

  this.sessions=new Map();

  for(
   const ws of this.ctx.getWebSockets()
  ){

   try{

    const d=
     ws.deserializeAttachment();

    if(d?.username){
     this.sessions.set(ws,d);
    }

   }catch{}
  }
 }

 /* =======================================================
    SCHEMA REPAIR
 ======================================================= */

 ensureSchema(){

  const cols=
   this.ctx.storage.sql
    .exec("PRAGMA table_info(accounts)")
    .toArray();

  const names=
   new Set(cols.map(x=>x.name));

  if(!names.has("display_name")){

   this.ctx.storage.sql.exec(
    "ALTER TABLE accounts ADD COLUMN display_name TEXT NOT NULL DEFAULT ''"
   );
  }

  if(!names.has("status_text")){

   this.ctx.storage.sql.exec(
    "ALTER TABLE accounts ADD COLUMN status_text TEXT NOT NULL DEFAULT ''"
   );
  }

  if(!names.has("dark_mode")){

   this.ctx.storage.sql.exec(
    "ALTER TABLE accounts ADD COLUMN dark_mode INTEGER NOT NULL DEFAULT 0"
   );
  }

  const sessionCols=
   this.ctx.storage.sql
    .exec("PRAGMA table_info(sessions)")
    .toArray();

  const sessionNames=
   new Set(sessionCols.map(x=>x.name));

  if(!sessionNames.has("created_at")){

   this.ctx.storage.sql.exec(
    "ALTER TABLE sessions ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0"
   );
  }
 }

 /* =======================================================
    FETCH
 ======================================================= */

 async fetch(request){

  const url=
   new URL(request.url);

  if(url.pathname==="/api/register")
   return this.register(request);

  if(url.pathname==="/api/login")
   return this.login(request);

  if(url.pathname==="/api/logout")
   return this.logout(request);

  if(url.pathname==="/api/delete-account")
   return this.deleteAccount(request);

  if(
   url.pathname==="/websocket"&&
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
    REGISTER
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
   !/^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/.test(username)
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
    {error:"اسم المستخدم موجود بالفعل"},
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

  const now=Date.now();

  this.ctx.storage.sql.exec(
   `
   INSERT INTO accounts(
    username,
    password_hash,
    salt,
    created_at,
    display_name,
    status_text,
    dark_mode
   )
   VALUES(?,?,?,?,?,?,?)
   `,
   username,
   bytesToBase64(hash),
   bytesToBase64(salt),
   now,
   username,
   "",
   0
  );

  return json({ok:true});
 }

 /* =======================================================
    LOGIN
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

  const now=Date.now();

  this.ctx.storage.sql.exec(
   `
   INSERT INTO sessions(
    token,
    username,
    created_at,
    expires_at
   )
   VALUES(?,?,?,?)
   `,
   token,
   account.username,
   now,
   now+SESSION_TIME
  );

  return json({
   ok:true,
   token,
   username:account.username
  });
 }

 /* =======================================================
    LOGOUT
 ======================================================= */

 async logout(request){

  let data={};

  try{
   data=await request.json();
  }catch{}

  const token=
   String(data.token||"");

  if(token){

   this.ctx.storage.sql.exec(
    "DELETE FROM sessions WHERE token=?",
    token
   );
  }

  return json({ok:true});
 }

 /* =======================================================
    DELETE ACCOUNT
 ======================================================= */

 async deleteAccount(request){

  let data;

  try{
   data=await request.json();
  }catch{
   return json(
    {error:"بيانات غير صحيحة"},
    400
   );
  }

  const token=
   String(data.token||"");

  const password=
   String(data.password||"");

  const confirmText=
   String(data.confirm||"");

  if(confirmText!=="حذف نهائي"){

   return json(
    {error:"تأكيد الحذف غير صحيح"},
    400
   );
  }

  const username=
   this.getUsernameFromToken(token);

  if(!username){

   return json(
    {error:"الجلسة غير صالحة"},
    401
   );
  }

  const rows=
   this.ctx.storage.sql
    .exec(
     `
     SELECT password_hash,salt
     FROM accounts
     WHERE username=?
     `,
     username
    )
    .toArray();

  if(!rows.length){

   return json(
    {error:"الحساب غير موجود"},
    404
   );
  }

  const account=rows[0];

  const hash=
   await hashPassword(
    password,
    base64ToBytes(account.salt)
   );

  if(
   bytesToBase64(hash)!==
   account.password_hash
  ){

   return json(
    {error:"كلمة المرور غير صحيحة"},
    401
   );
  }

  /* حذف الرسائل */

  this.ctx.storage.sql.exec(
   `
   DELETE FROM messages
   WHERE sender=? OR receiver=?
   `,
   username,
   username
  );

  /* حذف الجلسات */

  this.ctx.storage.sql.exec(
   "DELETE FROM sessions WHERE username=?",
   username
  );

  /* حذف الحساب */

  this.ctx.storage.sql.exec(
   "DELETE FROM accounts WHERE username=?",
   username
  );

  /* فصل كل اتصالات المستخدم */

  for(
   const [ws,session]
   of this.sessions.entries()
  ){

   if(session?.username===username){

    try{
     ws.close(1000,"Account deleted");
    }catch{}

    this.sessions.delete(ws);
   }
  }

  this.broadcastUsers();

  return json({ok:true});
 }

 /* =======================================================
    SESSION
 ======================================================= */

 getUsernameFromToken(token){

  if(!token)return null;

  const rows=
   this.ctx.storage.sql
    .exec(
     `
     SELECT username,expires_at
     FROM sessions
     WHERE token=?
     `,
     token
    )
    .toArray();

  if(!rows.length)return null;

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
    PROFILE
 ======================================================= */

 getProfile(username){

  const rows=
   this.ctx.storage.sql
    .exec(
     `
     SELECT
      username,
      display_name,
      status_text,
      dark_mode
     FROM accounts
     WHERE username=?
     `,
     username
    )
    .toArray();

  if(!rows.length)return null;

  return{
   username:rows[0].username,
   display_name:rows[0].display_name||rows[0].username,
   status_text:rows[0].status_text||"",
   dark_mode:Number(rows[0].dark_mode)||0
  };
 }

 /* =======================================================
    WEBSOCKET
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

  const attachment={username};

  server.serializeAttachment(
   attachment
  );

  this.sessions.set(
   server,
   attachment
  );

  this.broadcastUsers();

  this.sendProfile(server,username);

  return new Response(
   null,
   {
    status:101,
    webSocket:client
   }
  );
 }

 /* =======================================================
    WS MESSAGE
 ======================================================= */

 async webSocketMessage(ws,message){

  const session=
   this.sessions.get(ws)||
   ws.deserializeAttachment();

  if(!session?.username)return;

  let data;

  try{
   data=JSON.parse(message);
  }catch{
   return;
  }

  if(data.type==="get_users"){

   this.sendUsers(ws);
   return;
  }

  if(data.type==="get_profile"){

   this.sendProfile(
    ws,
    session.username
   );

   return;
  }

  if(data.type==="update_profile"){

   const display=
    String(data.display_name||"")
     .trim()
     .slice(0,40);

   const status=
    String(data.status_text||"")
     .trim()
     .slice(0,100);

   const dark=
    data.dark_mode?1:0;

   this.ctx.storage.sql.exec(
    `
    UPDATE accounts
    SET
     display_name=?,
     status_text=?,
     dark_mode=?
    WHERE username=?
    `,
    display,
    status,
    dark,
    session.username
   );

   this.sendProfile(
    ws,
    session.username
   );

   this.broadcastUsers();

   return;
  }

  if(data.type==="private_message"){

   await this.privateMessage(
    session.username,
    data
   );

   return;
  }

  if(data.type==="history"){

   this.sendHistory(
    ws,
    session.username,
    String(data.with||"")
   );

   return;
  }

  if(data.type==="typing"){

   const to=
    String(data.to||"");

   if(!to)return;

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

  const relayTypes=[
   "rtc_offer",
   "rtc_answer",
   "rtc_candidate",
   "rtc_reject",
   "rtc_hangup",
   "file_offer",
   "file_answer",
   "file_candidate",
   "file_reject",
   "file_start",
   "file_end"
  ];

  if(relayTypes.includes(data.type)){

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
    PRIVATE MESSAGE
 ======================================================= */

 async privateMessage(sender,data){

  const receiver=
   String(data.to||"").trim();

  const text=
   String(data.text||"")
    .trim()
    .slice(0,MAX_MESSAGE);

  if(!receiver||!text)return;

  if(receiver===sender)return;

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
     message:"المستخدم غير موجود"
    }
   );

   return;
  }

  const created_at=Date.now();

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

  this.sendToUser(sender,msg);

  this.sendToUser(receiver,msg);
 }

 /* =======================================================
    HISTORY
 ======================================================= */

 sendHistory(ws,username,other){

  if(!other)return;

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
      (sender=? AND receiver=?)
      OR
      (sender=? AND receiver=?)
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
    SEND PROFILE
 ======================================================= */

 sendProfile(ws,username){

  const profile=
   this.getProfile(username);

  if(!profile)return;

  try{

   ws.send(
    JSON.stringify({
     type:"profile",
     profile
    })
   );

  }catch{}
 }

 /* =======================================================
    USERS
 ======================================================= */

 sendUsers(ws){

  const users=
   this.getAllUsers();

  try{

   ws.send(
    JSON.stringify({
     type:"users",
     users
    })
   );

  }catch{}
 }

 getAllUsers(){

  const rows=
   this.ctx.storage.sql
    .exec(
     `
     SELECT
      username,
      display_name,
      status_text
     FROM accounts
     ORDER BY username COLLATE NOCASE
     `
    )
    .toArray();

  const online=
   new Set(
    [...this.sessions.values()]
     .map(x=>x.username)
     .filter(Boolean)
   );

  return rows.map(row=>({

   username:row.username,

   display_name:
    row.display_name||
    row.username,

   status_text:
    row.status_text||"",

   online:
    online.has(row.username)

  }));
 }

 broadcastUsers(){

  const users=
   this.getAllUsers();

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
    SEND TO USER
 ======================================================= */

 sendToUser(username,data){

  for(
   const [ws,session]
   of this.sessions.entries()
  ){

   if(session?.username===username){

    try{
     ws.send(
      JSON.stringify(data)
     );
    }catch{}
   }
  }
 }

 /* =======================================================
    CLOSE
 ======================================================= */

 async webSocketClose(ws){

  this.sessions.delete(ws);

  this.broadcastUsers();

  try{
   ws.close();
  }catch{}
 }

 async webSocketError(ws){

  this.sessions.delete(ws);

  this.broadcastUsers();
 }
}
