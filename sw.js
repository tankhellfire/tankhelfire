if(typeof window==="undefined"){

const CACHE_NAME = 'page-load';

let neverCache=[
  '/games/scratch/spacegamev5.html',
]
for(const a of [
  '/txt'
]){
  console.log(`//always cache ${fixUrl(a)}`)
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
      console.log(`//redirecting "${event.request.url}"->"${url}"`)
      return event.respondWith(Response.redirect(url, 301))
    }
    event.respondWith(
      caches.match(url).then((cachedResponse) => {
        const a=cache(url)


        if(cachedResponse){
          console.log(`//returned cache "${url}"`)
          return cachedResponse
        }
        console.log(`//returned fetch "${url}"`)
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

}else{navigator.serviceWorker.register('/sw.js', { scope: '/' })}