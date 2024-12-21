// Cache name
const CACHE_NAME = 'tankh-cache';

// Fetch event: serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if(cachedResponse){
        console.log(`returning "${event.request.url}" from ${CACHE_NAME}`)
        return cachedResponse
      }
      console.log(`fetching "${event.request.url}"`)
      let a=fetch(event.request)
      if(event.request.url.startsWith('https://tankhellfire.glitch.me')){
        console.log(`adding "${event.request.url}" to ${CACHE_NAME}`)
        a.then(res=>caches.open(CACHE_NAME).then(cache=>cache.put(event.request.url,res)))
      }
      return a;
    })
  );
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('activate')
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});
