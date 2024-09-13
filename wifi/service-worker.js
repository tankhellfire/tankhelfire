const CACHE_NAME = 'offline-cache';
const OFFLINE_URLS = [
    '/wifi',
    // 'online.png',
    // 'offline.png'
];
console.log('a')
self.addEventListener('install', event => {
console.log(self)
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
            return response || fetch(event.request);
        })
    );
});

console.log(self)