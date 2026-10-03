import { DurableObject } from "cloudflare:workers";

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bola11</title>

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

#auth{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.authBox{
  width:100%;
  max-width:400px;
  background:white;
  padding:25px;
  border-radius:18px;
  box-shadow:0 5px 25px #0002;
}

.authBox h1{
  text-align:center;
  margin-top:0;
}

input{
  width:100%;
  padding:13px;
  margin:7px 0;
  border:1px solid #ccc;
  border-radius:10px;
  font-size:16px;
}

button{
  border:0;
  padding:12px 18px;
  border-radius:10px;
  cursor:pointer;
  font-size:15px;
}

.mainBtn{
  width:100%;
  background:#128c7e;
  color:white;
  margin-top:8px;
}

.switchBtn{
  width:100%;
  background:#eee;
  margin-top:8px;
}

.error{
  color:#d00;
  text-align:center;
  min-height:22px;
  margin-top:8px;
}

#app{
  display:none;
  height:100vh;
  flex-direction:column;
}

header{
  height:60px;
  background:#075e54;
  color:white;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 15px;
}

header h2{
  margin:0;
  font-size:20px;
}

.logout{
  background:#ffffff22;
  color:white;
}

.content{
  flex:1;
  display:flex;
  min-height:0;
}

.sidebar{
  width:270px;
  background:#fff;
  border-left:1px solid #ddd;
  overflow-y:auto;
}

.sidebarTitle{
  padding:15px;
  font-weight:bold;
  background:#f5f5f5;
}

.user{
  padding:13px;
  border-bottom:1px solid #eee;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:10px;
}

.user:hover{
  background:#f1f1f1;
}

.user.active{
  background:#d9fdd3;
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

.chat{
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
}

.chatHeader{
  background:#f0f0f0;
  padding:12px 15px;
  border-bottom:1px solid #ddd;
  font-weight:bold;
}

#messages{
  flex:1;
  overflow-y:auto;
  padding:15px;
}

.message{
  max-width:75%;
  padding:9px 12px;
  margin:6px 0;
  border-radius:10px;
  word-wrap:break-word;
}

.mine{
  margin-right:auto;
  background:#d9fdd3;
}

.theirs{
  margin-left:auto;
  background:white;
}

.messageName{
  font-size:12px;
  color:#777;
  margin-bottom:4px;
}

.sendBox{
  display:flex;
  gap:7px;
  padding:10px;
  background:#f0f0f0;
}

.sendBox input{
  margin:0;
  flex:1;
}

.sendBtn{
  background:#128c7e;
  color:white;
}

.empty{
  color:#777;
  text-align:center;
  padding:30px;
}

@media(max-width:700px){
  .sidebar{
    width:110px;
  }

  .user{
    font-size:13px;
    padding:12px 6px;
  }

  .sidebarTitle{
    font-size:13px;
    padding:10px 5px;
  }

  .message{
    max-width:85%;
  }
}
</style>
</head>

<body>

<div id="auth">

  <div class="authBox" id="loginBox">
    <h1>💬 Bola11</h1>

    <input id="loginUser" placeholder="اسم المستخدم">
    <input id="loginPass" type="password" placeholder="كلمة السر">

    <button class="mainBtn" onclick="login()">دخول</button>
    <button class="switchBtn" onclick="showRegister()">إنشاء حساب</button>

    <div id="loginError" class="error"></div>
  </div>

  <div class="authBox" id="registerBox" style="display:none">
    <h1>👤 إنشاء حساب</h1>

    <input id="regUser" placeholder="اسم المستخدم">
    <input id="regPass" type="password" placeholder="كلمة السر">

    <button class="mainBtn" onclick="register()">إنشاء الحساب</button>
    <button class="switchBtn" onclick="showLogin()">لدي حساب بالفعل</button>

    <div id="registerError" class="error"></div>
  </div>

</div>


<div id="app">

  <header>
    <h2>💬 Bola11</h2>
    <button class="logout" onclick="logout()">تسجيل خروج</button>
  </header>

  <div class="content">

    <aside class="sidebar">

      <div class="sidebarTitle">
        👥 المستخدمون
      </div>

      <div id="users">
        جاري تحميل المستخدمين...
      </div>

    </aside>

    <main class="chat">

      <div class="chatHeader" id="chatTitle">
        اختر شخصًا لبدء المحادثة
      </div>

      <div id="messages">
        <div class="empty">
          اختر مستخدمًا من القائمة
        </div>
      </div>

      <div class="sendBox">

        <input
          id="messageInput"
          placeholder="اكتب رسالة..."
          disabled
          onkeydown="if(event.key==='Enter') sendMessage()"
        >

        <button
          class="sendBtn"
          onclick="sendMessage()"
        >
          إرسال
        </button>

      </div>

    </main>

  </div>

