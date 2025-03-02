const WebSocket = require('ws');
const express = require('express');
const fs = require("fs");
const aes = require('/app/lib/aes.js')


const app = express();

const port = 3000;


app.get('/', (req, res) => {
  res.sendFile('/app/index.html');
});
app.get('/canvas', (req, res) => {
  res.sendFile('/app/canvas');
});
app.get('/lib/*', (req, res) => {
  res.sendFile('/app'+req.path);
});
app.get('/userdata', (req, res) => {
  res.sendFile('/app/userdata.txt');
});
app.get('/*', (req, res) => {
  res.redirect('https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ea.svg')
});

const server = app.listen(port, () => {
  console.log(`Secure WebSocket server is running on wss://onecanvas.glitch.me:${port}`);
});




let canvasize=200*200*3
let bitcanva=Math.ceil(Math.log2(canvasize))



function readNBits(uint8Array, bitOffset, n) {
  const byteOffset = Math.floor(bitOffset / 8);
  const bitStart = bitOffset % 8;
  const dataView = new DataView(uint8Array.buffer);

  let value = 0;
  for (let i = 0; i < n; i++) {
    const byteIndex = byteOffset + Math.floor((bitStart + i) / 8);
    const bitIndex = (bitStart + i) % 8;
    const bit = (dataView.getUint8(byteIndex) >> bitIndex) & 1;
    value |= bit << i;
  }

  return value;
}
function writeNBits(uint8Array, bitOffset, n, value) {
  const byteOffset = Math.floor(bitOffset / 8);
  const bitStart = bitOffset % 8;
  const dataView = new DataView(uint8Array.buffer);

  for (let i = 0; i < n; i++) {
    const byteIndex = byteOffset + Math.floor((bitStart + i) / 8);
    const bitIndex = (bitStart + i) % 8;
    const bit = (value >> i) & 1;
    const currentByte = dataView.getUint8(byteIndex);
    dataView.setUint8(
      byteIndex,
      (currentByte & ~(1 << bitIndex)) | (bit << bitIndex)
    );
  }
}

async function save(){
  await fs.writeFile("canvas", canvas, function(err) {
    if(err) {
      console.log(err);
      return err
    }
    return true
  });
}

let canvas = new Uint8Array(canvasize)
canvas.set(new Uint8Array(fs.readFileSync("canvas")),0); //(new TextDecoder()).decode()
console.log(canvas);


const wss = new WebSocket.Server({ server });
let id=0
wss.on('connection',(ws)=>{
  ws.id = id++;
  console.log('A new client connected!',ws.id);
  
  let info
  ws.on('message',(message)=>{
    if(info===undefined){
      info=JSON.parse(message)
      info.messageTime=Date.now()
      return
    }
    let b=new Uint8Array(message)
    let a=readNBits(b,0,bitcanva)*3
    canvas[a]=readNBits(b,bitcanva,8)
    canvas[a+1]=readNBits(b,bitcanva+8,8)
    canvas[a+2]=readNBits(b,bitcanva+16,8)
    save()
    console.log('Received: \'%s\'(%s)',message,ws.id);
    // Echo the message back to the client
    wss.clients.forEach((client)=>{
      if (client.readyState === WebSocket.OPEN && client.id != ws.id) {
        client.send(message);
      }
    });
  });
  ws.onerror=(err)=>{
    console.log(err.code,err.info)
    saveinfo({err:err})
  }
  ws.onclose=(msg)=>{
    console.log(msg.code,msg.info)
    saveinfo({msg:msg})
  }
  function saveinfo(exinfo){
    if(info===undefined){return}
    info.disconectTime=Date.now()
    console.log(info.disconectTime)
    
    
    Object.assign(info,exinfo)
    
    info=aes.encrypt(JSON.stringify(info),process.env.userAes)
    fs.appendFile('/app/userdata.txt', `\n\n"${info}",`, (err) => {if (err) {console.error(err)}})
  }
  ws.send(canvas);
});