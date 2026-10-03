import { DurableObject } from "cloudflare:workers";

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>دردشة</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#e5ddd5;
}

button,input{
  font-family:inherit;
}

.hidden{
  display:none!important;
}

/* AUTH */

#auth{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:#f0f2f5;
}

.auth-box{
  width:100%;
  max-width:400px;
  background:white;
  padding:25px;
  border-radius:15px;
  box-shadow:0 4px 20px #0002;
}

.auth-box h1{
  display:none;
}

.auth-box h2{
  text-align:center;
  margin-top:0;
}

.auth-box input{
  width:100%;
  padding:13px;
  margin:7px 0;
  border:1px solid #ccc;
  border-radius:8px;
  font-size:16px;
}

.auth-box button{
  width:100%;
  padding:13px;
  margin-top:10px;
  border:0;
  border-radius:8px;
  background:#128c7e;
  color:white;
  font-size:16px;
  cursor:pointer;
}

.auth-box .secondary{
  background:#eee;
  color:#222;
}

#error{
  color:#d00;
  margin-top:10px;
  text-align:center;
}

/* APP */

#app{
  height:100vh;
  display:flex;
}

#sidebar{
  width:300px;
  background:white;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

#side-header{
  padding:15px;
  background:#128c7e;
  color:white;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

#side-header button{
  background:#ffffff22;
  color:white;
  border:0;
  padding:8px 12px;
  border-radius:7px;
  cursor:pointer;
}

#users{
  overflow-y:auto;
  flex:1;
}

.user{
  padding:14px;
  border-bottom:1px solid #eee;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:10px;
}

.user:hover{
  background:#f5f5f5;
}

.dot{
  width:10px;
  height:10px;
  border-radius:50%;
  background:#aaa;
  flex:none;
}

.dot.online{
  background:#25d366;
}

.user-name{
  font-weight:bold;
}

/* CHAT */

#chat{
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
}

#chat-header{
  height:60px;
  background:#128c7e;
  color:white;
  display:flex;
  align-items:center;
  padding:0 15px;
}

#chat-user{
  font-weight:bold;
}

#typing{
  font-size:12px;
  opacity:.8;
  margin-right:10px;
}

#messages{
  flex:1;
  overflow-y:auto;
  padding:15px;
  background:#efeae2;
}

.message{
  max-width:75%;
  padding:8px 11px;
  margin:6px 0;
  border-radius:8px;
  word-wrap:break-word;
  clear:both;
}

.mine{
  float:right;
  background:#d9fdd3;
}

.theirs{
  float:left;
  background:white;
}

.time{
  font-size:10px;
  opacity:.55;
  margin-top:4px;
}

#input-area{
  display:flex;
  padding:10px;
  background:#f0f2f5;
  gap:8px;
}

#messageInput{
  flex:1;
  border:0;
  outline:0;
  padding:12px;
  border-radius:20px;
  font-size:15px;
}

#sendBtn{
  border:0;
  width:45px;
  height:45px;
  border-radius:50%;
  background:#128c7e;
  color:white;
  cursor:pointer;
}

#empty{
  height:100%;
  display:flex;
  justify-content:center;
  align-items:center;
  color:#777;
}

/* MOBILE */

@media(max-width:700px){
  #sidebar{
    width:100%;
  }

  #chat{
    display:none;
  }

  #app.chat-open #sidebar{
    display:none;
  }

  #app.chat-open #chat{
    display:flex;
  }
}
</style>
</head>

<body>

<!-- تسجيل الدخول -->
<div id="auth">

  <div class="auth-box">

    <h1>Bola11</h1>

    <h2 id="authTitle">تسجيل الدخول</h2>

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

    <button id="authBtn">دخول</button>

    <button
      id="switchBtn"
      class="secondary"
    >
      إنشاء حساب جديد
    </button>

    <div id="error"></div>

  </div>

</div>


