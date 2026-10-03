import { DurableObject } from "cloudflare:workers";

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bola11</title>

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
  font-family:inherit;
}

.hidden{
  display:none!important;
}

/* =========================
   LOGIN
========================= */

#auth{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:#128c7e;
}

.auth-box{
  width:100%;
  max-width:400px;
  background:white;
  border-radius:18px;
  padding:28px;
  box-shadow:0 8px 30px #0003;
}

.auth-box h1{
  text-align:center;
  margin:0 0 10px;
  color:#128c7e;
}

.auth-box p{
  text-align:center;
  color:#777;
  margin-bottom:25px;
}

.auth-box input{
  width:100%;
  padding:14px;
  margin-bottom:12px;
  border:1px solid #ddd;
  border-radius:10px;
  outline:none;
  font-size:16px;
}

.auth-box input:focus{
  border-color:#128c7e;
}

.auth-box button{
  width:100%;
  border:0;
  padding:14px;
  border-radius:10px;
  background:#128c7e;
  color:white;
  font-size:16px;
  cursor:pointer;
  margin-top:5px;
}

.auth-box button:hover{
  background:#0d7569;
}

.auth-switch{
  margin-top:18px;
  text-align:center;
  color:#128c7e;
  cursor:pointer;
}

#authError{
  color:#d00;
  text-align:center;
  margin-top:12px;
}

/* =========================
   APP
========================= */

#app{
  height:100vh;
  display:flex;
  background:#fff;
}

/* sidebar */

.sidebar{
  width:330px;
  background:#fff;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

.sidebar-header{
  background:#128c7e;
  color:white;
  padding:15px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.my-name{
  font-weight:bold;
  font-size:18px;
}

.logout{
  background:#fff2;
  color:white;
  border:0;
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
}

.search{
  padding:10px;
  background:#f5f5f5;
}

.search input{
  width:100%;
  border:0;
  outline:0;
  background:white;
  padding:11px;
  border-radius:8px;
}

.users{
  flex:1;
  overflow-y:auto;
}

.user{
  display:flex;
  align-items:center;
  gap:12px;
  padding:13px;
  border-bottom:1px solid #eee;
  cursor:pointer;
}

.user:hover{
  background:#f5f5f5;
}

.user.active{
  background:#e8f5f3;
}

.avatar{
  width:48px;
  height:48px;
  border-radius:50%;
  background:#128c7e;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
  position:relative;
  flex-shrink:0;
}

.online{
  position:absolute;
  width:12px;
  height:12px;
  background:#25d366;
  border:2px solid white;
  border-radius:50%;
  left:0;
  bottom:0;
}

.user-info{
  flex:1;
}

.user-name{
  font-weight:bold;
}

.user-status{
  font-size:12px;
  color:#888;
  margin-top:4px;
}

/* chat */

.chat{
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
}

.chat-header{
  height:65px;
  background:#128c7e;
  color:white;
  display:flex;
  align-items:center;
  padding:10px 16px;
  gap:12px;
}

.chat-title{
  font-weight:bold;
  font-size:18px;
}

.messages{
  flex:1;
  overflow-y:auto;
  padding:20px;
  background:#efeae2;
}

.empty{
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#777;
  text-align:center;
}

.message{
  max-width:75%;
  padding:9px 12px;
  margin-bottom:8px;
  border-radius:10px;
  word-wrap:break-word;
  clear:both;
}

.message.mine{
  float:right;
  background:#d9fdd3;
  border-top-right-radius:2px;
}

.message.theirs{
  float:left;
  background:white;
  border-top-left-radius:2px;
}

.message-time{
  font-size:10px;
  color:#777;
  margin-top:4px;
  text-align:left;
}

.composer{
  min-height:65px;
  background:#f0f0f0;
  display:flex;
  gap:8px;
  padding:10px;
}

.composer input{
  flex:1;
  border:0;
  outline:0;
  border-radius:22px;
  padding:12px 16px;
  font-size:16px;
}

.send{
  width:48px;
  height:48px;
  border:0;
  border-radius:50%;
  background:#128c7e;
  color:white;
  font-size:20px;
  cursor:pointer;
}

/* mobile */

@media(max-width:700px){

  .sidebar{
    width:100%;
  }

  .chat{
    display:none;
  }

  #app.chat-open .sidebar{
    display:none;
  }

  #app.chat-open .chat{
    display:flex;
  }

  .back{
    display:block!important;
  }
}

