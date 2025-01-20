let out={};

(async()=>{
  for(let a of await caches.keys()){
    out[a]=[]
    for(let b of (await (await caches.open(a)).keys()).map(a=>a.url)){
      out[a].push(b)
    }
  }
  json.textContent  = JSON.stringify(out, null, 2)
})()