function isob(val){return typeof val==='object'&&val!==null}
const undef=Symbol('undefined')
const bySet=(a,b)=>{
  let A=Number(a)
  if(A!=a)A=String(a?.id??a)
  let B=Number(b)
  if(B!=b)B=String(b?.id??b)
  if(A<B)return -1
  if(A>B)return 1
  return 0
}
const toSet=(a,v)=>{
  a[String(v?.id??v)]=v
  return a
}
function deepAssign(to,from,destructive=false,maxDepth=100){
  if(!(isob(to)&&isob(from)))return to
  if(maxDepth<0)return to
  for(let key of Object.keys(from)){
    let fk=from[key]
    if(fk===undefined)fk=undef
    
    if(!destructive&&fk===undef)continue
    
    if(isob(fk)){
      if(!isob(to[key]))to[key]={}
      if(Array.isArray(fk))fk=fk.reduce(toSet,{})
      to[key]=deepAssign(to[key],fk,destructive,maxDepth-1)
    continue}

    to[key]=fk
  }
  return to
}

class Client {
  constructor(auth) {
    this.auth=auth
    this.ws=null
    this.seq=null
    this.session_id=null
  }

  connect(){
    console.log('killing old ws')
    this.disconnect()

    console.log('>new wss')
    this.ws=new WebSocket('wss://gateway.discord.gg/?v=9')
    this.ws.open=e=>console.log('open',e)
    this.ws.onmessage=e=>this.onmessage(e)
  }

  disconnect(){
    this.heartbeatInterval=null
    console.log(">close4000")
    if(this.ws)this.ws.close(4000)
  }

  set heartbeat_interval(e){
    clearInterval(this._heartbeatInterval)
    if(e==null)return;
    this._heartbeatInterval=setInterval(_=>{
      this.ws.send(JSON.stringify({op:1,d:this.seq}))
      console.log(">Heartbeat")
    },e)
  }

  async onmessage(e){
    const msg=JSON.parse(e.data)
    const {op,t:eventName,d:data,s:eventId}=msg
    if(eventId)this.seq=eventId;
  
    switch(op){
      case 10: // HELLO
        console.log("<HELLO")

        this.heartbeat_interval=data.heartbeat_interval
        
        if(this.session_id&&this.seq!=null){
          this.ws.send(JSON.stringify({
            op:6,
            d:{
              token:this.auth,
              session_id:this.session_id,
              seq:this.seq
            }
          }))
          console.log(">RESUME");
        }else{
          this.ws.send(JSON.stringify({
            op:2,
            d:{
              token:this.auth,
              properties:{},
              capabilities:1734653
            }
          }))
          console.log(">IDENTIFY")
        }

      break
        
      case 9:
        console.warn('<INVALID_SESSION')
        this.session_id=null
        this.connect()
      break
  
      case 11: // Heartbeat ACK
        console.log("<Heartbeat ACK")
      break
  
      case 0: // Dispatch
        switch(eventName){
          case "READY":
            this.session_id=data.session_id
            console.log('<IDENTIFY (success) sid:',this.session_id)
            
            for(const a of data.guilds)guilds.update(a)
            
            for(const usr of data.users)users.update(usr)
            
          break
            
          case "RESUMED":
            console.log('<RESUMED (success)')
          break
            
          case 'MESSAGE_CREATE':
            console.log('<msg',data)
            users.update(data.author)
            console.log(`${channels.getFullName(data.channel_id)}\n${users.getName(data.author.id)}\n${data.content}\n${new Date(data.timestamp)} ${data.id}`)
          break

          case 'PRESENCE_UPDATE':
            console.log('<presence',data);
            users.update(data.user)
            console.log(users.getName(data.user.id),data.status,data.client_status)
          break

          case 'GUILD_MEMBER_LIST_UPDATE':
            for(const operation of data.ops){
              switch(operation.op){
                case "SYNC":

                  for(const item of operation.items){
                    if(!item.member)continue
                    users.update(item.member.user)
                  }
                  
                break
                // default:console.warn('<unknown GUILD_MEMBER_LIST_UPDATE operation',data)
              }
            }
          break
            
          default:console.warn('<unknown dispatch',msg)
        }
      break

  
      default:console.warn('<unknown op',msg)
    }
  }
}


class User{
  constructor(data){
    this.data={}
    this.update(data)
  }
  update(data){
    if(!data)return;
    
    deepAssign(this.data,data)
  }
  getName(){
    return `${this.data.global_name??'?'} (${this.data.username??'?'} ${this.data.id})`
  }
}

class Users{
  constructor(){
    this.usrs={}
  }
  update(data){
    if(!data.id)return console.warn('no id?',data)
    if(this.usrs[data.id]){this.usrs[data.id].update(data)}else{this.usrs[data.id]=new User(data)}
  }
  getName(id){
    const usr=this.usrs[id]
    if(!usr)return `<unknow user ${id}>`
    return usr.getName()
  }
}


class Guild {
  constructor(data) {
    this.channels=new Set
    this.name="nnf"
    this.update(data)
  }
  update(data){
    if(!data)return console.warn('no data',this)
    
    if(data.id)this.id=data.id
    if(!this.id)return console.warn('no id',this,data)
    
    if(data.name)this.name=data.name
    if(data.properties){
      if(data.properties.name)this.name=data.properties.name
    }
    if(data.channels){
      for(const a of data.channels)channels.update(a,this)
    }
  }
  getName(){
    return this.name
  }
}

class Guilds {
  constructor(){
    this.guilds={}
  }
  update(data){
    const id=data.id
    if(!id)return console.warn('no id?',data)
    if(this.guilds[id]){this.guilds[id].update(data)}else{this.guilds[id]=new Guild(data)}
  }
  getName(id){
    const guild=this.guilds[id]
    if(!guild)return `<unknown guild ${id}>`
    return guild.getName()
  }
}


class Channel {
  constructor(data,guild) {
    this.name="nnf"
    this.update(data,guild)
  }
  update(data,guild){
    if(!data)return console.warn('no data',guild,this);
    
    
    if(data.id)this.id=data.id
    if(!this.id)return console.warn('no id',guild,this);
    
    guild.channels[this.id]=this
    
    if(data.name)this.name=data.name
    if(data.topic)this.topic=data.topic
    if(guild)this.guild=guild
  }
  getFullName(){
    return `${this.guild.getName()}/${this.name} (${this.guild.id}/${this.id})`
  }
}

class Channels {
  constructor(){
    this.channels={}
  }
  update(data,guild){
    const id=data.id
    if(!id)return console.error('no id?',data)
    if(this.channels[id]){this.channels[id].update(data,guild)}else{this.channels[id]=new Channel(data,guild)}
  }
  getFullName(id){
    const channel=this.channels[id]
    if(!channel)return `<unknown channel ${id}>`
    return channel.getFullName()
  }
}

const users=new Users
const guilds=new Guilds
const channels=new Channels

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
