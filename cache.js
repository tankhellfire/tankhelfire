const CACHE_NAME = 'tankh-cache';

let neverCache=[
  '/games/scratch/spacegamev5.html',
]
for(const a of [
  '/txt'
]){
  console.log(`//always cache ${a}`)
  cache(a)
}

function fixUrl(url){
  url=new URL(url,self.location.origin)
  if(url.hostname=='tankhellfire.glitch.me'){
    let end=url.pathname.split('/').pop()
    if(!end.includes('.')){
      if(end!==''){
        url.pathname+='/'
      }
      url.pathname+='index.html'
    }
  }
  return url
}

async function cache(a){
  let url=fixUrl(a)
  let res=await fetch(url)
  if(!res.ok){
    return res.clone()
  }

  if(neverCache.includes(url.pathname)){
    console.log(`//never cache "${url}"`)
    return res.clone()
  }

  caches.open(CACHE_NAME).then(cache=>{
    cache.put(url.pathname,res.clone())
    console.log(`//updated cache "${url}"`)
  })

  return res.clone()
}

self.addEventListener('fetch', (event) => {
  const url=fixUrl(event.request.url)
  
  if(url.hostname=='tankhellfire.glitch.me'){
    if(url!=event.request.url){
      return event.respondWith()
    }
    event.respondWith(
      caches.match(url).then((cachedResponse) => {
        const a=cache(url)


        if(cachedResponse){
          console.log(`//returned cache "${url.href}"`)
          return cachedResponse
        }
        console.log(`//returned fetch "${url.href}"`)
        return a;
      })
    )
  }
  
});


self.addEventListener('install', (event) => {
  console.log('//installing');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});