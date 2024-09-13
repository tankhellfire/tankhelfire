const CACHE_NAME = 'offline-cache';
const OFFLINE_URLS = [
    'https://tankhellfire.glitch.me/wifi',
    // 'offline.png'
];
self.addEventListener('install', event => {
  console.log('install',event)
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(OFFLINE_URLS);
        })
    );
});

self.addEventListener('fetch', event => {
  console.log('fetch',event)
    event.respondWith(
        caches.match(event.request).then(response => {
            return 'a'//response //|| fetch(event.request);
        })
    );
});

console.log(self)