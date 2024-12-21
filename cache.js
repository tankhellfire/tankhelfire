// Cache name
const CACHE_NAME = 'tankh-cache';

// List of assets to cache
const assetsToCache = [
  "/logic/assets/mouse.svg"
];

// Install event: cache assets
self.addEventListener('install', (event) => {
  console.log('install')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets');
      return cache.addAll(assetsToCache);
    })
  );
});

// Fetch event: serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if(cachedResponse){
        console.log(`returning "${event.request.url}" from ${CACHE_NAME}`)
        return cachedResponse
      }
      console.log(event.request)
      if(event.request.url.startsWith('https://tankhellfire.glitch.me')){
        console.log(`adding "${event.request.url}" to ${CACHE_NAME}`)
        caches.open(CACHE_NAME).then(cache=>cache.add(event.request))
      }
      console.log(`fetching "${event.request.url}"`)
      return fetch(event.request);
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
