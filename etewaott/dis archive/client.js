rel = null

function isob(val) {
  return typeof val === 'object' && val !== null
}
const undef = Symbol('undefined')
const bySet = (a, b) => {
  let A = Number(a)
  if (A != a)
    A = String(a?.id ?? a)
  let B = Number(b)
  if (B != b)
    B = String(b?.id ?? b)
  if (A < B)
    return -1
  if (A > B)
    return 1
  return 0
}
const toSet = (a, v) => {
  a[String(v?.id ?? v)] = v
  return a
}
function deepAssign(to, from, destructive=false, maxDepth=100) {
  if (!(isob(to) && isob(from)))
    return to
  if (maxDepth < 0)
    return to
  for (let key of Object.keys(from)) {
    let fk = from[key]
    if (fk === undefined)
      fk = undef

    if (!destructive && fk === undef)
      continue

    if (isob(fk)) {
      if (!isob(to[key]))
        to[key] = {}
      if (Array.isArray(fk))
        fk = fk.reduce(toSet, {})
      to[key] = deepAssign(to[key], fk, destructive, maxDepth - 1)
      continue
    }

    to[key] = fk
  }
  return to
}

apiURL = "https://discord.com/api/v9"
rate = 2000

function sendMsg(msg, chid, auth) {
  return fetch(`https://discord.com/api/v9/channels/${chid}/messages`, {
    headers: {
      authorization: auth,
      "content-type": "application/json"
    },
    "body": JSON.stringify({
      "content": "I must be lv 69",
      "nonce": String(Math.random())
    }),
    "method": "POST"
  })
}

async function fetchWAbort(url, options={}, timeout=rate, maxRetries=5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let controller = new AbortController()
    let id = setTimeout(e => controller.abort(), timeout)

    try {
      let response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(id)

      return response
    } catch (err) {
      clearTimeout(id)

      // Only retry if it was aborted (timeout)
      if (err.name === 'AbortError') {
        console.warn(`Attempt ${attempt}: Request timed out`)
        if (attempt == maxRetries)
          throw new Error(`Fetch aborted after ${maxRetries} retries`)
      } else {
        return err
      }
    }
  }
}
async function getAllChannelMsgs(channe, authorizationl) {
  let out = {}
  let after = 0n
  let i = 0
  while (1) {
    let a = await getChannelMsgs(channel, authorization, {
      limit: 100,
      after: String(after)
    })

    if (a.length == 0)
      break
    for (let msg of a) {
      deepAssign(out[msg.id] = {}, msg)
      if (after < BigInt(msg.id))
        after = BigInt(msg.id)
    }

    console.log(i++, (Date.now() - Number((after >> 22n) + 1420070400000n)) / 1000 / 60 / 60 / 24)
  }
  return out
}
function getChannelMsgs(channel, authorization, {limit=100, after, before}={}) {
  let q = []
  if (limit != undefined)
    q.push('limit=' + Math.min(Math.max(limit, 1), 100))
  if (after != undefined)
    q.push('after=' + after)
  if (before != undefined)
    q.push('before=' + before)
  return fetchWAbort(`${apiURL}/channels/${channel}/messages?${q.join('&')}`, {
    headers: {
      authorization
    }
  }).then(e => e.json())
}

function getUsrGuilds(authorization) {
  return fetchWAbort(`${apiURL}/users/@me/guilds`, {
    headers: {
      authorization
    }
  }).then(e => e.json())
}

function getGuild(guild, authorization) {
  return fetchWAbort(`${apiURL}/guilds/${guild}`, {
    headers: {
      authorization
    }
  }).then(e => e.json())
}
function getGuildChannels(guild, authorization) {
  return fetchWAbort(`${apiURL}/guilds/${guild}/channels`, {
    headers: {
      authorization
    }
  }).then(e => e.json()).then(arr => Object.fromEntries(arr.map(e => [e.id, e])))
}

