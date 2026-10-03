import { DurableObject } from "cloudflare:workers";

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>دردشة</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#e5ddd5}
button{border:0;border-radius:10px;padding:12px 18px;background:#128c7e;color:white;font-size:16px}
input{width:100%;padding:13px;margin:7px 0;border:1px solid #ccc;border-radius:10px;font-size:16px}
.auth{max-width:420px;margin:60px auto;background:white;padding:25px;border-radius:18px}
.auth h1{text-align:center}
.error{color:#c00;margin:8px 0}
#app{display:none}
header{background:#075e54;color:white;padding:15px;font-size:21px;font-weight:bold}
.top{background:white;padding:10px;display:flex;justify-content:space-between}
#users{background:#f5f5f5;padding:10px}
.user{display:inline-block;background:white;padding:7px 12px;border-radius:15px;margin:3px}
#messages{height:calc(100vh - 205px);overflow:auto;padding:15px}
.msg{background:white;width:max-content;max-width:82%;padding:10px 14px;margin:8px 0;border-radius:14px}
.name{color:#075e54;font-weight:bold;font-size:13px;margin-bottom:4px}
#bar{position:fixed;bottom:0;left:0;right:0;background:white;padding:10px;display:flex;gap:8px}
#input{flex:1;margin:0}
#send{border-radius:50%;width:48px;padding:0}
</style>
</head>
<body>

<div id="auth">
  <div class="auth">
    <h1>💬 دردشة</h1>

    <input id="username" placeholder="اسم المستخدم">
    <input id="password" type="password" placeholder="كلمة المرور">

    <button id="register" style="width:100%">إنشاء حساب</button>
    <br><br>
    <button id="login" style="width:100%">تسجيل الدخول</button>

    <div id="authMsg" class="error"></div>
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
    <input id="input" placeholder="اكتب رسالة..." autocomplete="off">
    <button id="send">➤</button>
  </div>
</div>

<script>
const auth=document.getElementById("auth");
const app=document.getElementById("app");
const username=document.getElementById("username");
const password=document.getElementById("password");
const authMsg=document.getElementById("authMsg");
const messages=document.getElementById("messages");
const input=document.getElementById("input");
const send=document.getElementById("send");
const userList=document.getElementById("userList");
const me=document.getElementById("me");

let token=localStorage.getItem("chatToken");
let currentUser=localStorage.getItem("chatUser");
let ws=null;

function showError(text){
  authMsg.textContent=text;
}

async function api(path, body){
  const r=await fetch(path,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });

  const data=await r.json().catch(()=>({}));
  return {ok:r.ok,data};
}

async function register(){
  const u=username.value.trim();
  const p=password.value;

  if(u.length<3){
    showError("اسم المستخدم لازم يكون 3 حروف على الأقل");
    return;
  }

  if(p.length<6){
    showError("كلمة المرور لازم تكون 6 أحرف على الأقل");
    return;
  }

  const result=await api("/api/register",{
    username:u,
    password:p
  });

  if(!result.ok){
    showError(result.data.error||"حصل خطأ");
    return;
  }

  showError("✅ تم إنشاء الحساب، سجّل الدخول الآن");
  password.value="";
}

async function login(){
  const u=username.value.trim();
  const p=password.value;

  if(!u || !p){
    showError("اكتب اسم المستخدم وكلمة المرور");
    return;
  }

  const result=await api("/api/login",{
    username:u,
    password:p
  });

  if(!result.ok){
    showError(result.data.error||"بيانات الدخول غير صحيحة");
    return;
  }

  token=result.data.token;
  currentUser=result.data.username;

  localStorage.setItem("chatToken",token);
  localStorage.setItem("chatUser",currentUser);

  openChat();
}

function openChat(){
  auth.style.display="none";
  app.style.display="block";
  me.textContent=currentUser;
  connectWebSocket();
}

function connectWebSocket(){
  if(ws) try{ws.close()}catch{}

  const protocol=location.protocol==="https:"?"wss://":"ws://";

  ws=new WebSocket(
    protocol+location.host+"/ws?token="+encodeURIComponent(token)
  );

  ws.onopen=()=>{
    input.focus();
  };

  ws.onmessage=e=>{
    try{
      const d=JSON.parse(e.data);

      if(d.type==="message"){
        addMessage(d.name,d.text);
      }

      if(d.type==="users"){
        userList.innerHTML="";
        d.users.forEach(user=>{
          const el=document.createElement("span");
          el.className="user";
          el.textContent="🟢 "+user;
          userList.appendChild(el);
        });
      }

      if(d.type==="error"){
        alert(d.message||"حصل خطأ");
      }
    }catch{}
  };

  ws.onclose=()=>{
    setTimeout(()=>{
      if(token) connectWebSocket();
    },2000);
  };
}

function addMessage(n,t){
  const box=document.createElement("div");
  box.className="msg";

  const ne=document.createElement("div");
  ne.className="name";
  ne.textContent=n;

  const te=document.createElement("div");
  te.textContent=t;

  box.append(ne,te);
  messages.appendChild(box);
  messages.scrollTop=messages.scrollHeight;
}

function sendMessage(){
  const text=input.value.trim();

  if(!text)return;

  if(!ws || ws.readyState!==WebSocket.OPEN){
    alert("الاتصال غير متاح");
    return;
  }

  ws.send(JSON.stringify({
    type:"message",
    text:text
  }));

  input.value="";
  input.focus();
}

async function logout(){
  if(ws) try{ws.close()}catch{}

  if(token){
    await api("/api/logout",{token});
  }

  localStorage.removeItem("chatToken");
  localStorage.removeItem("chatUser");

  token=null;
  currentUser=null;

  app.style.display="none";
  auth.style.display="block";
  password.value="";
}

document.getElementById("register").onclick=register;
document.getElementById("login").onclick=login;
document.getElementById("logout").onclick=logout;
send.onclick=sendMessage;

input.onkeydown=e=>{
  if(e.key==="Enter")sendMessage();
};

if(token && currentUser){
  openChat();
}
</script>

</body>
</html>`;

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{"content-type":"application/json;charset=UTF-8"}
  });
}

function bytesToBase64(bytes){
  let binary="";
  for(const byte of bytes) binary+=String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(text){
  const binary=atob(text);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++){
    bytes[i]=binary.charCodeAt(i);
  }
  return bytes;
}

async function hashPassword(password,saltBytes){
  const key=await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits=await crypto.subtle.deriveBits(
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
  const bytes=new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function randomToken(){
  return bytesToBase64(randomBytes(32))
    .replace(/\+/g,"-")
    .replace(/\//g,"_")
    .replace(/=/g,"");
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);

    if(url.pathname==="/" && request.method==="GET"){
      return new Response(HTML,{
        headers:{"content-type":"text/html;charset=UTF-8"}
      });
    }

    if(
      url.pathname==="/ws" &&
      request.headers.get("Upgrade")?.toLowerCase()==="websocket"
    ){
      const token=url.searchParams.get("token");

      if(!token){
        return new Response("Unauthorized",{status:401});
      }

      const room=env.CHAT_ROOM.getByName("main");

      return room.fetch(
        new Request(
          new URL("/websocket?token="+encodeURIComponent(token),request.url),
          request
        )
      );
    }

    if(
      url.pathname==="/api/register" ||
      url.pathname==="/api/login" ||
      url.pathname==="/api/logout"
    ){
      const room=env.CHAT_ROOM.getByName("main");
      return room.fetch(request);
    }

    return new Response("Not Found",{status:404});
  }
};

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
    `);

    this.sessions=new Map();

    for(const ws of this.ctx.getWebSockets()){
      const data=ws.deserializeAttachment();

      if(data?.username){
        this.sessions.set(ws,data);
      }
    }
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

    if(
      url.pathname==="/websocket" &&
      request.headers.get("Upgrade")?.toLowerCase()==="websocket"
    ){
      const token=url.searchParams.get("token");

      const username=this.getUsernameFromToken(token);

      if(!username){
        return new Response("Unauthorized",{status:401});
      }

      const pair=new WebSocketPair();
      const client=pair[0];
      const server=pair[1];

      this.ctx.acceptWebSocket(server);

      server.serializeAttachment({username});

      this.sessions.set(server,{username});

      this.broadcastUsers();

      return new Response(null,{
        status:101,
        webSocket:client
      });
    }

    return new Response("Not Found",{status:404});
  }

  async register(request){
    let data;

    try{
      data=await request.json();
    }catch{
      return json({error:"بيانات غير صحيحة"},400);
    }

    const username=String(data.username||"").trim();
    const password=String(data.password||"");

    if(!/^[a-zA-Z0-9_\\u0600-\\u06FF]{3,20}$/.test(username)){
      return json({
        error:"اسم المستخدم: 3 إلى 20 حرف أو رقم أو _"
      },400);
    }

    if(password.length<6){
      return json({
        error:"كلمة المرور لازم تكون 6 أحرف على الأقل"
      },400);
    }

    const existing=this.ctx.storage.sql
      .exec(
        "SELECT username FROM accounts WHERE username=?",
        username
      )
      .toArray();

    if(existing.length){
      return json({error:"اسم المستخدم موجود بالفعل"},409);
    }

    const salt=randomBytes(16);
    const hash=await hashPassword(password,salt);

    this.ctx.storage.sql.exec(
      `INSERT INTO accounts(username,password_hash,salt,created_at)
       VALUES(?,?,?,?)`,
      username,
      bytesToBase64(hash),
      bytesToBase64(salt),
      Date.now()
    );

    return json({ok:true});
  }

  async login(request){
    let data;

    try{
      data=await request.json();
    }catch{
      return json({error:"بيانات غير صحيحة"},400);
    }

    const username=String(data.username||"").trim();
    const password=String(data.password||"");

    const rows=this.ctx.storage.sql
      .exec(
        `SELECT username,password_hash,salt
         FROM accounts
         WHERE username=?`,
        username
      )
      .toArray();

    if(!rows.length){
      return json({error:"اسم المستخدم أو كلمة المرور غير صحيحة"},401);
    }

    const account=rows[0];

    const salt=base64ToBytes(account.salt);
    const hash=await hashPassword(password,salt);

    if(bytesToBase64(hash)!==account.password_hash){
      return json({error:"اسم المستخدم أو كلمة المرور غير صحيحة"},401);
    }

    const token=randomToken();
    const expires=Date.now()+30*24*60*60*1000;

    this.ctx.storage.sql.exec(
      `INSERT INTO sessions(token,username,expires_at)
       VALUES(?,?,?)`,
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

  async logout(request){
    let data;

    try{
      data=await request.json();
    }catch{
      return json({ok:true});
    }

    const token=String(data.token||"");

    if(token){
      this.ctx.storage.sql.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );
    }

    return json({ok:true});
  }

  getUsernameFromToken(token){
    if(!token)return null;

    const rows=this.ctx.storage.sql
      .exec(
        `SELECT username,expires_at
         FROM sessions
         WHERE token=?`,
        token
      )
      .toArray();

    if(!rows.length)return null;

    const session=rows[0];

    if(Number(session.expires_at)<Date.now()){
      this.ctx.storage.sql.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );
      return null;
    }

    return session.username;
  }

  broadcastUsers(){
    const users=[...new Set(
      [...this.sessions.values()].map(x=>x.username)
    )];

    const message=JSON.stringify({
      type:"users",
      users
    });

    for(const ws of this.ctx.getWebSockets()){
      try{
        ws.send(message);
      }catch{}
    }
  }

  async webSocketMessage(ws,message){
    const session=this.sessions.get(ws) ||
      ws.deserializeAttachment();

    if(!session?.username)return;

    try{
      const data=JSON.parse(message);

      if(data.type!=="message")return;

      const text=String(data.text||"").trim();

      if(!text)return;

      const outgoing=JSON.stringify({
        type:"message",
        name:session.username,
        text:text.slice(0,2000)
      });

      for(const client of this.ctx.getWebSockets()){
        try{
          client.send(outgoing);
        }catch{}
      }
    }catch{}
  }

  async webSocketClose(ws,code,reason){
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
