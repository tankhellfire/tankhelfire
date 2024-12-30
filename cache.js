// Cache name
const CACHE_NAME = 'tankh-cache';
const neverCache=[]

// Fetch event: serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      
      const url=new URL(event.request.url,event.request.origin)
      console.log(event.request)
      let a=fetch(event.request).then(res=>{
        
        
        if(url.hostname=='tankhellfire.glitch.me'){
          if(neverCache.includes(url.pathname)){
            console.log(`//neverCache "${url.herf}"`)
            return res.clone()
          }
          
          caches.open(CACHE_NAME).then(cache=>{
            cache.put(url.herf,res.clone())
            console.log(`//updated "${url.herf}"`)
          })
        }
        
        return res.clone()
      })
      
      
      if(cachedResponse){
        return cachedResponse
      }
      return a;
    })
  );
});

// self.addEventListener('message', event => {
//   if (event.data && event.data.type === 'FROM_PAGE') {
//     console.log(event);
//   }
// });



self.addEventListener('install', (event) => {
  console.log('Installing Service Worker...');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Activating Service Worker...');
  event.waitUntil(clients.claim()); // Take control of all open pages
});