<!-- التطبيق -->
<div id="app" class="hidden">

  <aside id="sidebar">

    <div id="side-header">

      <span>المستخدمون</span>

      <button id="logoutBtn">
        خروج
      </button>

    </div>

    <div id="users"></div>

  </aside>


  <main id="chat">

    <div id="chat-header">

      <span id="chat-user">
        اختر مستخدمًا
      </span>

      <span id="typing"></span>

    </div>

    <div id="messages">

      <div id="empty">
        اختر مستخدمًا لبدء المحادثة
      </div>

    </div>


    <div id="input-area">

      <input
        id="messageInput"
        type="text"
        placeholder="اكتب رسالة..."
        disabled
      >

      <button
        id="sendBtn"
        disabled
      >
        ➤
      </button>

    </div>

  </main>

</div>


<script>

let token = localStorage.getItem("token") || "";
let currentUser = "";
let selectedUser = "";
let socket = null;
let reconnectTimer = null;
let typingTimer = null;
let registerMode = false;


/* عناصر الصفحة */

const auth = document.getElementById("auth");
const app = document.getElementById("app");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authBtn");
const switchBtn = document.getElementById("switchBtn");
const errorBox = document.getElementById("error");

const usersBox = document.getElementById("users");

const chatUser = document.getElementById("chat-user");
const messagesBox = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const typingBox = document.getElementById("typing");


/* تبديل تسجيل / إنشاء حساب */

switchBtn.onclick = () => {

  registerMode = !registerMode;

  errorBox.textContent = "";

  if(registerMode){

    authTitle.textContent = "إنشاء حساب";

    authBtn.textContent = "إنشاء الحساب";

    switchBtn.textContent = "لدي حساب بالفعل";

  }else{

    authTitle.textContent = "تسجيل الدخول";

    authBtn.textContent = "دخول";

    switchBtn.textContent = "إنشاء حساب جديد";

  }

};


/* تسجيل الدخول / إنشاء الحساب */

authBtn.onclick = async () => {

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  errorBox.textContent = "";

  if(!username || !password){

    errorBox.textContent =
      "اكتب اسم المستخدم وكلمة السر";

    return;
  }

  authBtn.disabled = true;

  try{

    const endpoint =
      registerMode
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

      throw new Error(
        data.error || "حدث خطأ"
      );

    }

    token = data.token;

    localStorage.setItem(
      "token",
      token
    );

    currentUser = data.username || username;

    showApp();

  }catch(err){

    errorBox.textContent =
      err.message ||
      "حدث خطأ أثناء العملية";

  }finally{

    authBtn.disabled = false;

  }

};


/* عرض التطبيق */

function showApp(){

  auth.classList.add("hidden");
  app.classList.remove("hidden");

  connectSocket();
  loadUsers();

}


/* الاتصال بالـ WebSocket */

function connectSocket(){

  if(!token) return;

  if(socket){

    try{
      socket.close();
    }catch(e){}

  }

  const protocol =
    location.protocol === "https:"
    ? "wss:"
    : "ws:";

  socket = new WebSocket(
    protocol +
    "//" +
    location.host +
    "/ws?token=" +
    encodeURIComponent(token)
  );


  socket.onopen = () => {

    console.log("WebSocket connected");

    loadUsers();

  };


  socket.onmessage = event => {

    try{

      const data =
        JSON.parse(event.data);


      /* رسالة جديدة */

      if(data.type === "message"){

        if(
          data.from === selectedUser ||
          data.to === selectedUser
        ){

          addMessage(
            data.from,
            data.text,
            data.created_at
          );

        }

        return;
      }


      /* تاريخ المحادثة */

      if(data.type === "history"){

        messagesBox.innerHTML = "";

        if(!data.messages ||
           data.messages.length === 0){

          showEmptyMessages();

          return;

        }

        for(const msg of data.messages){

          addMessage(
            msg.sender,
            msg.text,
            msg.created_at
          );

        }

        scrollMessages();

        return;
      }


      /* الكتابة */

      if(data.type === "typing"){

        if(data.from === selectedUser){

          typingBox.textContent =
            data.typing
            ? "يكتب..."
            : "";

        }

        return;
      }


      /* تحديث المستخدمين */

      if(data.type === "users"){

        loadUsers();

        return;
      }

    }catch(e){

      console.error(e);

    }

  };


  socket.onclose = () => {

    console.log("WebSocket disconnected");

    clearTimeout(reconnectTimer);

    reconnectTimer = setTimeout(
      connectSocket,
      2000
    );

  };


  socket.onerror = () => {

    try{
      socket.close();
    }catch(e){}

  };

}


