function clog(msg,options={}){//clr,bgclr,fs,ts
  if(Object.keys(options).length===0){
    console.log(msg)
    return
  }
  let command=""
  if(options.clr){
    command+=`color: ${options.clr};`
  }
  if(options.bgclr){
    command+=`background-color: ${options.bgclr};`
  }
  if(options.fs){
    command+=`font-size: ${options.fs};`
  }
  if(options.ts){
    command+=`text-shadow: ${options.ts};`
  }
  console.log("%c" + msg,command)
}

class Db{
  constructor(name,storeName){
    this.name=name;
    this.storeName=storeName;
    return (async e=>{
      await new Promise((res,rej)=>{
        let req=indexedDB.open(name,1);

        req.onupgradeneeded=e=>{
          let db=e.target.result;
          if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName,{keyPath:"key"});
        };

        req.onsuccess=e=>{
          this.dbInstance=e.target.result;
          res(this);
        };

        req.onerror=e=>rej(`Database error:${e.target.errorCode}`)
      });
      return this
    })();
  }

  set(key,data){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readwrite").objectStore(this.storeName).put({data,key});

    req.onsuccess=e=>res(`written to "${key}"`)
    req.onerror=e=>rej(`Write error:${e.target.errorCode}`)
  })}

  get(key){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readonly").objectStore(this.storeName).get(key)

    req.onsuccess=e=>res(e.target.result?.data)
    req.onerror=e=>rej(`Read error:${e.target.errorCode}`)
  })}
  
  del(key){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readwrite").objectStore(this.storeName).delete(key);

    req.onsuccess=e=>res(`deleted "${key}"`);
    req.onerror=e=>rej(`Delete error: ${event.target.errorCode}`);
  })}
  

  keys(){return new Promise((res,rej)=>{
    let req=this.dbInstance.transaction(this.storeName,"readonly").objectStore(this.storeName).getAllKeys();

    req.onsuccess=e=>res(e.target.result);
    req.onerror=e=>rej(`Keys retrieval error:${e.target.errorCode}`);
  })}

}

let db=new Db('tankhellfire','page-cache')

let neverCache=[
  '/games/scratch/spacegamev5.html',
]

let alwaysCache=[
  '/txt',
]

function fixUrl(url){
  url=new URL(url,self.location.origin)
  let end=url.pathname.split('/').pop()
  if(end){
    if(!end.includes('.')) url.pathname+='/index.html'
  }else url.pathname+='index.html'
  return url
}

async function cache(url){
  url=fixUrl(url)
  let req=fetch(url).catch(console.warn)
  
  if(!neverCache.includes(url.pathname)){
    db.then(async db=>{
      let res=await req
      if(!res.ok){
        return
      }
      await db.set(url.pathname,await res.clone().blob())
      clog(`//updated cache:
"${url}"`,{bgclr:'#ff0',fs:'50%',ol:"2px solid #000"})
    }).catch(console.warn)

    let res=await (await db).get(url.pathname)
    if(res){
      clog(`//returned cache:
"${url}"`,{bgclr:'#0f0',fs:'50%',ol:"2px solid #000"})
      return new Response(res)
    }
  }
  clog(`//returned fetch:
"${url}"`,{bgclr:'#f00',fs:'50%',ol:"2px solid #000"})
  return (await req).clone()
  
}

self.addEventListener('fetch',e=>{
  let url=fixUrl(e.request.url)
  
  if(url.hostname!=='tankhellfire.glitch.me')return
  
  if(url!=e.request.url){
    clog(`//redirecting:
"${e.request.url}" to
"${url}"`,{bgclr:'#000',fs:'50%'})
    return e.respondWith(Response.redirect(url, 301))
  }
  
  return e.respondWith(cache(url))
});


self.addEventListener('install',e=>{
  clog('//installing',{bgclr:'#000',fs:'50%'});
  for(let a of alwaysCache){
    cache(a)
  }
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate',e=>{
  clog('//activating',{bgclr:'#000',fs:'50%'});
  e.waitUntil(clients.claim()); // Take control of all open pages
});