.back{
  display:none;
  background:none;
  border:0;
  color:white;
  font-size:22px;
}
</style>
</head>

<body>

<!-- =========================
     AUTH
========================= -->

<div id="auth">

  <div class="auth-box">

    <h1>Bola11</h1>

    <p id="authTitle">تسجيل الدخول</p>

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

    <button id="authBtn" onclick="submitAuth()">
      تسجيل الدخول
    </button>

    <div
      id="authSwitch"
      class="auth-switch"
      onclick="toggleAuth()"
    >
      إنشاء حساب جديد
    </div>

    <div id="authError"></div>

  </div>

</div>


<!-- =========================
     APP
========================= -->

<div id="app" class="hidden">

  <aside class="sidebar">

    <div class="sidebar-header">

      <div class="my-name" id="myName">
        ...
      </div>

      <button class="logout" onclick="logout()">
        خروج
      </button>

    </div>

    <div class="search">
      <input
        id="search"
        placeholder="بحث عن مستخدم..."
        oninput="filterUsers()"
      >
    </div>

    <div class="users" id="users"></div>

  </aside>


  <main class="chat">

    <div class="chat-header">

      <button
        class="back"
        onclick="closeChat()"
      >
        ←
      </button>

      <div class="avatar" id="chatAvatar">
        ?
      </div>

      <div>
        <div class="chat-title" id="chatTitle">
          اختر مستخدماً
        </div>

        <div
          id="chatStatus"
          style="font-size:12px"
        ></div>
      </div>

    </div>


    <div class="messages" id="messages">

      <div class="empty">
        اختر مستخدماً لبدء المحادثة
      </div>

    </div>


    <div class="composer">

      <input
        id="messageInput"
        placeholder="اكتب رسالة..."
        onkeydown="handleKey(event)"
      >

      <button
        class="send"
        onclick="sendMessage()"
      >
        ➤
      </button>

    </div>

  </main>

</div>


<script>

let token = localStorage.getItem("bola_token");
let username = localStorage.getItem("bola_username");

let registerMode = false;
let socket = null;

let users = [];
let selectedUser = null;


/* =========================
   AUTH
========================= */

function toggleAuth(){

  registerMode = !registerMode;

  document.getElementById("authTitle").textContent =
    registerMode
      ? "إنشاء حساب جديد"
      : "تسجيل الدخول";

  document.getElementById("authBtn").textContent =
    registerMode
      ? "إنشاء الحساب"
      : "تسجيل الدخول";

  document.getElementById("authSwitch").textContent =
    registerMode
      ? "لديك حساب بالفعل؟ تسجيل الدخول"
      : "إنشاء حساب جديد";

  document.getElementById("authError").textContent = "";

}


async function submitAuth(){

  const user =
    document.getElementById("username").value.trim();

  const pass =
    document.getElementById("password").value;

  const error =
    document.getElementById("authError");

  error.textContent = "";

  if(!user || !pass){

    error.textContent =
      "اكتب اسم المستخدم وكلمة السر";

    return;
  }

  if(user.length < 3){

    error.textContent =
      "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";

    return;
  }

  if(pass.length < 4){

    error.textContent =
      "كلمة السر يجب أن تكون 4 أحرف على الأقل";

    return;
  }

  const endpoint =
    registerMode
      ? "/api/register"
      : "/api/login";

  try{

    const res = await fetch(endpoint,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        username:user,
        password:pass
      })

    });

    const data = await res.json();

    if(!res.ok){

      error.textContent =
        data.error || "حدث خطأ";

      return;
    }

    token = data.token;
    username = data.username;

    localStorage.setItem(
      "bola_token",
      token
    );

    localStorage.setItem(
      "bola_username",
      username
    );

    openApp();

  }catch(e){

    error.textContent =
      "تعذر الاتصال بالسيرفر";

  }

}


/* =========================
   OPEN APP
========================= */

function openApp(){

  document.getElementById("auth")
    .classList.add("hidden");

  document.getElementById("app")
    .classList.remove("hidden");

  document.getElementById("myName")
    .textContent = username;

  connectSocket();
  loadUsers();

}


/* =========================
   LOGOUT
========================= */

