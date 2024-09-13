const CACHE_NAME = "offline-cache";
const OFFLINE_URLS = [
  "/wifi",
  // 'offline.png'
];
self.addEventListener("install", (event) => {
  console.log("install", event);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("fetch", event);
  event.respondWith('a'
    // caches.match(event.request).then((response) => {
    //   return "a"; //response //|| fetch(event.request);
    // })
  );
});

console.log(self);
