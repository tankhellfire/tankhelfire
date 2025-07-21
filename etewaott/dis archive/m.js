function isob(val){return typeof val==='object'&&val!==null}
sleep=t=>new Promise(r=>setTimeout(r,t))

const bySet=(a,b)=>{
  const toComparable=(x)=>{
    const num=Number(x)
    return isNaN(num)?String(x?.id??x):num
  }

  let A=toComparable(a)
  let B=toComparable(b)

  return A<B? -1 : A>B? 1 : 0
}

const toSet=(a,v)=>{
  a[String(v?.id??v)]=v
  return a
}
const undef=Symbol('undefined')

const saveUndef=(_,v)=>v===undefined||v===undef?'__undefined__':v
const loadUndef=(_,v)=>v==='__undefined__'?undef:v

class TimeSeries{
  constructor(obj){
    let series=[[-Infinity,{}],...Object.entries(obj).sort((a,b)=>bySet(a[0],b[0]))]

    for(let i=1;i<series.length;i++){
      function inheritPast(current,past){
        for(let key in past){
          if(current[key]===undefined){
            current[key]=past[key]
          continue}
          if(isob(current[key])&&isob(past[key])){
            inheritPast(current[key],isob(past[key]))
          continue}
        }
        return current
      }
      inheritPast(series[i][1],series[i-1][1])
    }
    
    return new Proxy(series,{
      get(obj,prop){
        if(prop==='toJSON')return _=>series.reduce((ret,val)=>{
          ret[val[0]]=val[1]
          return ret
        },{})
        return obj.find((_,i,arr)=>bySet(arr[i+1]?.[0],prop)==1)
      },
      set(obj,prop,val){
        obj[prop]=val
      }
    })
  }
}


async function fetchWAbort(url,options={},timeout=rate,maxRetries=5){
  for(let attempt=1;attempt<=maxRetries;attempt++){
    let controller=new AbortController()
    let id=setTimeout(e=>controller.abort(),timeout)

    try{
      let response=await fetch(url,{
        ...options,
        signal:controller.signal
      })
      clearTimeout(id)

      return response
    }catch(err){
      clearTimeout(id)

      // Only retry if it was aborted (timeout)
      if(err.name==='AbortError'){
        console.warn(`Attempt ${attempt}: Request timed out`)
        if(attempt==maxRetries)throw new Error(`Fetch aborted after ${maxRetries} retries`)
      }else{return err}
    }
  }
}

function getGuildMembers(guild,authorization){
  return fetchWAbort(`${apiURL}/guilds/${guild}/members`,{headers:{authorization}}).then(e=>e.json())
}

class Save{
  constructor(){
    this.guilds={}
    this.profiles={}
  }

  updateGuild(obj){
    if(this.guilds[obj.id]){
      this.guilds[obj.id].update(obj)
      console.log(`${this.guilds[obj.id].name} updated`)
    }else{
      this.guilds[obj.id]=new Guild(obj)
      console.log(`${this.guilds[obj.id].name} found`)
    }
  }

  updateProfile(obj){
    if(this.profiles[obj.id]){
      this.profiles[obj.id].update(obj)
      console.log(`${this.profiles[obj.id].name} updated`)
    }else{
      this.profiles[obj.id]=new Profile(obj)
      console.log(`${this.profiles[obj.id].name} found`)
    }
  }
}
save=new Save


class Profile{
  constructor(obj){
    this.update(obj)
  }
  get name(){
    return this._name??this.username
  }
  update(obj){
    this.id=obj.id
    this.username=obj.username
  }
}

class Guild{
  constructor(obj){
    this.update(obj)
  }
  update(obj){
    if(!this.id)this.id=obj.id
    this.icon=obj.icon
    this.name=obj.name
    
    if(!this.channels)this.channels={}
    for(let channel of obj.channels){
      if(this.channels[channel.id]){
        this.channels[channel.id].update(channel)
        console.log(`${this.name}/${this.channels[channel.id].name} updated`)
      }else{
        this.channels[channel.id]=new Channel(channel)
        console.log(`${this.name}/${this.channels[channel.id].name} found`)
      }
    }
    
  }
}
class Channel{
  constructor(obj){
    this.update(obj)
  }
  update(obj){
    this.id=obj.id
    this.name=obj.name
  }
}






function connect(){
  if(ws&&ws.readyState===WebSocket.OPEN){
    console.log('killing old ws')
    ws.close(4000,'killing old ws')
  }
  clearInterval(heartbeatInterval)
  heartbeatInterval=null
  
  ws=new WebSocket('wss://gateway.discord.gg/?v=9')
  
  ws.open=_=>console.log('open')
  
  ws.onmessage=async(e)=>{
    let msg=JSON.parse(e.data)
    const {op,t:eventName,d:data,s:eventId}=msg
    if(eventId)seq=eventId;
  
    switch(op){
      case 10: // HELLO
        console.log("←HELLO...")

        heartbeatInterval=setInterval(_=>{
          ws.send(JSON.stringify({op:1,d:seq}))
          console.log("→Heartbeat")
        },data.heartbeat_interval)
        
        if(session_id&&seq!=null){
          ws.send(JSON.stringify({
            op:6,
            d:{
              token:authorization,
              session_id,
              seq
            }
          }))
          console.log("→RESUME");
        }else{
          ws.send(JSON.stringify({
            "op":2,
            "d":{
              "token":authorization,
              "properties":{},
            }
          }))
          console.log("→IDENTIFY")
        }

      break
        
      case 9:
        console.warn('←INVALID_SESSION')
        session_id=null
        reconnect()
      break
  
      case 11: // Heartbeat ACK
        console.log("←Heartbeat ACK")
      break
  
      case 0: // Dispatch
        switch(eventName){
          case "READY":
            session_id=data.session_id
            a=data
            for(let guild of data.guilds)save.updateGuild(guild)

            for(let relationship of data.relationships)save.updateProfile(relationship.user)
            
            console.log('←IDENTIFY (success) sid:',session_id)
          break
            
          case "RESUMED":
            console.log('←RESUMED (success)')
          break
            
          case 'SESSIONS_REPLACE':
            console.log(eventName)
          case 'INTERACTION_CREATE':
          case 'INTERACTION_SUCCESS':
          break

          case 'MESSAGE_CREATE':
            console.log('msg',save.profiles[data.author.id],data.content)
          break
            
          default:console.warn('←unknown dispatch',msg)
        }
      break

  
      default:console.warn('←unknown op',msg)
    }
  }
  
  ws.onclose=e=>{
    clearInterval(heartbeatInterval)
    
    if(e.code!==4000){
      console.warn("Disconnected",e)
      reconnect()
    }
  }
}

function reconnect(){setTimeout(connect,1000)}

