const CACHE_NAME = "chat-offline-cache";
const OFFLINE_URLS = [
  "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx?download=true"
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
  event.respondWith('a',(event)=>{
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  });
});

console.log(self);