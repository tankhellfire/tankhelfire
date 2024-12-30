const CACHE_NAME = 'tankh-cache';

let neverCache=[]

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const url=new URL(event.request.url)
      const a=fetch(event.request).then(res=>{
        if(url.hostname=='tankhellfire.glitch.me'){
          
          caches.open(CACHE_NAME).then(cache=>{
            cache.put(url.href,res.clone())
            console.log(`//updated cache"${url.href}"`)
          })
        }
        
        return res.clone()
      })
      
      
      if(cachedResponse){
        console.log(`//returned cache "${url.href}"`)
        return cachedResponse
      }
      console.log(`//returned fetch "${url.href}"`)
      return a;
    })
  );
});



self.addEventListener('install', (event) => {
  console.log('//installing');
  self.skipWaiting(); // Activate immediately
  fetch('/index.json').then(res=>res.json()).then(res=>{
    neverCache=res.never
    for(const a of res.always){
      fetch(a)
    }
  })
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});