class Client {
  constructor(auth) {
    this.auth = auth
    this.ws = null
    this.seq = null
    this.session_id = null
  }

  connect() {
    console.log('killing old ws')
    this.disconnect()

    console.log('>new wss')
    this.ws = new WebSocket(/*this.resume_gateway_url??*/
    'wss://gateway.discord.gg/?v=9');
    this.resume_gateway_url = undefined
    this.ws.open = e => console.log('open', e)
    this.ws.onmessage = e => this.onmessage(e)
    this.ws.onclose = _ => {
      this.ws.onclose = null
      this.connect()
    }

  }

  disconnect() {
    this.heartbeatInterval = null
    console.log(">close4000")
    if (this.ws)
      this.ws.close(4000)
  }

  set heartbeat_interval(e) {
    clearInterval(this._heartbeatInterval)
    if (e == null)
      return;
    this._heartbeatInterval = setInterval(_ => {
      if (this.ws.readyState != 1)
        return this.connect()
      this.ws.send(JSON.stringify({
        op: 1,
        d: this.seq
      }))
      console.log(">Heartbeat")
    }
    , e)
  }

  async onmessage(e) {
    const msg = JSON.parse(e.data)
    const {op, t: eventName, d: data, s: eventId} = msg
    if (eventId)
      this.seq = eventId;

    switch (op) {
    case 10:
      // HELLO
      console.log("<HELLO")

      this.heartbeat_interval = data.heartbeat_interval

      // if(this.session_id&&this.seq!=null){
      //   this.ws.send(JSON.stringify({
      //     op:6,
      //     d:{
      //       token:this.auth,
      //       session_id:this.session_id,
      //       seq:this.seq
      //     }
      //   }))
      //   console.log(">RESUME");
      // }else{
      this.ws.send(JSON.stringify({
        op: 2,
        d: {
          token: this.auth,
          properties: {},
          capabilities: 1734653
        }
      }))
      console.log(">IDENTIFY")
      // }

      break

    case 9:
      console.warn('<INVALID_SESSION')
      this.session_id = null
      this.connect()
      break

    case 11:
      // Heartbeat ACK
      console.log("<Heartbeat ACK")
      break

    case 0:
      // Dispatch
      switch (eventName) {
      case "READY":
        this.session_id = data.session_id
        this.resume_gateway_url = data.resume_gateway_url
        console.log('<IDENTIFY (success) sid:', this.session_id, data)

        this.relationships=data.relationships

        for (const a of data.guilds)
          guilds.update(a)
        for (const dm of data.private_channels)
          channels.update(dm, 'dm')


        for (const usr of data.users)
          users.update(usr)
        for (const usr of data.relationships)
          users.update(usr)

        break

      case "RESUMED":
        console.log('<RESUMED (success)')
        break

      case 'MESSAGE_CREATE':
        console.log('<msg', data)
        console.log(channels.msg(data).view)
        break

      case 'PRESENCE_UPDATE':
        console.log('<presence', data);
        users.update(data.user)
        console.log(users.getName(data.user.id), data.status, data.client_status)
        break

      case 'GUILD_MEMBER_LIST_UPDATE':
        for (const operation of data.ops) {
          switch (operation.op) {
          case "SYNC":

            for (const item of operation.items) {
              if (!item.member)
                continue
              users.update(item.member.user)
            }

            break
            // default:console.warn('<unknown GUILD_MEMBER_LIST_UPDATE operation',data)
          }
        }
        break

      case "MESSAGE_UPDATE":
        console.log('<msg edit', data)
        console.log(channels.msg(data).view)
        break

      default:
        console.warn('<unknown dispatch', msg)
      }
      break

    default:
      console.warn('<unknown op', msg)
    }
  }
  async getAllMsg(chid) {
    let out = {}
    let after = 0n
    let i = 0
    while (1) {
      let a = await this.getChannelMsgs(chid, {
        limit: 100,
        after: String(after)
      })

      if (a.length == 0)
        break
      for (let msg of a) {
        deepAssign(out[msg.id] = {}, msg)
        if (after < BigInt(msg.id))
          after = BigInt(msg.id)
      }

      console.log(i++, (Date.now() - Number((after >> 22n) + 1420070400000n)) / 1000 / 60 / 60 / 24)
    }
    return out
  }