/* تحميل المستخدمين */

async function loadUsers(){

  if(!token) return;

  try{

    const response =
      await fetch(
        "/api/users?token=" +
        encodeURIComponent(token)
      );

    if(!response.ok) return;

    const data =
      await response.json();

    usersBox.innerHTML = "";

    for(const user of data.users){

      if(user.username === currentUser){
        continue;
      }

      const div =
        document.createElement("div");

      div.className = "user";

      div.innerHTML = `

        <span class="dot ${
          user.online
          ? "online"
          : ""
        }"></span>

        <span class="user-name">
          ${escapeHtml(user.username)}
        </span>

      `;

      div.onclick = () => {

        openChat(user.username);

      };

      usersBox.appendChild(div);

    }

  }catch(e){

    console.error(e);

  }

}


/* فتح محادثة */

function openChat(username){

  selectedUser = username;

  chatUser.textContent =
    username;

  typingBox.textContent = "";

  messageInput.disabled = false;
  sendBtn.disabled = false;

  app.classList.add("chat-open");

  messagesBox.innerHTML = "";

  if(socket &&
     socket.readyState === WebSocket.OPEN){

    socket.send(
      JSON.stringify({
        type:"history",
        with:username
      })
    );

  }

}


/* إرسال رسالة */

function sendMessage(){

  const text =
    messageInput.value.trim();

  if(!text) return;

  if(!selectedUser) return;

  if(
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ){

    return;

  }

  socket.send(
    JSON.stringify({

      type:"message",

      to:selectedUser,

      text:text

    })
  );

  messageInput.value = "";

  sendTyping(false);

}


/* زر الإرسال */

sendBtn.onclick =
  sendMessage;


/* Enter */

messageInput.addEventListener(
  "keydown",
  event => {

    if(event.key === "Enter"){

      event.preventDefault();

      sendMessage();

    }

  }
);


/* مؤشر الكتابة */

messageInput.addEventListener(
  "input",
  () => {

    sendTyping(true);

    clearTimeout(typingTimer);

    typingTimer =
      setTimeout(
        () => sendTyping(false),
        1200
      );

  }
);


function sendTyping(value){

  if(!selectedUser) return;

  if(
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ){

    return;

  }

  socket.send(
    JSON.stringify({

      type:"typing",

      to:selectedUser,

      typing:value

    })
  );

}


/* إضافة رسالة */

function addMessage(
  sender,
  text,
  createdAt
){

  const empty =
    document.getElementById("empty");

  if(empty){

    empty.remove();

  }

  const div =
    document.createElement("div");

  div.className =
    "message " +
    (
      sender === currentUser
      ? "mine"
      : "theirs"
    );


  const textDiv =
    document.createElement("div");

  textDiv.textContent = text;


  const timeDiv =
    document.createElement("div");

  timeDiv.className = "time";

  if(createdAt){

    const date =
      new Date(createdAt);

    if(!isNaN(date.getTime())){

      timeDiv.textContent =
        date.toLocaleTimeString(
          "ar-EG",
          {
            hour:"2-digit",
            minute:"2-digit"
          }
        );

    }

  }


  div.appendChild(textDiv);
  div.appendChild(timeDiv);

  messagesBox.appendChild(div);

  scrollMessages();

}


function showEmptyMessages(){

  messagesBox.innerHTML = `

    <div id="empty">
      لا توجد رسائل بعد
    </div>

  `;

}


