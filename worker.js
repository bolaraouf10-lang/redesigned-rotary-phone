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
button{
  border:0;
  border-radius:10px;
  padding:12px 18px;
  background:#128c7e;
  color:white;
  font-size:16px;
  cursor:pointer;
}
input{
  width:100%;
  padding:13px;
  margin:7px 0;
  border:1px solid #ccc;
  border-radius:10px;
  font-size:16px;
}
.auth{
  max-width:420px;
  margin:60px auto;
  background:white;
  padding:25px;
  border-radius:18px;
}
.auth h1{text-align:center}
#authMsg{
  margin:12px 0;
  min-height:24px;
}
.error{color:#c00}
.success{color:#087f23}
#app{display:none}
header{
  background:#075e54;
  color:white;
  padding:15px;
  font-size:21px;
  font-weight:bold;
}
.top{
  background:white;
  padding:10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
#users{
  background:#f5f5f5;
  padding:10px;
}
.user{
  display:inline-block;
  background:white;
  padding:7px 12px;
  border-radius:15px;
  margin:3px;
}
#messages{
  height:calc(100vh - 205px);
  overflow:auto;
  padding:15px;
}
.msg{
  background:white;
  width:max-content;
  max-width:82%;
  padding:10px 14px;
  margin:8px 0;
  border-radius:14px;
}
.name{
  color:#075e54;
  font-weight:bold;
  font-size:13px;
  margin-bottom:4px;
}
#bar{
  position:fixed;
  bottom:0;
  left:0;
  right:0;
  background:white;
  padding:10px;
  display:flex;
  gap:8px;
}
#input{
  flex:1;
  margin:0;
}
#send{
  border-radius:50%;
  width:48px;
  padding:0;
}
#status{
  font-size:13px;
  color:#777;
  margin-top:5px;
}
</style>
</head>

<body>

<div id="auth">
  <div class="auth">
    <h1>💬 دردشة</h1>

    <input id="username" placeholder="اسم المستخدم">
    <input id="password" type="password" placeholder="كلمة المرور">

    <button id="register" style="width:100%">
      إنشاء حساب
    </button>

    <br><br>

    <button id="login" style="width:100%">
      تسجيل الدخول
    </button>

    <div id="authMsg"></div>
  </div>
</div>

<div id="app">

  <header>💬 دردشة</header>

  <div class="top">
    <span>👤 <b id="me"></b></span>
    <button id="logout">خروج</button>
  </div>

  <div id="users">
    <b>🟢 المتصلون:</b>
    <div id="userList"></div>
  </div>

  <div id="messages"></div>

  <div id="bar">
    <input
      id="input"
      placeholder="اكتب رسالة..."
      autocomplete="off"
    >
    <button id="send">➤</button>
  </div>

</div>

<script>

const auth = document.getElementById("auth");
const app = document.getElementById("app");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const authMsg = document.getElementById("authMsg");

const messages = document.getElementById("messages");
const input = document.getElementById("input");
const send = document.getElementById("send");

const userList = document.getElementById("userList");
const me = document.getElementById("me");

let token = localStorage.getItem("chatToken");
let currentUser = localStorage.getItem("chatUser");
let ws = null;

function showError(text){
  authMsg.className = "error";
  authMsg.textContent = text;
}

function showSuccess(text){
  authMsg.className = "success";
  authMsg.textContent = text;
}

async function api(path, body){

  try{

    const response = await fetch(path,{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body:JSON.stringify(body)
    });

    const text = await response.text();

    let data = {};

    try{
      data = JSON.parse(text);
    }catch{
      data = {};
    }

    if(!response.ok){

      return {
        ok:false,
        data:data,
        status:response.status,
        raw:text
      };
    }

    return {
      ok:true,
      data:data,
      status:response.status,
      raw:text
    };

  }catch(error){

    return {
      ok:false,
      data:{
        error:"مشكلة اتصال: "+error.message
      },
      status:0,
      raw:""
    };

  }
}

async function register(){

  const u = usernameInput.value.trim();
  const p = passwordInput.value;

  if(u.length < 3){
    showError("اسم المستخدم لازم يكون 3 حروف على الأقل");
    return;
  }

  if(u.length > 20){
    showError("اسم المستخدم طويل جدًا");
    return;
  }

  if(p.length < 6){
    showError("كلمة المرور لازم تكون 6 أحرف على الأقل");
    return;
  }

  showSuccess("⏳ جاري إنشاء الحساب...");

  const result = await api("/api/register",{
    username:u,
    password:p
  });

  if(!result.ok){

    showError(
      result.data?.error ||
      "حصل خطأ رقم "+result.status
    );

    return;
  }

  showSuccess("✅ تم إنشاء الحساب! سجل الدخول الآن");

  passwordInput.value = "";
}

