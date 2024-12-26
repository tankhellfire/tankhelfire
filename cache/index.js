(async()=>{
  for(let a of await caches.keys()){
    clog(a)
    cawait(await(caches.open('tankh-cache')).matchAll())
  }
})()