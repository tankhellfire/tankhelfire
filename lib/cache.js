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
  console.log(event)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
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
