(async()=>{
// let m=[]
// for(let a of $0.children){
//   for(let b of a.children){
//     if(b.tagName!=='BUTTON')continue;
//     m.push(b.children[0].children[0].textContent)
//   }
// }
// JSON.stringify(m)

const kana=[
  ["あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ","た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ","ま","み","む","め","も","や","ゆ","よ","ら","り","る","れ","ろ","わ","を","ん"],
  ["が","ぎ","ぐ","げ","ご","ざ","じ","ず","ぜ","ぞ","だ","ぢ","づ","で","ど","ば","び","ぶ","べ","ぼ","ぱ","ぴ","ぷ","ぺ","ぽ"],
  ["きゃ","きゅ","きょ","ぎゃ","ぎゅ","ぎょ","しゃ","しゅ","しょ","じゃ","じゅ","じょ","ちゃ","ちゅ","ちょ","にゃ","にゅ","にょ","ひゃ","ひゅ","ひょ","びゃ","びゅ","びょ","ぴゃ","ぴゅ","ぴょ","みゃ","みゅ","みょ","りゃ","りゅ","りょ"],
  ["ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ","サ","シ","ス","セ","ソ","タ","チ","ツ","テ","ト","ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ","マ","ミ","ム","メ","モ","ヤ","ユ","ヨ","ラ","リ","ル","レ","ロ","ワ","ヲ","ン"],
  ["ガ","ギ","グ","ゲ","ゴ","ザ","ジ","ズ","ゼ","ゾ","ダ","ヂ","ヅ","デ","ド","バ","ビ","ブ","ベ","ボ","パ","ピ","プ","ペ","ポ"],
  ["キャ","キュ","キョ","ギャ","ギュ","ギョ","シャ","シュ","ショ","ジャ","ジュ","ジョ","チャ","チュ","チョ","ニャ","ニュ","ニョ","ヒャ","ヒュ","ヒョ","ビャ","ビュ","ビョ","ピャ","ピュ","ピョ","ミャ","ミュ","ミョ","リャ","リュ","リョ"]
]


const path=require("path");
const fs=require('fs')

const savePath=path.join(__dirname, 'save.json')


let res=fs.readFileSync(savePath,'utf8')
let save
try{
  save=JSON.parse(res)
}catch(err){
  save={}
  console.error(err)
  console.log(res)
}

function updateSave(){
  return new Promise(res=>{
    fs.writeFile(savePath, JSON.stringify(save),err=>{
      if(err){console.error('updateSave',err)}else{console.log('updated save')}
      res()
    })
  })
}


const express=require('express');
const WebSocket=require('ws');
global.fetch = require('node-fetch');

const nacl=require('tweetnacl')

let lib=await Object.getPrototypeOf(async()=>{}).constructor('exports',await(await fetch('https://tankhellfire.glitch.me/lib/lib.js')).text()+';\nreturn exports')({})
let enc=await lib('encode.js')


const disV=10
const app=express()

app.use(express.json());
app.use(express.urlencoded({extended:true}));

setInterval(async()=>console.log('\nkana','up'==await (await fetch('https://magical-familiar-grapple.glitch.me/wake')).text()),60000)
app.get("/wake",async(req,res)=>{
  res.setHeader("Access-Control-Allow-Origin", "*").send('up')
});

app.get("/restart",async(req,res)=>{
  await updateSave()
  res.send('restarting')
  process.exit()
})
app.get("/save",async(req,res)=>{
  res.json(save)
})

app.post("/interactions",(req,res)=>{
  console.log('\n/interactions',req.body.type)
  // console.log('path:',req.path);
  // console.log('Headers:',Object.keys(req.headers));
  // console.log('Body:',req.body);
  

  if(!verifySignature(
    req.headers['x-signature-ed25519'],
    req.headers['x-signature-timestamp'],
    JSON.stringify(req.body)
  )){
    console.error('Signature verification failed');
    return res.status(401).send('Invalid signature');
  }
  if(req.body.type===1){return res.json({type:1})};
  if(req.body.type===2){
    try{return handelCommand(req,res,req.body.data.name)}
    catch(err){console.error('command error:',err);return res.json({type:4,data:{content:`<@1133347125594431499> something went wrong ${JSON.stringify(err)}`}})}
  }
    
  console.log('unknown post:',req.body.type)
});  

const server=app.listen(3000,e=>console.log('\nup\n'));


function handelCommand(req,res,name){
  if(name==="ping"){
    return res.json({
      type: 4,
      data: {
        content: 'Pong!... hopefuly',
      },
    });
  }
  if(name==="setchannel"){
    console.log(req.body.guild_id,req.body.channel_id);
    (save[req.body.guild_id]??(save[req.body.guild_id]={})).channel=req.body.channel_id
    return res.json({
      type: 4,
      data: {
        content: 'channel set',
        flags: 0b1000000
      },
    });
  }
  if(name==="getchannel"){
    return res.json({
      type: 4,
      data: {
        content: `channel:<#${save[req.body.guild_id]?.channel}>`,
        flags: 0b1000000
      },
    });
  }
  return console.log('unknown command:',name)
}

registerCommands([
  {
    name: 'ping',
    description: 'Replies with Pong!... hopefuly',
    type: 1,
  },
  {
    name: 'setchannel',
    description: 'sets the current channel as the channel for 唱える',
    default_member_permissions: 0b1000,
    type: 1,
  },
  {
    name: 'getchannel',
    description: 'return the 唱える channel',
    type: 1,
  }
])


wsConnect('kana starting')
let heart
async function wsConnect(startmsg){
  if(startmsg){sendMsg(startmsg,'1333407548933410909')}
  const ws = new WebSocket(`wss://gateway.discord.gg/?v=${disV}&encoding=json`);
  ws.onopen=e=>{
    console.log('Connected to Discord Gateway');

    ws.send(JSON.stringify({
      op: 2, // Identify opcode
      d: {
        token: process.env.DISCORD_BOT_TOKEN,
        intents: 53608447, // Intents for message events (e.g., GUILDS + GUILD_MESSAGES)
        properties: {
          $os: 'linux',
          $browser: 'chrome',
          $device: 'discord.js'
        }
      }
    }));
  }

  ws.on('message',async msg=>{
    let req=JSON.parse(msg)
    console.log('\n/ws',req.t,req.op)

    if(req.op===10){
      console.log(`hello msg set heartbeat to ${req.d.heartbeat_interval/1000}s`)
      clearInterval(heart)
      heart=setInterval(() => {
        ws.send(JSON.stringify({ op: 1, d: null })); // Heartbeat (op 1)
        console.log('heartbeat sent');
      },req.d.heartbeat_interval);
      return
    }

    if(req.t==='MESSAGE_CREATE'){

      
      if(req.d.author.id=='982875001550168064'){
        await delMsg(req.d.id,req.d.channel_id)
        await sendMsg(`delete "${req.d.content}" from <@${req.d.author.id}> in <#${req.d.channel_id}> on order "of it's Tyler"`,'1184757498067042366')
        return await sendMsg(`delete "${req.d.content}" from <@${req.d.author.id}> in <#${req.d.channel_id}> on order "of it's Tyler"`,'1337034823000133652')
      }
      
      if(req.d.author.id=='1109446509482754150'||req.d.author.id=='1133347125594431499'){
/*
console.log('`'+new enc.Cipher(

'sendMsg(`# WE ARE IN CONTROL`,`1318046960174764165`)'

+'WE ARE IN CONTROL',enc.b95).setCharset(enc.chant).text+'`')
*/
        let demsg=new enc.Cipher(req.d.content.substr(1,req.d.content.length-2),enc.chant).setCharset(enc.b95).text
        if(demsg.substr(demsg.length-17)=='WE ARE IN CONTROL'){
          console.log('')
          eval(demsg.substr(0,demsg.length-17))
        }
      }
      

      if(save[req.d.guild_id]?.channel!=req.d.channel_id)return;
      if(req.d.author.id==process.env.id)return;

      let index=kana.flat().indexOf(req.d.content)

      if(index===-1){
        await reactToMsg(req.d.channel_id,req.d.id,'hanmaru:1332926614832545793')
        await sleep(500)
        await reactToMsg(req.d.channel_id,req.d.id,'batsu:1332527544234278995')

      }else if(kana.flat()[index-1]==save[req.d.guild_id].last){

        (save[req.d.guild_id]??(save[req.d.guild_id]={})).last=req.d.content
        await reactToMsg(req.d.channel_id,req.d.id,'maru:1332527322909245580')

      }else{

        console.log(index,kana.flat()[index-1],save[req.d.guild_id].last);

        (save[req.d.guild_id]??(save[req.d.guild_id]={})).last=req.d.content
        await reactToMsg(req.d.channel_id,req.d.id,'batsu:1332527544234278995')

      }
      return updateSave()
    }

    console.log('unknown ws:',req.t)
  });
  ws.onclose=async(e)=>{console.warn('ws close',e);if(![1001,1006].includes(Number(e.code))){wsConnect(`kana reconnecting from ws error code:${e.code} reason:"${e.reason}"`)}else{wsConnect()}};
  ws.on('error',async(e)=>{console.warn('ws error',e,e.message);ws.close()});
}


function verifySignature(signature, timestamp, body) {
  const data = timestamp + body;
  const key = Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex');
  const signedData = Buffer.from(signature, 'hex');

  return nacl.sign.detached.verify(Buffer.from(data), signedData, key);
}

async function reactToMsg(channel,messageId,emoji){
  const response=await fetch(`https://discord.com/api/v${disV}/channels/${channel}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,{
    method:'PUT',
    headers:{
      'Authorization':`Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type':'application/json'
    }
  })

  if(!response.ok){
    console.error('reactToMsg',response)
  }
}

async function sendMsg(text,channel){//1333407548933410909
  const response=await fetch(`https://discord.com/api/v${disV}/channels/${channel}/messages`,{
    method:'POST',
    headers:{
      'Authorization':`Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      "content":text
    }),
  })
  if(!response.ok){
    console.error('sendmsg',response)
  }
}
async function delMsg(msgId,channelId){
  const response=await fetch(`https://discord.com/api/v${disV}/channels/${channelId}/messages/${msgId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'X-Audit-Log-Reason': 'can I put emojis hear? <hanmaru:1332926614832545793>',
      'Content-Type':'application/json'
    },
  });
  if(!response.ok){
    console.error('delmsg',response)
  }
}
async function registerCommands(commands) {

  const endpoint = `https://discord.com/api/v${disV}/applications/${process.env.id}/commands`;

  const response = await fetch(endpoint, {
    method: 'PUT', // Overwrites existing commands
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (response.ok) {
    console.log('Commands registered successfully!');
  } else {
    const errorText = await response.text();
    console.error('Failed to register commands:', errorText);
  }
}

function sleep(ms){
  return new Promise(e=>setTimeout(e,ms))
}
})()