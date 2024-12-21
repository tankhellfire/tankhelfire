// Cache name
const CACHE_NAME = 'tankh-cache';

// Fetch event: serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      console.log(`fetching "${event.request.url}"`)
      let a=fetch(event.request)
      if(cachedResponse){
        console.log(`returning "${event.request.url}" from cache`)
        return cachedResponse
      }
      if(event.request.url.startsWith('https://tankhellfire.glitch.me')){
        a.then(res=>caches.open(CACHE_NAME).then(cache=>{
          cache.put(event.request.url,res)
          console.log(`updated "${event.request.url}"`)
        }))
      }
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
  console.log(clients)

  event.waitUntil(clients.claim()); // Take control of all open pages
});

