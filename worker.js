import { DurableObject } from "cloudflare:workers";

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
}

.hidden{
  display:none!important;
}

button,input{
  font-family:inherit;
}

/* تسجيل الدخول */

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
  padding:28px;
  border-radius:18px;
  box-shadow:0 8px 30px #0003;
}

.auth-box h1{
  margin:0 0 25px;
  text-align:center;
  color:#128c7e;
  display:none;
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
  padding:14px;
  border:0;
  border-radius:10px;
  background:#128c7e;
  color:white;
  font-size:16px;
  cursor:pointer;
}

.auth-switch{
  text-align:center;
  margin-top:18px;
  color:#128c7e;
  cursor:pointer;
}

#authError{
  text-align:center;
  color:#d00;
  margin-top:12px;
}

/* التطبيق */

#app{
  height:100vh;
  display:flex;
  background:white;
}

.sidebar{
  width:330px;
  background:white;
  border-left:1px solid #ddd;
  display:flex;
  flex-direction:column;
}

.sidebar-header{
  background:#128c7e;
  color:white;
  padding:15px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.my-name{
  font-weight:bold;
  font-size:18px;
}

.logout{
  border:0;
  background:#ffffff22;
  color:white;
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
  font-size:18px;
  font-weight:bold;
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

.back{
  display:none;
  border:0;
  background:none;
  color:white;
  font-size:22px;
}

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
    display:block;
  }
}
</style>
</head>

<body>

<div id="auth">

  <div class="auth-box">

    <h1>دردشة</h1>

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


<div id="app" class="hidden">

  <aside class="sidebar">

    <div class="sidebar-header">

      <div class="my-name" id="myName"></div>

      <button
        class="logout"
        onclick="logout()"
      >
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

    <div
      class="users"
      id="users"
    ></div>

  </aside>


  <main class="chat">

    <div class="chat-header">

      <button
        class="back"
        onclick="closeChat()"
      >
        ←
      </button>

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
          اختر مستخدماً
        </div>

        <div
          id="chatStatus"
          style="font-size:12px"
        ></div>

      </div>

    </div>


    <div
      class="messages"
      id="messages"
    >

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


/* تبديل التسجيل والدخول */

function toggleAuth(){

  registerMode = !registerMode;

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


/* تسجيل / دخول */

async function submitAuth(){

  const user =
    document.getElementById("username")
      .value
      .trim();

  const pass =
    document.getElementById("password")
      .value;

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

    const response =
      await fetch(endpoint,{

        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
          username:user,
          password:pass
        })

      });


    const data =
      await response.json();


    if(!response.ok){

      error.textContent =
        data.error ||
        "حدث خطأ";

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

    console.error(e);

    error.textContent =
      "تعذر الاتصال بالسيرفر";

  }

}


/* فتح التطبيق */

function openApp(){

  document.getElementById("auth")
    .classList.add("hidden");

  document.getElementById("app")
    .classList.remove("hidden");

  document.getElementById("myName")
    .textContent = username;

  loadUsers();
  connectSocket();

}


/* تسجيل الخروج */

