const CACHE_NAME = 'tankh-cache';

let neverCache=[
  '/games/scratch/spacegamev5.html'
]
for(const a of [
  '/txt'
]){
  console.log(`//always cache ${a}`)
  fetch(a)
}

function cache(a){
  const url=new URL(a,self.location.origin)
  return fetch(url).then(res=>{
    if(url.hostname=='tankhellfire.glitch.me'){

      if(neverCache.includes(url.pathname)){
        console.log(`//never cache "${url.pathname}"`)
        return res.clone()
      }

      caches.open(CACHE_NAME).then(cache=>{
        cache.put(url.pathname,res.clone())
        console.log(`//updated cache "${url.pathname}"`)
      })
    }

    return res.clone()
  })
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const url=new URL(event.request.url)
      const a=cache(url)
      
      
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
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});