  async getChannelMsgs(chid, {limit=100, after, before}={}) {
    let q = []
    if (limit != undefined)
      q.push('limit=' + Math.min(Math.max(limit, 1), 100))
    if (after != undefined)
      q.push('after=' + after)
    if (before != undefined)
      q.push('before=' + before)
    const ret = await fetchWAbort(`${apiURL}/channels/${chid}/messages?${q.join('&')}`, {
      headers: {
        authorization: this.auth
      }
    }).then(e => e.json())

    const ch = channels.get(chid)
    return ret.map(e => ch.msg(e))
  }

  // async friendByName(username) {  needs recapture or discord limits you abilitys
  //   return fetch("https://discord.com/api/v9/users/@me/relationships", {
  //     headers: {
  //       authorization: this.auth,
  //       "content-type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       username,
  //       discriminator: null
  //     }),
  //     method: "POST",
  //   })
  // }

  // async friendById(id) {
  //   return fetch(`https://discord.com/api/v9/users/@me/relationships/${id}`, {
  //     headers: {
  //       authorization: this.auth,
  //       "content-type": "application/json",
  //     },
  //     body: "{}",
  //     method: "PUT",
  //   });
  // }
}

class User {
  constructor(data) {
    this.data = {}

    this.update(data)
  }
  update(data) {
    if (!data)
      return;

    deepAssign(this.data, data)
  }
  getName() {
    return `${this.data.global_name ?? '?'} (${this.data.username ?? '?'} ${this.data.id})`
  }
}

class Users {
  constructor() {
    this.usrs = {}
  }
  update(data={}) {
    if (!data.id)
      return console.warn('no id?', data)
    if (this.usrs[data.id]) {
      this.usrs[data.id].update(data)
    } else {
      this.usrs[data.id] = new User(data)
    }
  }
  getName(id) {
    const usr = this.usrs[id]
    if (!usr)
      return `<unknow user ${id}>`
    return usr.getName()
  }
}

class Guild {
  constructor(id) {
    this.channels = {}
    this.id = id

    this.data = {}
  }
  update(data={}) {
    this.data[Date.now()] = data

    if (data.name)
      this.name = data.name
    if (data.properties) {
      if (data.properties.name)
        this.name = data.properties.name
    }
    if (data.channels) {
      for (const a of data.channels)
        channels.update(a, this.id)
    }
  }
  getName() {
    return this.name
  }
}

class Guilds {
  constructor() {
    this.guilds = {}
  }
  update(data) {
    if (!data.id)
      return console.warn('no id?', data)
    this.get(data.id).update(data)
  }
  get(id) {
    return this.guilds[id] ?? (this.guilds[id] = new Guild(id))
  }
  getName(id) {
    const guild = this.guilds[id]
    if (!guild)
      return `<unknown guild ${id}>`
    return guild.getName()
  }
}

class Channel {
  constructor(id) {
    this.id = id

    this.data = []
    this.msgs = {}
  }
  update(data={}, guid) {
    this.data.push(data)
    if (guid) {
      this.guild = guilds.get(guid)
      this.guild.channels[this.id] = this
    }
    if (data.name)
      this.name = data.name
    if (data.topic)
      this.topic = data.topic
  }
  getFullName() {
    return `${this.guild ? this.guild.getName() : 'unknown'}/${this.name} (${this.guild?.id}/${this.id})`
  }
  msg(data) {
    let msg = this.msgs[data.id]
    if (msg) {
      msg.update(data)
    } else {
      msg = this.msgs[data.id] = new Msg(data)
    }
    return msg
  }
}

