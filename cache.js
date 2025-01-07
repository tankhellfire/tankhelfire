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
  try{
    let res=await fetch(url)
    if(url.hostname=='tankhellfire.glitch.me'){ 

      if(neverCache.includes(url.pathname)){
        console.log(`//never cache "${url.pathname}"`)
        return res.clone()
      }

      caches.open(CACHE_NAME).then(cache=>{
        cache.put(url.pathname,res.clone())
        console.log(`//updated cache "${url.pathname}"`)
      })
    }

    return res.clone()
  }catch(err){
    console.warn(`//failed ${url}`)
    return err
  }
}

self.addEventListener('fetch', (event) => {
  console.log(event)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const url=new URL(event.request.url)
      const a=cache(url)
      
      
      if(cachedResponse){
        console.log(`//returned cache "${url.href}"`)
        return cachedResponse
      }
      console.log(`//returned fetch "${url.href}"`)
      return a;
    })
  );
});


self.addEventListener('install', (event) => {
  console.log('//installing');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('//activating');
  event.waitUntil(clients.claim()); // Take control of all open pages
});