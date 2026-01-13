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
              session_id,
              seq
            }
          }))
          console.log(">RESUME");
        }else{
          this.ws.send(JSON.stringify({
            op:2,
            d:{
              token:this.auth,
              properties:{},
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
            
            console.log('guilds',data.guilds)
            console.log('relationships',data.relationships)

            for(const ob of data.relationships)users.update(ob.user)
            
          break
            
          case "RESUMED":
            console.log('<RESUMED (success)')
          break
            
          case 'MESSAGE_CREATE':
            console.log('<msg',data)
            users.update(data.author)
            console.log(`${users.get(data.author.id)?.name}\n${data.content}\n${new Date(data.timestamp)}`)
          break

          case 'PRESENCE_UPDATE':
            console.log('<presence',data);
            users.update(data.user)
            
            console.log(users.get(data.user.id)?.name,data.status,data.client_status)
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
    this.usr={}
    this.update(data)
  }
  update(data){
    deepAssign(this.usr,data)
    return this
  }
  get name(){
    return this.usr.global_name??this.usr.username??this.usr.id
  }
}

class Users{
  constructor(){
    this.usrs={}
  }
  update(data){
    if(!data.id)return console.warn('no id?',data)
    ;(this.usrs[data.id]??(this.usrs[data.id]=new User)).update(data)
    return this
  }
  get(id){
    return this.usrs[id]
  }
}

const users=new Users