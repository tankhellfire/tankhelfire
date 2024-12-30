const CACHE_NAME = 'tankh-cache';

let neverCache=['/games/scratch/spacegamev5.html']
let alwaysCache=['/txt']

function cache(res,url=new URL(res.url)){
  if(url.hostname=='tankhellfire.glitch.me'){

    if(neverCache.includes(url.pathname)){
      console.log(`//never cache"${url.href}"`)
      // return res.clone()
    }

    caches.open(CACHE_NAME).then(cache=>{
      cache.put(url.href,res.clone())
      console.log(`//updated cache"${url.href}"`)
    })
  }

  // return res.clone()
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const url=new URL(event.request.url)
      const a=fetch(event.request).finally(res=>cache(res))
      
      
      if(cachedResponse){
        console.log(`//returned cache "${url.href}"`)
        return cachedResponse
      }
      console.log(`//returned fetch "${url.href}"`)
      return a;
    })
  );
});

for(const a of alwaysCache){
  console.log(`//always cache ${a}`)
  fetch(a).then(cache)
}


self.addEventListener('install', (event) => {
  console.log('//installing');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});