</div>


<script>

let token = localStorage.getItem("chatToken");
let username = localStorage.getItem("chatUser");

let socket = null;
let selectedUser = null;
let onlineUsers = new Set();


function showLogin(){
  document.getElementById("loginBox").style.display="block";
  document.getElementById("registerBox").style.display="none";
}


function showRegister(){
  document.getElementById("loginBox").style.display="none";
  document.getElementById("registerBox").style.display="block";
}


async function register(){

  const user=document.getElementById("regUser").value.trim();
  const pass=document.getElementById("regPass").value;
  const error=document.getElementById("registerError");

  error.textContent="";

  if(!user || !pass){
    error.textContent="اكتب اسم المستخدم وكلمة السر";
    return;
  }

  try{

    const res=await fetch("/api/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username:user,
        password:pass
      })
    });

    const data=await res.json();

    if(!res.ok){
      error.textContent=data.error || "فشل إنشاء الحساب";
      return;
    }

    token=data.token;
    username=data.username;

    localStorage.setItem("chatToken",token);
    localStorage.setItem("chatUser",username);

    startApp();

  }catch(e){

    error.textContent="تعذر الاتصال بالخادم";

  }

}


async function login(){

  const user=document.getElementById("loginUser").value.trim();
  const pass=document.getElementById("loginPass").value;
  const error=document.getElementById("loginError");

  error.textContent="";

  if(!user || !pass){
    error.textContent="اكتب اسم المستخدم وكلمة السر";
    return;
  }

  try{

    const res=await fetch("/api/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username:user,
        password:pass
      })
    });

    const data=await res.json();

    if(!res.ok){
      error.textContent=data.error || "بيانات الدخول غير صحيحة";
      return;
    }

    token=data.token;
    username=data.username;

    localStorage.setItem("chatToken",token);
    localStorage.setItem("chatUser",username);

    startApp();

  }catch(e){

    error.textContent="تعذر الاتصال بالخادم";

  }

}


async function logout(){

  try{

    if(token){

      await fetch("/api/logout",{
        method:"POST",
        headers:{
          "Authorization":"Bearer "+token
        }
      });

    }

  }catch(e){}

  if(socket){
    socket.close();
    socket=null;
  }

  localStorage.removeItem("chatToken");
  localStorage.removeItem("chatUser");

  token=null;
  username=null;

  location.reload();

}


function startApp(){

  document.getElementById("auth").style.display="none";
  document.getElementById("app").style.display="flex";

  loadUsers();
  connectSocket();

}


async function loadUsers(){

  const box=document.getElementById("users");

  try{

    const res=await fetch("/api/users",{
      headers:{
        "Authorization":"Bearer "+token
      }
    });

    const data=await res.json();

    if(!res.ok){

      box.innerHTML=
        "<div class='empty'>"+escapeHtml(data.error || "تعذر تحميل المستخدمين")+"</div>";

      return;
    }

    renderUsers(data.users || []);

  }catch(e){

    box.innerHTML=
      "<div class='empty'>تعذر الاتصال</div>";

  }

}


function renderUsers(users){

  const box=document.getElementById("users");

  box.innerHTML="";

  const otherUsers=users.filter(user=>user!==username);

  if(!otherUsers.length){

    box.innerHTML=
      "<div class='empty'>لا يوجد مستخدمون آخرون</div>";

    return;
  }

  otherUsers.forEach(user=>{

    const div=document.createElement("div");

    div.className="user";

    if(user===selectedUser){
      div.classList.add("active");
    }

    const dot=document.createElement("span");

    dot.className="dot";

    if(onlineUsers.has(user)){
      dot.classList.add("online");
    }

    const name=document.createElement("span");

    name.textContent=user;

    div.appendChild(dot);
    div.appendChild(name);

    div.onclick=()=>selectUser(user);

    box.appendChild(div);

  });

}


