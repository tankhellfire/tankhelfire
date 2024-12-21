// Cache name
const CACHE_NAME = 'tankh-cache';

// Fetch event: serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      let a=fetch(event.request).then(res=>{
        
        if(event.request.url.startsWith('https://tankhellfire.glitch.me')){
          caches.open(CACHE_NAME).then(cache=>{
            cache.put(event.request.url,res.clone())
            // console.log(`updated "${event.request.url}"`)
          })
        }
        
        return res.clone()
      })
      
      
      if(cachedResponse){
        // console.log(`returning "${event.request.url}" from cache`)
        return cachedResponse
      }
      // console.log(`returning "${event.request.url}" from fetch`)
      return a;
    })
  );
});


self.addEventListener('install', (event) => {
  console.log('Installing Service Worker...');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Activating Service Worker...');
  event.waitUntil(clients.claim()); // Take control of all open pages
});