function scrollMessages(){

  messagesBox.scrollTop =
    messagesBox.scrollHeight;

}


/* تسجيل الخروج */

document.getElementById(
  "logoutBtn"
).onclick = async () => {

  try{

    await fetch("/api/logout",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        token
      })

    });

  }catch(e){}


  token = "";

  currentUser = "";
  selectedUser = "";

  localStorage.removeItem("token");

  if(socket){

    try{
      socket.close();
    }catch(e){}

  }

  app.classList.add("hidden");
  auth.classList.remove("hidden");

  usernameInput.value = "";
  passwordInput.value = "";

};


/* حماية HTML */

function escapeHtml(value){

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* محاولة الدخول تلقائياً */

async function checkSession(){

  if(!token) return;

  try{

    const response =
      await fetch(
        "/api/me?token=" +
        encodeURIComponent(token)
      );

    if(!response.ok){

      localStorage.removeItem("token");
      token = "";

      return;

    }

    const data =
      await response.json();

    currentUser =
      data.username;

    showApp();

  }catch(e){

    console.error(e);

  }

}


checkSession();

</script>

</body>
</html>`;


/* =========================
   WORKER
========================= */

export default {

  async fetch(request, env){

    const url =
      new URL(request.url);

    if(
      url.pathname === "/" &&
      request.method === "GET"
    ){

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


    /* تسجيل */

    if(
      url.pathname === "/api/register" &&
      request.method === "POST"
    ){

      return handleRegister(
        request,
        env
      );

    }


    /* دخول */

    if(
      url.pathname === "/api/login" &&
      request.method === "POST"
    ){

      return handleLogin(
        request,
        env
      );

    }


    /* خروج */

    if(
      url.pathname === "/api/logout" &&
      request.method === "POST"
    ){

      return handleLogout(
        request,
        env
      );

    }


    /* المستخدم الحالي */

    if(
      url.pathname === "/api/me" &&
      request.method === "GET"
    ){

      return handleMe(
        request,
        env
      );

    }


    /* المستخدمين */

    if(
      url.pathname === "/api/users" &&
      request.method === "GET"
    ){

      return handleUsers(
        request,
        env
      );

    }


    /* WebSocket */

    if(
      url.pathname === "/ws"
    ){

      if(
        request.headers.get(
          "Upgrade"
        ) === "websocket"
      ){

        return websocket(
          request,
          env
        );

      }

    }


    return new Response(
      "Not Found",
      {
        status:404
      }
    );

  }

};


/* =========================
   HELPERS
========================= */

function json(data,status=200){

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":
          "application/json"
      }
    }
  );

}


/* =========================
   DATABASE
========================= */

function initDB(sql){

  /*
    مهم:
    لا نغيّر جدول accounts القديم
    ولا نفترض وجود id فيه.
  */

  sql.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  sql.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  sql.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

}


/* =========================
   PASSWORD HASH
========================= */

async function hashPassword(password){

  const encoder =
    new TextEncoder();

  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );

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
        salt:salt,
        iterations:100000,
        hash:"SHA-256"
      },
      key,
      256
    );

  return (
    arrayBufferToBase64(salt) +
    "." +
    arrayBufferToBase64(bits)
  );

}


async function verifyPassword(
  password,
  stored
){

  try{

    const parts =
      stored.split(".");

    if(parts.length !== 2){
      return false;
    }

    const salt =
      base64ToUint8Array(
        parts[0]
      );

    const expected =
      parts[1];

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
          salt:salt,
          iterations:100000,
          hash:"SHA-256"
        },
        key,
        256
      );

    const actual =
      arrayBufferToBase64(bits);

    return actual === expected;

  }catch(e){

    return false;

  }

}


function arrayBufferToBase64(buffer){

  const bytes =
    new Uint8Array(buffer);

  let binary = "";

  for(
    let i=0;
    i<bytes.length;
    i++
  ){

    binary +=
      String.fromCharCode(
        bytes[i]
      );

  }

  return btoa(binary);

}


function base64ToUint8Array(value){

  const binary =
    atob(value);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for(
    let i=0;
    i<binary.length;
    i++
  ){

    bytes[i] =
      binary.charCodeAt(i);

  }

  return bytes;

}


/* =========================
   TOKEN
========================= */

function createToken(){

  const bytes =
    crypto.getRandomValues(
      new Uint8Array(32)
    );

  return arrayBufferToBase64(bytes);

}


function getToken(request){

  const url =
    new URL(request.url);

  return (
    url.searchParams.get(
      "token"
    ) ||
    request.headers.get(
      "Authorization"
    )?.replace(
      /^Bearer\s+/i,
      ""
    ) ||
    null
  );

}


/* =========================
   GET USER
========================= */

function getUserFromToken(
  sql,
  token
){

  if(!token){
    return null;
  }

  const rows =
    sql.exec(
      `
      SELECT username
      FROM sessions
      WHERE token = ?
      LIMIT 1
      `,
      token
    ).toArray();

  if(
    !rows ||
    rows.length === 0
  ){

    return null;

  }

  return rows[0].username;

}


/* =========================
   REGISTER
========================= */

async function handleRegister(
  request,
  env
){

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


    if(
      username.length < 3
    ){

      return json(
        {
          error:
            "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"
        },
        400
      );

    }


    if(
      password.length < 4
    ){

      return json(
        {
          error:
            "كلمة السر يجب أن تكون 4 أحرف على الأقل"
        },
        400
      );

    }


    const id =
      env.CHAT_ROOM.idFromName(
        "main"
      );

    const room =
      env.CHAT_ROOM.get(id);


    return room.fetch(
      new Request(
        "https://internal/register",
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
      )
    );

  }catch(e){

    return json(
      {
        error:
          "حدث خطأ أثناء إنشاء الحساب: " +
          e.message
      },
      500
    );

  }

}


/* =========================
   LOGIN
========================= */

async function handleLogin(
  request,
  env
){

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


    const id =
      env.CHAT_ROOM.idFromName(
        "main"
      );

    const room =
      env.CHAT_ROOM.get(id);


    return room.fetch(
      new Request(
        "https://internal/login",
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
      )
    );

  }catch(e){

    return json(
      {
        error:
          "حدث خطأ أثناء تسجيل الدخول: " +
          e.message
      },
      500
    );

  }

}


/* =========================
   LOGOUT
========================= */

async function handleLogout(
  request,
  env
){

  try{

    const body =
      await request.json();

    const token =
      body.token;

    if(!token){

      return json({
        ok:true
      });

    }


    const id =
      env.CHAT_ROOM.idFromName(
        "main"
      );

    const room =
      env.CHAT_ROOM.get(id);


    return room.fetch(
      new Request(
        "https://internal/logout",
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
      )
    );

  }catch(e){

    return json(
      {
        error:e.message
      },
      500
    );

  }

}


/* =========================
   ME
========================= */

async function handleMe(
  request,
  env
){

  const token =
    getToken(request);

  const id =
    env.CHAT_ROOM.idFromName(
      "main"
    );

  const room =
    env.CHAT_ROOM.get(id);

  return room.fetch(
    new Request(
      "https://internal/me?token=" +
      encodeURIComponent(
        token || ""
      )
    )
  );

}


/* =========================
   USERS
========================= */

async function handleUsers(
  request,
  env
){

  const token =
    getToken(request);

  const id =
    env.CHAT_ROOM.idFromName(
      "main"
    );

  const room =
    env.CHAT_ROOM.get(id);

  return room.fetch(
    new Request(
      "https://internal/users?token=" +
      encodeURIComponent(
        token || ""
      )
    )
  );

}


/* =========================
   WEBSOCKET
========================= */

async function websocket(
  request,
  env
){

  const url =
    new URL(request.url);

  const token =
    url.searchParams.get(
      "token"
    );

  if(!token){

    return new Response(
      "Unauthorized",
      {
        status:401
      }
    );

  }


  const id =
    env.CHAT_ROOM.idFromName(
      "main"
    );

  const room =
    env.CHAT_ROOM.get(id);


  return room.fetch(
    new Request(
      "https://internal/ws?token=" +
      encodeURIComponent(token),
      {
        headers:{
          Upgrade:"websocket"
        }
      }
    )
  );

}


/* =========================
   DURABLE OBJECT
========================= */

export class ChatRoom
  extends DurableObject
{

  constructor(ctx,env){

    super(ctx,env);

    this.ctx = ctx;
    this.env = env;

    this.sql =
      ctx.storage.sql;

    initDB(this.sql);

    this.connections =
      new Map();

  }


  async fetch(request){

    const url =
      new URL(request.url);


    /* REGISTER */

    if(
      url.pathname === "/register" &&
      request.method === "POST"
    ){

      return this.register(
        request
      );

    }


    /* LOGIN */

    if(
      url.pathname === "/login" &&
      request.method === "POST"
    ){

      return this.login(
        request
      );

    }


    /* LOGOUT */

    if(
      url.pathname === "/logout" &&
      request.method === "POST"
    ){

      return this.logout(
        request
      );

    }


    /* ME */

    if(
      url.pathname === "/me"
    ){

      return this.me(
        request
      );

    }


    /* USERS */

    if(
      url.pathname === "/users"
    ){

      return this.users(
        request
      );

    }


    /* WS */

    if(
      url.pathname === "/ws" &&
      request.headers.get(
        "Upgrade"
      ) === "websocket"
    ){

      return this.handleWebSocket(
        request
      );

    }


    return new Response(
      "Not Found",
      {
        status:404
      }
    );

  }


  /* =====================
     REGISTER
  ===================== */

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


      /*
        مهم جداً:
        هنا لا نستخدم SELECT id
        لأن جدول accounts القديم
        لا يحتوي على id.
      */

      const exists =
        this.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username = ?
          LIMIT 1
          `,
          username
        ).toArray();


      if(
        exists &&
        exists.length > 0
      ){

        return json(
          {
            error:
              "اسم المستخدم موجود بالفعل"
          },
          400
        );

      }


      const passwordHash =
        await hashPassword(
          password
        );


      const now =
        Date.now();


      this.sql.exec(
        `
        INSERT INTO accounts
        (username,password_hash,created_at)
        VALUES (?,?,?)
        `,
        username,
        passwordHash,
        now
      );


      const token =
        createToken();


      this.sql.exec(
        `
        INSERT INTO sessions
        (token,username,created_at)
        VALUES (?,?,?)
        `,
        token,
        username,
        now
      );


      return json({
        ok:true,
        username,
        token
      });


    }catch(e){

      return json(
        {
          error:
            "حدث خطأ أثناء إنشاء الحساب: " +
            e.message
        },
        500
      );

    }

  }


  /* =====================
     LOGIN
  ===================== */

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
          SELECT username,password_hash
          FROM accounts
          WHERE username = ?
          LIMIT 1
          `,
          username
        ).toArray();


      if(
        !rows ||
        rows.length === 0
      ){

        return json(
          {
            error:
              "اسم المستخدم أو كلمة السر غير صحيحة"
          },
          401
        );

      }


      const account =
        rows[0];


      const valid =
        await verifyPassword(
          password,
          account.password_hash
        );


      if(!valid){

        return json(
          {
            error:
              "اسم المستخدم أو كلمة السر غير صحيحة"
          },
          401
        );

      }


      const token =
        createToken();


      this.sql.exec(
        `
        INSERT INTO sessions
        (token,username,created_at)
        VALUES (?,?,?)
        `,
        token,
        username,
        Date.now()
      );


      return json({
        ok:true,
        username,
        token
      });


    }catch(e){

      return json(
        {
          error:
            "حدث خطأ أثناء تسجيل الدخول: " +
            e.message
        },
        500
      );

    }

  }


  /* =====================
     LOGOUT
  ===================== */

  async logout(request){

    try{

      const body =
        await request.json();

      const token =
        body.token;


      if(token){

        this.sql.exec(
          `
          DELETE FROM sessions
          WHERE token = ?
          `,
          token
        );

      }


      return json({
        ok:true
      });


    }catch(e){

      return json(
        {
          error:e.message
        },
        500
      );

    }

  }


  /* =====================
     ME
  ===================== */

  async me(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get(
        "token"
      );

    const username =
      getUserFromToken(
        this.sql,
        token
      );


    if(!username){

      return json(
        {
          error:"غير مسجل الدخول"
        },
        401
      );

    }


    return json({
      ok:true,
      username
    });

  }


  /* =====================
     USERS
  ===================== */

  async users(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get(
        "token"
      );

    const currentUser =
      getUserFromToken(
        this.sql,
        token
      );


    if(!currentUser){

      return json(
        {
          error:"غير مسجل الدخول"
        },
        401
      );

    }


    const rows =
      this.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username
        `
      ).toArray();


    const users =
      rows
        .filter(
          user =>
            user.username !== currentUser
        )
        .map(
          user => ({
            username:user.username,
            online:
              this.connections.has(
                user.username
              )
          })
        );


    return json({
      users
    });

  }


  /* =====================
     WEBSOCKET
  ===================== */

  async handleWebSocket(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get(
        "token"
      );


    const username =
      getUserFromToken(
        this.sql,
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


    server.accept();


    this.connections.set(
      username,
      server
    );


    server.addEventListener(
      "message",
      event => {

        this.handleMessage(
          username,
          server,
          event.data
        );

      }
    );


    server.addEventListener(
      "close",
      () => {

        if(
          this.connections.get(
            username
          ) === server
        ){

          this.connections.delete(
            username
          );

        }

      }
    );


    server.addEventListener(
      "error",
      () => {

        if(
          this.connections.get(
            username
          ) === server
        ){

          this.connections.delete(
            username
          );

        }

      }
    );


    return new Response(
      null,
      {
        status:101,
        webSocket:client
      }
    );

  }


  /* =====================
     WS MESSAGES
  ===================== */

  handleMessage(
    username,
    socket,
    raw
  ){

    try{

      const data =
        JSON.parse(raw);


      /* رسالة */

      if(
        data.type === "message"
      ){

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


        const createdAt =
          Date.now();


        this.sql.exec(
          `
          INSERT INTO messages
          (sender,receiver,text,created_at)
          VALUES (?,?,?,?)
          `,
          username,
          to,
          text,
          createdAt
        );


        const receiverSocket =
          this.connections.get(
            to
          );


        const payload =
          JSON.stringify({
            type:"message",
            from:username,
            to,
            text,
            created_at:createdAt
          });


        if(receiverSocket){

          try{

            receiverSocket.send(
              payload
            );

          }catch(e){}

        }


        try{

          socket.send(
            payload
          );

        }catch(e){}


        return;

      }


      /* تاريخ المحادثة */

      if(
        data.type === "history"
      ){

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
              created_at
            FROM messages
            WHERE
              (sender = ? AND receiver = ?)
              OR
              (sender = ? AND receiver = ?)
            ORDER BY created_at ASC
            `,
            username,
            other,
            other,
            username
          ).toArray();


        socket.send(
          JSON.stringify({
            type:"history",
            with:other,
            messages:rows
          })
        );


        return;

      }


      /* الكتابة */

      if(
        data.type === "typing"
      ){

        const to =
          String(
            data.to || ""
          ).trim();


        const receiverSocket =
          this.connections.get(
            to
          );


        if(receiverSocket){

          receiverSocket.send(
            JSON.stringify({
              type:"typing",
              from:username,
              typing:
                Boolean(
                  data.typing
                )
            })
          );

        }


        return;

      }

    }catch(e){

      console.error(
        "WS error:",
        e
      );

    }

  }

  }