function selectUser(user){

  selectedUser=user;

  document.getElementById("chatTitle").textContent=
    "💬 "+user;

  document.getElementById("messageInput").disabled=false;

  document.getElementById("messages").innerHTML=
    "<div class='empty'>جاري تحميل المحادثة...</div>";

  renderUsersFromServer();

  requestHistory(user);

}


async function renderUsersFromServer(){

  try{

    const res=await fetch("/api/users",{
      headers:{
        "Authorization":"Bearer "+token
      }
    });

    const data=await res.json();

    if(res.ok){
      renderUsers(data.users || []);
    }

  }catch(e){}

}


function connectSocket(){

  if(!token) return;

  const protocol=
    location.protocol==="https:" ? "wss://" : "ws://";

  socket=new WebSocket(
    protocol+
    location.host+
    "/ws?token="+
    encodeURIComponent(token)
  );

  socket.onopen=()=>{

    console.log("WebSocket connected");

  };


  socket.onmessage=(event)=>{

    try{

      const data=JSON.parse(event.data);

      if(data.type==="users"){

        onlineUsers=new Set(data.users || []);

        renderUsersFromServer();

      }


      if(data.type==="message"){

        if(
          selectedUser &&
          (
            (data.from===username && data.to===selectedUser) ||
            (data.from===selectedUser && data.to===username)
          )
        ){

          showMessage(data);

        }

      }


      if(data.type==="history"){

        if(data.with===selectedUser){

          const box=document.getElementById("messages");

          box.innerHTML="";

          if(!data.messages || data.messages.length===0){

            box.innerHTML=
              "<div class='empty'>لا توجد رسائل بعد</div>";

          }else{

            data.messages.forEach(showMessage);

          }

        }

      }

    }catch(e){

      console.log(e);

    }

  };


  socket.onclose=()=>{

    setTimeout(()=>{

      if(token){
        connectSocket();
      }

    },2000);

  };

}


function requestHistory(user){

  if(!socket || socket.readyState!==WebSocket.OPEN)
    return;

  socket.send(JSON.stringify({
    type:"history",
    with:user
  }));

}


function sendMessage(){

  const input=document.getElementById("messageInput");
  const text=input.value.trim();

  if(!text) return;

  if(!selectedUser){

    alert("اختر شخصًا أولًا");
    return;

  }

  if(!socket || socket.readyState!==WebSocket.OPEN){

    alert("الاتصال غير متاح");
    return;

  }

  socket.send(JSON.stringify({
    type:"message",
    to:selectedUser,
    text:text
  }));

  input.value="";
  input.focus();

}


function showMessage(data){

  const box=document.getElementById("messages");

  const div=document.createElement("div");

  div.className=
    "message "+
    (data.from===username ? "mine" : "theirs");

  const name=document.createElement("div");

  name.className="messageName";

  name.textContent=data.from;

  const text=document.createElement("div");

  text.textContent=data.text;

  div.appendChild(name);
  div.appendChild(text);

  box.appendChild(div);

  box.scrollTop=box.scrollHeight;

}


