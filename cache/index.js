let out={}
(async()=>{
  for(let a of await caches.keys()){
    clog(a)
    out[a]={}
    for(let b of await (await caches.open('tankh-cache')).matchAll()){
      out[a][b.url]={
        status:b.status
      }
    }
    
  }
})()