async function logout(){

  try{

    await fetch(
      "/api/logout",
      {
        method:"POST",
        headers:{
          "Authorization":
            "Bearer " + token
        }
      }
    );

  }catch(e){}


  if(socket){

    socket.close();
    socket = null;

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


/* المستخدمين */

async function loadUsers(){

  try{

    const response =
      await fetch(
        "/api/users",
        {
          headers:{
            "Authorization":
              "Bearer " + token
          }
        }
      );


    if(response.status === 401){

      logout();
      return;

    }


    users =
      await response.json();

    renderUsers();


  }catch(e){

    console.error(e);

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


  users
    .filter(u =>
      u.username
        .toLowerCase()
        .includes(search)
    )
    .forEach(u => {

      const div =
        document.createElement("div");

      div.className =
        "user" +
        (
          selectedUser === u.username
            ? " active"
            : ""
        );


      const avatar =
        document.createElement("div");

      avatar.className = "avatar";

      avatar.textContent =
        u.username
          .charAt(0)
          .toUpperCase();


      if(u.online){

        const dot =
          document.createElement("span");

        dot.className = "online";

        avatar.appendChild(dot);

      }


      const info =
        document.createElement("div");

      info.className =
        "user-info";


      const name =
        document.createElement("div");

      name.className =
        "user-name";

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


/* فتح محادثة */

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


  if(
    socket &&
    socket.readyState === WebSocket.OPEN
  ){

    socket.send(
      JSON.stringify({
        type:"history",
        with:user
      })
    );

  }

}


function closeChat(){

  document.getElementById("app")
    .classList.remove("chat-open");

}


/* WebSocket */

function connectSocket(){

  if(!token) return;


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

    loadUsers();

  };


  socket.onmessage = event => {

    let data;

    try{

      data =
        JSON.parse(event.data);

    }catch(e){

      return;

    }


    if(data.type === "users"){

      users =
        data.users || [];

      renderUsers();

      return;

    }


    if(data.type === "history"){

      showHistory(
        data.messages || []
      );

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

    }

  };


  socket.onclose = () => {

    if(token){

      setTimeout(
        connectSocket,
        3000
      );

    }

  };

}


/* إرسال رسالة */

function sendMessage(){

  if(!selectedUser) return;

  const input =
    document.getElementById(
      "messageInput"
    );

  const text =
    input.value.trim();

  if(!text) return;


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


  input.value = "";

}


function handleKey(event){

  if(event.key === "Enter"){

    event.preventDefault();

    sendMessage();

  }

}


/* استقبال */

function receiveMessage(data){

  if(
    data.from !== selectedUser &&
    data.to !== selectedUser
  ){

    return;

  }

  addMessage(data);

}


function showHistory(messages){

  const box =
    document.getElementById(
      "messages"
    );

  box.innerHTML = "";


  if(messages.length === 0){

    box.innerHTML =
      '<div class="empty">لا توجد رسائل بعد</div>';

    return;

  }


  messages.forEach(
    addMessage
  );

}


function addMessage(message){

  const box =
    document.getElementById(
      "messages"
    );


  const empty =
    box.querySelector(".empty");

  if(empty){

    empty.remove();

  }


  const div =
    document.createElement("div");

  div.className =
    "message " +
    (
      message.from === username
        ? "mine"
        : "theirs"
    );


  const text =
    document.createElement("div");

  text.textContent =
    message.text;


  const time =
    document.createElement("div");

  time.className =
    "message-time";

  time.textContent =
    message.time || "";


  div.appendChild(text);
  div.appendChild(time);

  box.appendChild(div);

  box.scrollTop =
    box.scrollHeight;

}


/* تشغيل تلقائي */

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

    this.clients = new Map();

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

  }


  async hashPassword(password){

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
          salt:encoder.encode(
            "BOLA11_PASSWORD_SALT"
          ),
          iterations:100000,
          hash:"SHA-256"
        },
        key,
        256
      );


    return Array
      .from(new Uint8Array(bits))
      .map(
        b =>
          b.toString(16)
           .padStart(2,"0")
      )
      .join("");

  }


  makeToken(){

    const bytes =
      new Uint8Array(32);

    crypto.getRandomValues(bytes);

    return Array
      .from(bytes)
      .map(
        b =>
          b.toString(16)
           .padStart(2,"0")
      )
      .join("");

  }


  getUserFromToken(token){

    if(!token) return null;


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


  async fetch(request){

    const url =
      new URL(request.url);


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


    /* إنشاء حساب */

    if(
      request.method === "POST" &&
      url.pathname === "/api/register"
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


        if(username.length < 3){

          return Response.json(
            {
              error:
                "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"
            },
            {status:400}
          );

        }


        if(password.length < 4){

          return Response.json(
            {
              error:
                "كلمة السر يجب أن تكون 4 أحرف على الأقل"
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


        const hash =
          await this.hashPassword(
            password
          );


        this.ctx.storage.sql.exec(
          `
          INSERT INTO accounts
          (username,password_hash,created_at)
          VALUES (?,?,?)
          `,
          username,
          hash,
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
          username:username,
          token:token
        });


      }catch(error){

        console.error(
          "REGISTER ERROR:",
          error
        );


        return Response.json(
          {
            error:
              "حدث خطأ أثناء إنشاء الحساب: " +
              String(error.message || error)
          },
          {status:500}
        );

      }

    }


    /* تسجيل الدخول */

    if(
      request.method === "POST" &&
      url.pathname === "/api/login"
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


        const hash =
          await this.hashPassword(
            password
          );


        if(
          hash !==
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
          username:username,
          token:token
        });


      }catch(error){

        console.error(
          "LOGIN ERROR:",
          error
        );


        return Response.json(
          {
            error:
              "حدث خطأ أثناء تسجيل الدخول"
          },
          {status:500}
        );

      }

    }


    /* تسجيل الخروج */

    if(
      request.method === "POST" &&
      url.pathname === "/api/logout"
    ){

      const auth =
        request.headers.get(
          "Authorization"
        ) || "";


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


    /* المستخدمين */

    if(
      request.method === "GET" &&
      url.pathname === "/api/users"
    ){

      const auth =
        request.headers.get(
          "Authorization"
        ) || "";


      const token =
        auth.startsWith("Bearer ")
          ? auth.slice(7)
          : null;


      const current =
        this.getUserFromToken(
          token
        );


      if(!current){

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
          ORDER BY username
          `
        ).toArray();


      return Response.json(
        rows
          .filter(
            u =>
              u.username !== current
          )
          .map(
            u => ({
              username:u.username,
              online:
                this.clients.has(
                  u.username
                )
            })
          )
      );

    }


    /* WebSocket */

    if(url.pathname === "/ws"){

      return this.websocket(
        request
      );

    }


    return new Response(
      "Not Found",
      {status:404}
    );

  }


  async websocket(request){

    const url =
      new URL(request.url);

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


    this.clients.set(
      username,
      server
    );


    server.addEventListener(
      "message",
      event => {

        this.webSocketMessage(
          server,
          username,
          event.data
        );

      }
    );


    server.addEventListener(
      "close",
      () => {

        if(
          this.clients.get(username)
          === server
        ){

          this.clients.delete(
            username
          );

        }

        this.broadcastUsers();

      }
    );


    this.sendUsersTo(
      server
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


    if(data.type === "history"){

      const other =
        String(
          data.with || ""
        );


      if(!other) return;


      const rows =
        this.ctx.storage.sql.exec(
          `
          SELECT
            id,
            sender,
            receiver,
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
          other,
          other,
          username
        ).toArray();


      const messages =
        rows.map(m => ({

          id:m.id,

          from:m.sender,

          to:m.receiver,

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
          messages:messages
        })
      );

      return;

    }


    if(data.type === "message"){

      const to =
        String(
          data.to || ""
        ).trim();

      const text =
        String(
          data.text || ""
        ).trim();


      if(!to || !text) return;


      const exists =
        this.ctx.storage.sql.exec(
          `
          SELECT username
          FROM accounts
          WHERE username = ?
          LIMIT 1
          `,
          to
        ).toArray();


      if(exists.length === 0){

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
          SELECT id
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

        to:to,

        text:text,

        time:new Date()
          .toLocaleTimeString(
            "ar-EG",
            {
              hour:"2-digit",
              minute:"2-digit"
            }
          )

      };


      try{

        socket.send(
          JSON.stringify(message)
        );

      }catch(e){}


      this.sendToUser(
        to,
        message
      );

      return;

    }


    if(data.type === "typing"){

      if(!data.to) return;


      this.sendToUser(
        data.to,
        {
          type:"typing",
          from:username,
          typing:!!data.typing
        }
      );

    }

  }


  sendToUser(
    username,
    data
  ){

    const socket =
      this.clients.get(
        username
      );


    if(!socket) return;


    try{

      socket.send(
        JSON.stringify(data)
      );

    }catch(e){}

  }


  sendUsersTo(socket){

    const rows =
      this.ctx.storage.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username
        `
      ).toArray();


    const users =
      rows.map(
        u => ({
          username:u.username,
          online:
            this.clients.has(
              u.username
            )
        })
      );


    try{

      socket.send(
        JSON.stringify({
          type:"users",
          users:users
        })
      );

    }catch(e){}

  }


  broadcastUsers(){

    const rows =
      this.ctx.storage.sql.exec(
        `
        SELECT username
        FROM accounts
        ORDER BY username
        `
      ).toArray();


    const users =
      rows.map(
        u => ({
          username:u.username,
          online:
            this.clients.has(
              u.username
            )
        })
      );


    const message =
      JSON.stringify({
        type:"users",
        users:users
      });


    for(
      const socket
      of this.clients.values()
    ){

      try{

        socket.send(message);

      }catch(e){}

    }

  }

}


export default {

  async fetch(
    request,
    env
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

};