function escapeHtml(text){

  return String(text)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


if(token && username){

  startApp();

}

</script>

</body>
</html>`;


export default {

  async fetch(request,env){

    const url=new URL(request.url);

    if(url.pathname==="/"){

      return new Response(HTML,{
        headers:{
          "content-type":"text/html;charset=UTF-8"
        }
      });

    }


    if(
      url.pathname==="/api/register" ||
      url.pathname==="/api/login" ||
      url.pathname==="/api/logout" ||
      url.pathname==="/api/users" ||
      url.pathname==="/ws"
    ){

      const id=
        env.CHAT_ROOM.idFromName("main");

      const room=
        env.CHAT_ROOM.get(id);

      return room.fetch(request);

    }


    return new Response("Not Found",{
      status:404
    });

  }

};


export class ChatRoom extends DurableObject{

  constructor(ctx,env){

    super(ctx,env);

    this.ctx=ctx;
    this.sql=ctx.storage.sql;


    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS accounts(
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);


    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sessions(
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);


    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

  }


  async fetch(request){

    const url=new URL(request.url);


    if(url.pathname==="/api/register"){
      return this.register(request);
    }


    if(url.pathname==="/api/login"){
      return this.login(request);
    }


    if(url.pathname==="/api/logout"){
      return this.logout(request);
    }


    if(url.pathname==="/api/users"){
      return this.users(request);
    }


    if(url.pathname==="/ws"){
      return this.websocket(request);
    }


    return new Response("Not Found",{
      status:404
    });

  }


  async hashPassword(password,saltBytes){

    const encoder=new TextEncoder();


    const key=await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );


    const bits=await crypto.subtle.deriveBits(
      {
        name:"PBKDF2",
        salt:saltBytes,
        iterations:100000,
        hash:"SHA-256"
      },
      key,
      256
    );


    return this.bytesToBase64(
      new Uint8Array(bits)
    );

  }


  bytesToBase64(bytes){

    let binary="";

    for(const b of bytes){
      binary+=String.fromCharCode(b);
    }

    return btoa(binary);

  }


  base64ToBytes(str){

    const binary=atob(str);

    const bytes=
      new Uint8Array(binary.length);

    for(let i=0;i<binary.length;i++){
      bytes[i]=binary.charCodeAt(i);
    }

    return bytes;

  }


  randomToken(){

    const bytes=new Uint8Array(32);

    crypto.getRandomValues(bytes);

    return this.bytesToBase64(bytes)
      .replaceAll("+","-")
      .replaceAll("/","_")
      .replaceAll("=","");

  }


  async register(request){

    try{

      const body=await request.json();

      const username=
        String(body.username || "").trim();

      const password=
        String(body.password || "");


      if(username.length<3){

        return Response.json(
          {
            error:
              "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"
          },
          {status:400}
        );

      }


      if(password.length<4){

        return Response.json(
          {
            error:
              "كلمة السر يجب أن تكون 4 أحرف على الأقل"
          },
          {status:400}
        );

      }


      const existsRows=[
        ...this.sql.exec(
          `SELECT username
           FROM accounts
           WHERE username=?`,
          username
        )
      ];


      if(existsRows.length>0){

        return Response.json(
          {
            error:"اسم المستخدم موجود بالفعل"
          },
          {status:409}
        );

      }


      const salt=new Uint8Array(16);

      crypto.getRandomValues(salt);

      const saltText=
        this.bytesToBase64(salt);


      const passwordHash=
        await this.hashPassword(
          password,
          salt
        );


      this.sql.exec(
        `INSERT INTO accounts
         (username,password_hash,salt,created_at)
         VALUES(?,?,?,?)`,
        username,
        passwordHash,
        saltText,
        Date.now()
      );


      const token=
        this.randomToken();


      this.sql.exec(
        `INSERT INTO sessions
         (token,username,expires_at)
         VALUES(?,?,?)`,
        token,
        username,
        Date.now()+
        30*24*60*60*1000
      );


      return Response.json({
        ok:true,
        token,
        username
      });


    }catch(e){

      return Response.json(
        {
          error:
            e.message ||
            "فشل إنشاء الحساب"
        },
        {status:500}
      );

    }

  }


  async login(request){

    try{

      const body=await request.json();

      const username=
        String(body.username || "").trim();

      const password=
        String(body.password || "");


      const accountRows=[
        ...this.sql.exec(
          `SELECT username,password_hash,salt
           FROM accounts
           WHERE username=?`,
          username
        )
      ];


      if(accountRows.length===0){

        return Response.json(
          {
            error:
              "اسم المستخدم أو كلمة السر غير صحيحة"
          },
          {status:401}
        );

      }


      const account=
        accountRows[0];


      const salt=
        this.base64ToBytes(account.salt);


      const hash=
        await this.hashPassword(
          password,
          salt
        );


      if(hash!==account.password_hash){

        return Response.json(
          {
            error:
              "اسم المستخدم أو كلمة السر غير صحيحة"
          },
          {status:401}
        );

      }


      const token=
        this.randomToken();


      this.sql.exec(
        `INSERT INTO sessions
         (token,username,expires_at)
         VALUES(?,?,?)`,
        token,
        username,
        Date.now()+
        30*24*60*60*1000
      );


      return Response.json({
        ok:true,
        token,
        username
      });


    }catch(e){

      return Response.json(
        {
          error:
            e.message ||
            "فشل تسجيل الدخول"
        },
        {status:500}
      );

    }

  }


  async getUserFromToken(request){

    const auth=
      request.headers.get("Authorization") || "";


    if(!auth.startsWith("Bearer ")){

      return null;

    }


    const token=
      auth.slice(7);


    const sessionRows=[
      ...this.sql.exec(
        `SELECT username
         FROM sessions
         WHERE token=?
         AND expires_at>?`,
        token,
        Date.now()
      )
    ];


    if(sessionRows.length===0){
      return null;
    }


    return sessionRows[0].username;

  }


  async users(request){

    const username=
      await this.getUserFromToken(request);


    if(!username){

      return Response.json(
        {
          error:"غير مسجل الدخول"
        },
        {status:401}
      );

    }


    const rows=[
      ...this.sql.exec(
        `SELECT username
         FROM accounts
         ORDER BY username ASC`
      )
    ];


    return Response.json({
      users:
        rows.map(row=>row.username)
    });

  }


  async logout(request){

    const auth=
      request.headers.get("Authorization") || "";


    if(auth.startsWith("Bearer ")){

      const token=
        auth.slice(7);


      this.sql.exec(
        `DELETE FROM sessions
         WHERE token=?`,
        token
      );

    }


    return Response.json({
      ok:true
    });

  }


  async websocket(request){

    const username=
      await this.getUserFromToken(request);


    if(!username){

      return new Response(
        "Unauthorized",
        {status:401}
      );

    }


    const upgrade=
      request.headers.get("Upgrade");


    if(upgrade!=="websocket"){

      return new Response(
        "Expected WebSocket",
        {status:426}
      );

    }


    const pair=
      new WebSocketPair();


    const client=pair[0];
    const server=pair[1];


    this.ctx.acceptWebSocket(server);


    server.serializeAttachment({
      username
    });


    this.broadcastUsers();


    return new Response(null,{
      status:101,
      webSocket:client
    });

  }


  async webSocketMessage(ws,message){

    const attachment=
      ws.deserializeAttachment();


    if(
      !attachment ||
      !attachment.username
    ){

      return;

    }


    let data;


    try{

      data=JSON.parse(message);

    }catch(e){

      return;

    }


    if(data.type==="history"){

      const withUser=
        String(data.with || "");


      if(!withUser){
        return;
      }


      const rows=[
        ...this.sql.exec(
          `SELECT
             sender,
             receiver,
             text,
             created_at
           FROM messages
           WHERE
             (sender=? AND receiver=?)
             OR
             (sender=? AND receiver=?)
           ORDER BY id ASC`,
          attachment.username,
          withUser,
          withUser,
          attachment.username
        )
      ];


      ws.send(JSON.stringify({
        type:"history",
        with:withUser,
        messages:
          rows.map(row=>({
            from:row.sender,
            to:row.receiver,
            text:row.text,
            createdAt:row.created_at
          }))
      }));


      return;

    }


    if(data.type==="message"){

      const to=
        String(data.to || "").trim();

      const text=
        String(data.text || "").trim();


      if(!to || !text){
        return;
      }


      if(text.length>5000){
        return;
      }


      const receiverRows=[
        ...this.sql.exec(
          `SELECT username
           FROM accounts
           WHERE username=?`,
          to
        )
      ];


      if(receiverRows.length===0){
        return;
      }


      const createdAt=
        Date.now();


      this.sql.exec(
        `INSERT INTO messages
         (sender,receiver,text,created_at)
         VALUES(?,?,?,?)`,
        attachment.username,
        to,
        text,
        createdAt
      );


      const packet=
        JSON.stringify({
          type:"message",
          from:attachment.username,
          to:to,
          text:text,
          createdAt:createdAt
        });


      const sockets=
        this.ctx.getWebSockets();


      for(const client of sockets){

        try{

          const info=
            client.deserializeAttachment();


          if(
            info &&
            (
              info.username===
                attachment.username ||
              info.username===to
            )
          ){

            client.send(packet);

          }

        }catch(e){}

      }

    }

  }


  async webSocketClose(ws){

    this.broadcastUsers();

  }


  async webSocketError(ws){

    this.broadcastUsers();

  }


  broadcastUsers(){

    const sockets=
      this.ctx.getWebSockets();


    const users=[];


    for(const ws of sockets){

      try{

        const info=
          ws.deserializeAttachment();


        if(
          info &&
          info.username
        ){

          users.push(info.username);

        }

      }catch(e){}

    }


    const unique=
      [...new Set(users)];


    const packet=
      JSON.stringify({
        type:"users",
        users:unique
      });


    for(const ws of sockets){

      try{

        ws.send(packet);

      }catch(e){}

    }

  }

      }