async function login(){

  const u = usernameInput.value.trim();
  const p = passwordInput.value;

  if(!u || !p){
    showError("اكتب اسم المستخدم وكلمة المرور");
    return;
  }

  showSuccess("⏳ جاري تسجيل الدخول...");

  const result = await api("/api/login",{
    username:u,
    password:p
  });

  if(!result.ok){

    showError(
      result.data?.error ||
      "حصل خطأ رقم "+result.status
    );

    return;
  }

  if(!result.data.token){

    showError("تم الدخول لكن لم يتم استلام رمز الدخول");
    return;
  }

  token = result.data.token;
  currentUser = result.data.username;

  localStorage.setItem("chatToken",token);
  localStorage.setItem("chatUser",currentUser);

  openChat();
}

function openChat(){

  auth.style.display = "none";
  app.style.display = "block";

  me.textContent = currentUser;

  connectWebSocket();
}

function connectWebSocket(){

  if(!token){
    return;
  }

  if(ws){

    try{
      ws.close();
    }catch{}

  }

  const protocol =
    location.protocol === "https:"
      ? "wss://"
      : "ws://";

  const url =
    protocol +
    location.host +
    "/ws?token=" +
    encodeURIComponent(token);

  ws = new WebSocket(url);

  ws.onopen = function(){

    input.focus();

  };

  ws.onmessage = function(event){

    try{

      const data = JSON.parse(event.data);

      if(data.type === "message"){

        addMessage(
          data.name,
          data.text
        );

      }

      if(data.type === "users"){

        userList.innerHTML = "";

        data.users.forEach(function(user){

          const el =
            document.createElement("span");

          el.className = "user";
          el.textContent = "🟢 " + user;

          userList.appendChild(el);

        });

      }

      if(data.type === "error"){

        alert(
          data.message ||
          "حصل خطأ"
        );

      }

    }catch{}

  };

  ws.onclose = function(){

    setTimeout(function(){

      if(token){
        connectWebSocket();
      }

    },2000);

  };

}

function addMessage(name,text){

  const box =
    document.createElement("div");

  box.className = "msg";

  const nameElement =
    document.createElement("div");

  nameElement.className = "name";
  nameElement.textContent = name;

  const textElement =
    document.createElement("div");

  textElement.textContent = text;

  box.append(
    nameElement,
    textElement
  );

  messages.appendChild(box);

  messages.scrollTop =
    messages.scrollHeight;
}

function sendMessage(){

  const text =
    input.value.trim();

  if(!text){
    return;
  }

  if(
    !ws ||
    ws.readyState !== WebSocket.OPEN
  ){

    alert("الاتصال غير متاح");
    return;
  }

  ws.send(
    JSON.stringify({
      type:"message",
      text:text
    })
  );

  input.value = "";

  input.focus();
}

async function logout(){

  if(ws){

    try{
      ws.close();
    }catch{}

  }

  if(token){

    await api(
      "/api/logout",
      {token:token}
    );

  }

  localStorage.removeItem("chatToken");
  localStorage.removeItem("chatUser");

  token = null;
  currentUser = null;
  ws = null;

  messages.innerHTML = "";
  userList.innerHTML = "";

  app.style.display = "none";
  auth.style.display = "block";

  usernameInput.value = "";
  passwordInput.value = "";

  showSuccess("تم تسجيل الخروج");
}

document.getElementById("register").onclick =
  register;

document.getElementById("login").onclick =
  login;

document.getElementById("logout").onclick =
  logout;

send.onclick =
  sendMessage;

input.onkeydown = function(e){

  if(e.key === "Enter"){
    sendMessage();
  }

};

passwordInput.onkeydown = function(e){

  if(e.key === "Enter"){
    login();
  }

};

if(token && currentUser){

  openChat();

}

</script>

