import { DurableObject } from "cloudflare:workers";

const HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>الشات</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#e5ddd5}
header{background:#075e54;color:#fff;padding:16px;text-align:center;font-size:22px;font-weight:700}
#messages{height:calc(100vh - 130px);overflow:auto;padding:15px}
.msg{background:#fff;width:max-content;max-width:82%;padding:10px 14px;margin:8px 0;border-radius:14px}
.name{color:#075e54;font-weight:700;font-size:13px;margin-bottom:4px}
#bar{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:10px;display:flex;gap:8px}
#input{flex:1;border:1px solid #ccc;border-radius:22px;padding:12px 16px;font-size:16px;outline:0}
button{border:0;border-radius:50%;width:48px;height:48px;background:#128c7e;color:#fff;font-size:20px;cursor:pointer}
</style>
</head>
<body>

<header>💬 الشات</header>

<div id="messages"></div>

<div id="bar">
<input id="input" placeholder="اكتب رسالة..." autocomplete="off">
<button id="send">➤</button>
</div>

<script>
const messages=document.getElementById("messages");
const input=document.getElementById("input");
const send=document.getElementById("send");

let name=localStorage.getItem("chatName");

if(!name){
  name=(prompt("اكتب اسمك:")||"مستخدم").trim()||"مستخدم";
  localStorage.setItem("chatName",name);
}

const ws=new WebSocket(
  (location.protocol==="https:"?"wss://":"ws://")
  +location.host+"/ws"
);

ws.onmessage=e=>{
  try{
    const d=JSON.parse(e.data);
    if(d.type==="message"){
      addMessage(d.name,d.text);
    }
  }catch{}
};

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

  if(ws.readyState!==WebSocket.OPEN){
    alert("الاتصال غير متاح");
    return;
  }

  ws.send(JSON.stringify({
    type:"message",
    name:name,
    text:text
  }));

  input.value="";
  input.focus();
}

send.onclick=sendMessage;

input.onkeydown=e=>{
  if(e.key==="Enter")sendMessage();
};
</script>

</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response(HTML, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    if (
      url.pathname === "/ws" &&
      request.headers.get("Upgrade")?.toLowerCase() === "websocket"
    ) {
      const id = env.CHAT_ROOM.idFromName("main");
      const room = env.CHAT_ROOM.get(id);

      return room.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};

export class ChatRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }

  async fetch(request) {
    if (
      request.headers.get("Upgrade")?.toLowerCase() !== "websocket"
    ) {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(ws, message) {
    try {
      const data = JSON.parse(message);

      if (data.type !== "message") return;

      const outgoing = JSON.stringify({
        type: "message",
        name: String(data.name || "مستخدم").slice(0, 50),
        text: String(data.text || "").slice(0, 2000)
      });

      const sockets = this.ctx.getWebSockets();

      for (const socket of sockets) {
        try {
          socket.send(outgoing);
        } catch {}
      }
    } catch {}
  }

  async webSocketClose(ws, code, reason) {
    try {
      ws.close(code, reason);
    } catch {}
  }
       }
