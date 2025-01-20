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
  let req=fetch(url)
  
  if(!neverCache.includes(url.pathname)){
    db.then(async db=>db.set(url.pathname,await (await req).clone().blob()).then(e=>console.log(`//updated cache "${url}"`)))

    let res=await (await db).get(url.pathname)
    if(res){
      return new Response(res)
    }
  }
  return (await req).clone()
  
}


self.addEventListener('install', (event) => {
  console.log('//installing');
  for(let a of alwaysCache){
    console.log(`//always cache ${fixUrl(a)}`)
    cache(a)
  }
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});