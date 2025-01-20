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
for(const a of [
  '/txt'
]){
  console.log(`//always cache ${fixUrl(a)}`)
  cache(a)
}

function fixUrl(url){
  url=new URL(url,self.location.origin)
  if(url.hostname=='tankhellfire.glitch.me'){
    let end=url.pathname.split('/').pop()
    if(!end.includes('.')){
      if(end!==''){
        url.pathname+='/'
      }
      url.pathname+='index.html'
    }
  }
  return url
}

async function cache(a){
  let url=fixUrl(a)
  let res=await fetch(url)
  if(!res.ok){
    return res.clone()
  }

  if(neverCache.includes(url.pathname)){
    console.log(`//never cache "${url}"`)
    return res.clone()
  }

  db.then(async e=>{
    await e.set(url.pathname,res.clone())
    console.log(`//updated cache "${url}"`)
  })

  return res.clone()
}

self.addEventListener('fetch', (event) => {
  const url=fixUrl(event.request.url)
  
  if(url.hostname=='tankhellfire.glitch.me'){
    if(url!=event.request.url){
      console.log(`//redirecting "${event.request.url}"->"${url}"`)
      return event.respondWith(Response.redirect(url, 301))
    }
    event.respondWith(
      caches.match(url).then((cachedResponse) => {
        const a=cache(url)


        if(cachedResponse){
          console.log(`//returned cache "${url}"`)
          return cachedResponse
        }
        console.log(`//returned fetch "${url}"`)
        return a;
      })
    )
  }
  
});


self.addEventListener('install', (event) => {
  console.log('//installing');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});