class Channels {
  constructor() {
    this.channels = {}
  }
  update(data, guid) {
    this.get(data.id).update(data, guid)
  }
  get(id) {
    return this.channels[id] ?? (this.channels[id] = new Channel(id))
  }
  getFullName(id) {
    const channel = this.channels[id]
    if (!channel)
      return `<unknown channel ${id}>`
    return channel.getFullName()
  }
  msg(data) {
    let ch = this.channels[data.channel_id]
    if (!ch) {
      ch = this.channels[data.channel_id] = new Channel({
        id: data.channel_id
      })
    }
    return ch.msg(data)
  }
}

class Msg {
  constructor(data) {
    this.content = {}
    this.id = data.id
    this.author = data.author.id
    this.channel_id = data.channel_id
    if (data.message_reference)
      this.message_reference = data.message_reference.message_id
    if (data.attachments.length) {
      this.attachments = {}
      for (const att of data.attachments)
        this.attachments[att.id] = att.proxy_url
    }
    this.update(data)
  }
  update(data) {
    if (data.author)
      users.update(data.author)
    this.content[data.edited_timestamp ?? data.timestamp] = data.content
  }
  get view() {
    return `${channels.getFullName(this.channel_id)}
${users.getName(this.author)}
${Object.values(this.content).at(-1)}
${new Date(Object.keys(this.content).at(-1))} ${this.id}`
  }
}

const users = new Users
const guilds = new Guilds
const channels = new Channels

// cl=new Client(auths.walt)
// cl.connect()

// cl.ws.send(JSON.stringify({"op":36,"d":{"guild_id":"1389578717080326146"}})) //ch stat
// cl.ws.send(JSON.stringify({"op":43,"d":{"guild_id":"1389578717080326146","fields":["status","voice_start_time"]}})) //ch info
// cl.ws.send(JSON.stringify({"op":37,"d":{"subscriptions":{"1389578717080326146":{"typing":true,"activities":true,"threads":true,"channels":{"1389578718321574059":[[0,99]]}}}}})) //threads, guil_dmembers

// fetch("https://discord.com/api/v9/guilds/1465269139697303658/members-search", {//requres mod
//   "headers": {
//     "authorization": auth,
//     "content-type": "application/json"
//   },
//   "body": "{\"or_query\":{},\"and_query\":{},\"limit\":250}",
//   "method": "POST",
// });

// for(const guid in guilds.guilds){
//   await cl.ws.send(JSON.stringify({"op":37,"d":{"subscriptions":{[guid]:{"channels":{[Object.keys(guilds.guilds[guid].channels)[0]]:[[0,99]]}}}}})) //threads, guil_dmembers
//   await new Promise(res=>setTimeout(res,1000))
// }

/*
interval=1000*60
if(window.timeout)clearInterval(window.timeout)
function main() {
  sendMsg("I must be lv 69",'1469260498359943313',auth.thsg)
  sendMsg("I must be lv 69",'1474614174935027946',auth.thsg)
  sendMsg("I must be lv 69",'1479694730622402693',auth.thsg)
  let time=interval-Date.now()%(interval)
  window.timeout=setTimeout(main,interval<time?interval:time)
}
window.timeout=setTimeout(main,interval-Date.now()%(interval))
*/

/*
a.map(e=>{
  let a={id:e.id,author:e.author.id}
  for(let b of ["content","message_reference","attachments","components","reactions", "sticker_items"]){
     if(e[b])a[b]=e[b]
  }
  return a
}).find(e=>e.referenced_message)
*/


// let sent=c.tank.relationships.map(e=>e.id)
// console.log(Object.values(users.usrs).filter(e=>!e.data.bot&&!sent.includes(e.data.id)).map(e=>`<@${e.data.id}>`).join('\n'))