</body>
</html>`;


function json(data,status=200){

  return new Response(
    JSON.stringify(data),
    {
      status:status,
      headers:{
        "content-type":
          "application/json;charset=UTF-8"
      }
    }
  );

}


function bytesToBase64(bytes){

  let binary = "";

  for(const byte of bytes){
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);

}


function base64ToBytes(text){

  const binary = atob(text);

  const bytes =
    new Uint8Array(binary.length);

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


async function hashPassword(
  password,
  saltBytes
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
        salt:saltBytes,
        iterations:120000,
        hash:"SHA-256"
      },
      key,
      256
    );

  return new Uint8Array(bits);

}


function randomBytes(length){

  const bytes =
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


export default {

  async fetch(request,env){

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
            "content-type":
              "text/html;charset=UTF-8"
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


    if(
      url.pathname === "/api/register" ||
      url.pathname === "/api/login" ||
      url.pathname === "/api/logout"
    ){

      const room =
        env.CHAT_ROOM.getByName("main");

      return room.fetch(request);

    }


    return new Response(
      "Not Found",
      {status:404}
    );

  }

};


export class ChatRoom
  extends DurableObject{

  constructor(ctx,env){

    super(ctx,env);

    this.sessions = new Map();

    try{

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
      `);

    }catch(error){

      this.dbError =
        String(error);

    }


    for(
      const ws of this.ctx.getWebSockets()
    ){

      try{

        const data =
          ws.deserializeAttachment();

        if(data?.username){

          this.sessions.set(
            ws,
            data
          );

        }

      }catch{}

    }

  }


  async fetch(request){

    const url =
      new URL(request.url);


    if(
      url.pathname === "/api/register"
    ){

      return this.register(request);

    }


    if(
      url.pathname === "/api/login"
    ){

      return this.login(request);

    }


    if(
      url.pathname === "/api/logout"
    ){

      return this.logout(request);

    }


    if(
      url.pathname === "/websocket" &&
      request.headers
        .get("Upgrade")
        ?.toLowerCase() === "websocket"
    ){

      return this.handleWebSocket(
        request
      );

    }


    return new Response(
      "Not Found",
      {status:404}
    );

  }


  async register(request){

    if(this.dbError){

      return json(
        {
          error:
            "خطأ في قاعدة البيانات: "+
            this.dbError
        },
        500
      );

    }


    let data;

    try{

      data =
        await request.json();

    }catch{

      return json(
        {
          error:"بيانات غير صحيحة"
        },
        400
      );

    }


    const username =
      String(
        data.username || ""
      ).trim();

    const password =
      String(
        data.password || ""
      );


    if(
      !/^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/
        .test(username)
    ){

      return json(
        {
          error:
            "اسم المستخدم لازم يكون من 3 إلى 20 حرف أو رقم أو _"
        },
        400
      );

    }


    if(password.length < 6){

      return json(
        {
          error:
            "كلمة المرور لازم تكون 6 أحرف على الأقل"
        },
        400
      );

    }


    try{

      const existing =
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


      const salt =
        randomBytes(16);

      const hash =
        await hashPassword(
          password,
          salt
        );


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
        bytesToBase64(hash),
        bytesToBase64(salt),
        Date.now()
      );


      return json({
        ok:true
      });


    }catch(error){

      return json(
        {
          error:
            "خطأ أثناء إنشاء الحساب: "+
            String(error)
        },
        500
      );

    }

  }


  async login(request){

    if(this.dbError){

      return json(
        {
          error:
            "خطأ في قاعدة البيانات: "+
            this.dbError
        },
        500
      );

    }


    let data;

    try{

      data =
        await request.json();

    }catch{

      return json(
        {
          error:"بيانات غير صحيحة"
        },
        400
      );

    }


    const username =
      String(
        data.username || ""
      ).trim();

    const password =
      String(
        data.password || ""
      );


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


      const account =
        rows[0];


      const salt =
        base64ToBytes(
          account.salt
        );


      const hash =
        await hashPassword(
          password,
          salt
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

      const expires =
        Date.now() +
        30*24*60*60*1000;


      this.ctx.storage.sql.exec(
        `
        INSERT INTO sessions
        (
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
        token:token,
        username:account.username
      });


    }catch(error){

      return json(
        {
          error:
            "خطأ أثناء تسجيل الدخول: "+
            String(error)
        },
        500
      );

    }

  }


  async logout(request){

    try{

      const data =
        await request.json();

      const token =
        String(
          data.token || ""
        );

      if(token){

        this.ctx.storage.sql.exec(
          "DELETE FROM sessions WHERE token=?",
          token
        );

      }

    }catch{}


    return json({
      ok:true
    });

  }


  getUsernameFromToken(token){

    if(!token){
      return null;
    }


    try{

      const rows =
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


      const session =
        rows[0];


      if(
        Number(session.expires_at) <
        Date.now()
      ){

        this.ctx.storage.sql.exec(
          "DELETE FROM sessions WHERE token=?",
          token
        );

        return null;

      }


      return session.username;

    }catch{

      return null;

    }

  }


  async handleWebSocket(request){

    const url =
      new URL(request.url);

    const token =
      url.searchParams.get("token");

    const username =
      this.getUsernameFromToken(token);


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


    server.serializeAttachment({
      username:username
    });


    this.sessions.set(
      server,
      {
        username:username
      }
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


  broadcastUsers(){

    const users =
      [
        ...new Set(
          [...this.sessions.values()]
            .map(
              x => x.username
            )
        )
      ];


    const message =
      JSON.stringify({
        type:"users",
        users:users
      });


    for(
      const ws of this.ctx.getWebSockets()
    ){

      try{

        ws.send(message);

      }catch{}

    }

  }


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


    try{

      const data =
        JSON.parse(message);


      if(
        data.type !== "message"
      ){

        return;

      }


      const text =
        String(
          data.text || ""
        ).trim();


      if(!text){
        return;
      }


      const outgoing =
        JSON.stringify({
          type:"message",
          name:session.username,
          text:text.slice(0,2000)
        });


      for(
        const client of
        this.ctx.getWebSockets()
      ){

        try{

          client.send(
            outgoing
          );

        }catch{}

      }


    }catch{}

  }


  async webSocketClose(
    ws,
    code,
    reason
  ){

    this.sessions.delete(ws);

    this.broadcastUsers();


    try{

      ws.close(
        code,
        reason
      );

    }catch{}

  }


  async webSocketError(ws){

    this.sessions.delete(ws);

    this.broadcastUsers();

  }

}