async function logout(){

  try{

    await fetch("/api/logout",{

      method:"POST",

      headers:{
        "Authorization":
          "Bearer " + token
      }

    });

  }catch(e){}

  if(socket){

    socket.close();

  }

  localStorage.removeItem("bola_token");
  localStorage.removeItem("bola_username");

  token = null;
  username = null;

  document.getElementById("app")
    .classList.add("hidden");

  document.getElementById("auth")
    .classList.remove("hidden");

}


/* =========================
   USERS
========================= */

async function loadUsers(){

  try{

    const res = await fetch("/api/users",{

      headers:{
        "Authorization":
          "Bearer " + token
      }

    });

    if(!res.ok){

      if(res.status === 401){

        logout();

      }

      return;
    }

    users = await res.json();

    renderUsers();

  }catch(e){

    console.log(e);

  }

}


function renderUsers(){

  const box =
    document.getElementById("users");

  const search =
    document.getElementById("search")
      .value
      .toLowerCase();

  box.innerHTML = "";

  const filtered =
    users.filter(u =>
      u.username
        .toLowerCase()
        .includes(search)
    );

  filtered.forEach(u => {

    const div =
      document.createElement("div");

    div.className =
      "user" +
      (selectedUser === u.username
        ? " active"
        : "");

    const avatar =
      document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
      u.username
        .charAt(0)
        .toUpperCase();

    if(u.online){

      const online =
        document.createElement("span");

      online.className = "online";

      avatar.appendChild(online);

    }

    const info =
      document.createElement("div");

    info.className = "user-info";

    const name =
      document.createElement("div");

    name.className = "user-name";

    name.textContent =
      u.username;

    const status =
      document.createElement("div");

    status.className =
      "user-status";

    status.textContent =
      u.online
        ? "متصل الآن"
        : "غير متصل";

    info.appendChild(name);
    info.appendChild(status);

    div.appendChild(avatar);
    div.appendChild(info);

    div.onclick = () =>
      selectUser(u.username);

    box.appendChild(div);

  });

}


function filterUsers(){

  renderUsers();

}


/* =========================
   SELECT USER
========================= */

function selectUser(user){

  selectedUser = user;

  document.getElementById("app")
    .classList.add("chat-open");

  document.getElementById("chatTitle")
    .textContent = user;

  document.getElementById("chatAvatar")
    .textContent =
      user.charAt(0).toUpperCase();

  document.getElementById("messages")
    .innerHTML = "";

  renderUsers();

  if(socket &&
     socket.readyState === WebSocket.OPEN){

    socket.send(JSON.stringify({

      type:"history",

      with:user

    }));

  }

}


/* =========================
   CLOSE MOBILE CHAT
========================= */

function closeChat(){

  document.getElementById("app")
    .classList.remove("chat-open");

}


/* =========================
   WEBSOCKET
========================= */

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

  socket =
    new WebSocket(
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

    let data;

    try{

      data = JSON.parse(event.data);

    }catch(e){

      return;

    }


    if(data.type === "users"){

      users = data.users || [];

      renderUsers();

      return;

    }


    if(data.type === "history"){

      showHistory(data.messages || []);

      return;

    }


    if(data.type === "message"){

      receiveMessage(data);

      return;

    }


    if(data.type === "typing"){

      if(
        data.from === selectedUser
      ){

        document.getElementById(
          "chatStatus"
        ).textContent =
          data.typing
            ? "يكتب الآن..."
            : "";

      }

      return;

    }

  };


  socket.onclose = () => {

    console.log("WebSocket closed");

    setTimeout(() => {

      if(token){

        connectSocket();

      }

    },3000);

  };

}


/* =========================
   SEND MESSAGE
========================= */

function sendMessage(){

  if(!selectedUser){

    return;
  }

  const input =
    document.getElementById("messageInput");

  const text =
    input.value.trim();

  if(!text){

    return;
  }

  if(!socket ||
     socket.readyState !== WebSocket.OPEN){

    return;
  }

  socket.send(JSON.stringify({

    type:"message",

    to:selectedUser,

    text:text

  }));

  input.value = "";

}


function handleKey(event){

  if(event.key === "Enter"){

    event.preventDefault();

    sendMessage();

  }

}


/* =========================
   RECEIVE MESSAGE
========================= */

function receiveMessage(data){

  if(
    data.from !== selectedUser &&
    data.to !== selectedUser
  ){

    return;

  }

  addMessage({

    id:data.id,

    from:data.from,

    to:data.to,

    text:data.text,

    time:data.time

  });

}


