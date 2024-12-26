let out={}

function pass(inp,depth=0) {
  if (typeof inp==='undefined') {return}
  if (typeof inp==='function') {return 'func'}
  if (typeof inp==='object') {
    if(depth<0){
      if(inp==null){return}
      if(Object.keys(inp).length==0){return 'OOR'}
      return inp
    }
    let ret={}
    for (let a in inp){
      ret[a]=pass(inp[a],depth-1)
    }
    if(Object.keys(ret).length==0){return {}}
    return ret
  }
  return inp
}

(async()=>{
  for(let a of await caches.keys()){
    out[a]={}
    for(let b of await (await caches.open('tankh-cache')).matchAll()){
      out[a][b.url]=pass(b,5)
    }
  }
  json.textContent  = JSON.stringify(out, null, 2)
})()