function showHistory(messages){

  const box =
    document.getElementById("messages");

  box.innerHTML = "";

  if(messages.length === 0){

    box.innerHTML =
      '<div class="empty">لا توجد رسائل بعد</div>';

    return;

  }

  messages.forEach(message => {

    addMessage(message);

  });

}


function addMessage(message){

  const box =
    document.getElementById("messages");

  const empty =
    box.querySelector(".empty");

  if(empty){

    empty.remove();

  }

  const div =
    document.createElement("div");

  const mine =
    message.from === username;

  div.className =
    "message " +
    (mine ? "mine" : "theirs");

  const text =
    document.createElement("div");

  text.textContent =
    message.text;

  const time =
    document.createElement("div");

  time.className = "message-time";

  time.textContent =
    message.time || "";

  div.appendChild(text);
  div.appendChild(time);

  box.appendChild(div);

  box.scrollTop =
    box.scrollHeight;

}


/* =========================
   START
========================= */

if(token && username){

  openApp();

}

</script>

</body>
</html>`;


/* =====================================================
   DURABLE OBJECT
===================================================== */

export class ChatRoom extends DurableObject {

  constructor(ctx, env){

    super(ctx, env);

    this.ctx = ctx;
    this.env = env;

    this.ctx.blockConcurrencyWhile(
      async () => {

        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        `);

        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        `);

        this.ctx.storage.sql.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        `);

      }
    );

    this.clients = new Map();

  }


  /* =========================
     PASSWORD HASH
  ========================= */

  async hashPassword(password){

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
          salt:encoder.encode("BOLA11_SALT"),
          iterations:100000,
          hash:"SHA-256"
        },
        key,
        256
      );

    return Array.from(
      new Uint8Array(bits)
    )
    .map(b =>
      b.toString(16).padStart(2,"0")
    )
    .join("");

  }


  /* =========================
     CREATE TOKEN
  ========================= */

  makeToken(){

    const bytes =
      new Uint8Array(32);

    crypto.getRandomValues(bytes);

    return Array.from(bytes)
      .map(b =>
        b.toString(16).padStart(2,"0")
      )
      .join("");

  }


  /* =========================
     GET USER
  ========================= */

  getUserFromToken(token){

    if(!token){

      return null;

    }

    const rows =
      this.ctx.storage.sql.exec(
        `
        SELECT username
        FROM sessions
        WHERE token = ?
        LIMIT 1
        `,
        token
      ).toArray();

    if(rows.length === 0){

      return null;

    }

    return rows[0].username;

  }


  /* =========================
     HTTP
  ========================= */

  async fetch(request){

    const url =
      new URL(request.url);

    /* الصفحة */

    if(
      request.method === "GET" &&
      url.pathname === "/"
    ){

      return new Response(
        HTML,
        {
          headers:{
            "Content-Type":
              "text/html; charset=UTF-8"
          }
        }
      );

    }


    /* =========================
       REGISTER
    ========================= */

    if(
      request.method === "POST" &&
      url.pathname === "/api/register"
    ){

      try{

        const body =
          await request.json();

        const username =
          String(body.username || "")
            .trim();

        const password =
          String(body.password || "");


        if(username.length < 3){

          return Response.json(
            {
              error:
                "اسم المستخدم قصير جداً"
            },
            {status:400}
          );

        }


        if(username.length > 30){

          return Response.json(
            {
              error:
                "اسم المستخدم طويل جداً"
            },
            {status:400}
          );

        }


        if(password.length < 4){

          return Response.json(
            {
              error:
                "كلمة السر قصيرة جداً"
            },
            {status:400}
          );

        }


        if(
          !/^[a-zA-Z0-9_\u0600-\u06FF]+$/
            .test(username)
        ){

          return Response.json(
            {
              error:
                "اسم المستخدم يحتوي على رموز غير مسموحة"
            },
            {status:400}
          );

        }


        const exists =
          this.ctx.storage.sql.exec(
            `
            SELECT id
            FROM accounts
            WHERE username = ?
            LIMIT 1
            `,
            username
          ).toArray();


        if(exists.length > 0){

          return Response.json(
            {
              error:
                "اسم المستخدم موجود بالفعل"
            },
            {status:409}
          );

        }


        const passwordHash =
          await this.hashPassword(password);


        this.ctx.storage.sql.exec(
          `
          INSERT INTO accounts
          (username,password_hash,created_at)
          VALUES (?,?,?)
          `,
          username,
          passwordHash,
          Date.now()
        );


        const token =
          this.makeToken();


        this.ctx.storage.sql.exec(
          `
          INSERT INTO sessions
          (token,username,created_at)
          VALUES (?,?,?)
          `,
          token,
          username,
          Date.now()
        );


        return Response.json({

          ok:true,

          username,

          token

        });

      }catch(error){

        console.error(error);

        return Response.json(
          {
            error:
              "حدث خطأ أثناء إنشاء الحساب"
          },
          {status:500}
        );

      }

    }


    /* =========================
       LOGIN
    ========================= */

    if(
      request.method === "POST" &&
      url.pathname === "/api/login"
    ){

      try{

        const body =
          await request.json();

        const username =
          String(body.username || "")
            .trim();

        const password =
          String(body.password || "");


        const rows =
          this.ctx.storage.sql.exec(
            `
            SELECT username,password_hash
            FROM accounts
            WHERE username = ?
            LIMIT 1
            `,
            username
          ).toArray();


        if(rows.length === 0){

          return Response.json(
            {
              error:
                "اسم المستخدم أو كلمة السر غير صحيحة"
            },
            {status:401}
          );

        }


        const passwordHash =
          await this.hashPassword(password);


        if(
          passwordHash !==
          rows[0].password_hash
        ){

          return Response.json(
            {
              error:
                "اسم المستخدم أو كلمة السر غير صحيحة"
            },
            {status:401}
          );

        }


        const token =
          this.makeToken();


        this.ctx.storage.sql.exec(
          `
          INSERT INTO sessions
          (token,username,created_at)
          VALUES (?,?,?)
          `,
          token,
          username,
          Date.now()
        );


        return Response.json({

          ok:true,

          username,

          token

        });

      }catch(error){

        console.error(error);

        return Response.json(
          {
            error:
              "حدث خطأ أثناء تسجيل الدخول"
          },
          {status:500}
        );

      }

    }


    /* =========================
       LOGOUT
    ========================= */

    if(
      request.method === "POST" &&
      url.pathname === "/api/logout"
    ){

      const auth =
        request.headers.get("Authorization") || "";

      const token =
        auth.startsWith("Bearer ")
          ? auth.slice(7)
          : null;


      if(token){

        this.ctx.storage.sql.exec(
          `
          DELETE FROM sessions
          WHERE token = ?
          `,
          token
        );

      }


      return Response.json({
        ok:true
      });

    }


    /* =========================
       USERS
    ========================= */

    if(
      request.method === "GET" &&
      url.pathname === "/api/users"
    ){

      const auth =
        request.headers.get("Authorization") || "";

      const token =
        auth.startsWith("Bearer ")
          ? auth.slice(7)
          : null;


      const currentUser =
        this.getUserFromToken(token);


      if(!currentUser){

        return Response.json(
          {
            error:"غير مصرح"
          },
          {status:401}
        );

      }


      const rows =
        this.ctx.storage.sql.exec(
          `
          SELECT username
          FROM accounts
          ORDER BY username ASC
          `
        ).toArray();


      const result =
        rows
          .filter(
            row =>
              row.username !== currentUser
          )
          .map(row => ({

            username:row.username,

            online:
              this.clients.has(row.username)

          }));


      return Response.json(result);

    }


    /* =========================
       WEBSOCKET
    ========================= */

    if(
      url.pathname === "/ws"
    ){

      return this.websocket(request);

    }


    return new Response(
      "Not Found",
      {status:404}
    );

  }


  /* =========================
     WEBSOCKET
  ========================= */

  async websocket(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get("token");


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


    this.clients.set(
      username,
      server
    );


    server.serializeAttachment({
      username
    });


    server.addEventListener(
      "message",
      event =>
        this.webSocketMessage(
          server,
          username,
          event.data
        )
    );


    server.addEventListener(
      "close",
      () => {

        if(
          this.clients.get(username) === server
        ){

          this.clients.delete(username);

        }

        this.broadcastUsers();

      }
    );


    server.addEventListener(
      "error",
      () => {

        if(
          this.clients.get(username) === server
        ){

          this.clients.delete(username);

        }

        this.broadcastUsers();

      }
    );


    this.sendUsersTo(server);

    this.broadcastUsers();


    return new Response(null,{
      status:101,
      webSocket:client
    });

  }


  /* =========================
     WEBSOCKET MESSAGE
  ========================= */

  async webSocketMessage(
    socket,
    username,
    raw
  ){

    let data;

    try{

      data =
        JSON.parse(raw);

    }catch(e){

      return;

    }


    /* history */

    if(data.type === "history"){

      if(!data.with){

        return;

      }


      const messages =
        this.ctx.storage.sql.exec(
          `
          SELECT
            id,
            sender AS "from",
            receiver AS "to",
            text,
            created_at
          FROM messages
          WHERE
            (sender = ? AND receiver = ?)
            OR
            (sender = ? AND receiver = ?)
          ORDER BY id ASC
          LIMIT 500
          `,
          username,
          data.with,
          data.with,
          username
        ).toArray();


      const formatted =
        messages.map(m => ({

          id:m.id,

          from:m.from,

          to:m.to,

          text:m.text,

          time:new Date(
            m.created_at
          ).toLocaleTimeString(
            "ar-EG",
            {
              hour:"2-digit",
              minute:"2-digit"
            }
          )

        }));


      socket.send(
        JSON.stringify({

          type:"history",

          messages:formatted

        })
      );

      return;

    }


    /* message */

    if(data.type === "message"){

      const to =
        String(data.to || "").trim();

      const text =
        String(data.text || "").trim();


      if(!to || !text){

        return;

      }


      if(text.length > 5000){

        return;

      }


      const recipient =
        this.ctx.storage.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username = ?
          LIMIT 1
          `,
          to
        ).toArray();


      if(recipient.length === 0){

        return;

      }


      this.ctx.storage.sql.exec(
        `
        INSERT INTO messages
        (sender,receiver,text,created_at)
        VALUES (?,?,?,?)
        `,
        username,
        to,
        text,
        Date.now()
      );


      const rows =
        this.ctx.storage.sql.exec(
          `
          SELECT id,created_at
          FROM messages
          WHERE sender = ?
          AND receiver = ?
          ORDER BY id DESC
          LIMIT 1
          `,
          username,
          to
        ).toArray();


      const message = {

        type:"message",

        id:
          rows.length
            ? rows[0].id
            : null,

        from:username,

        to,

        text,

        time:new Date(
          Date.now()
        ).toLocaleTimeString(
          "ar-EG",
          {
            hour:"2-digit",
            minute:"2-digit"
          }
        )

      };


      /* المرسل */

      socket.send(
        JSON.stringify(message)
      );


      /* المستقبل */

      this.sendToUser(
        to,
        message
      );


      return;

    }


    /* typing */

    if(data.type === "typing"){

      if(!data.to){

        return;

      }


      this.sendToUser(
        data.to,
        {
          type:"typing",

          from:username,

          typing:!!data.typing
        }
      );

      return;

    }

  }


  /* =========================
     SEND TO USER
  ========================= */

  sendToUser(username,data){

    const socket =
      this.clients.get(username);

    if(!socket){

      return false;

    }


    try{

      socket.send(
        JSON.stringify(data)
      );

      return true;

    }catch(e){

      return false;

    }

  }


  /* =========================
     SEND USERS
  ========================= */

  sendUsersTo(socket){

    const rows =
      this.ctx.storage.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username ASC
        `
      ).toArray();


    const users =
      rows.map(row => ({

        username:row.username,

        online:
          this.clients.has(row.username)

      }));


    try{

      socket.send(
        JSON.stringify({

          type:"users",

          users

        })
      );

    }catch(e){}

  }


  /* =========================
     BROADCAST USERS
  ========================= */

  broadcastUsers(){

    const rows =
      this.ctx.storage.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username ASC
        `
      ).toArray();


    const users =
      rows.map(row => ({

        username:row.username,

        online:
          this.clients.has(row.username)

      }));


    const message =
      JSON.stringify({

        type:"users",

        users

      });


    for(
      const socket of this.clients.values()
    ){

      try{

        socket.send(message);

      }catch(e){}

    }

  }

}


/* =====================================================
   WORKER
===================================================== */

export default {

  async fetch(request, env){

    const id =
      env.CHAT_ROOM.idFromName(
        "main"
      );

    const room =
      env.CHAT_ROOM.get(id);

    return room.fetch(request);

  }

};
