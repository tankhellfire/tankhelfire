const lib={
  load:async(...paths)=>{
    if(paths.length===1){
      if(Array.isArray(paths[0])){
        const path=lib.dir+paths[0]
        if(lib.cache[path]===undefined){
          console.log(`loading"${lib.dir+path}"`)
          lib.cache[path]=Function(await((await(fetch(path))).text()))()
        }
        return lib.cache[path]
      }
      for(const path in paths[0]){
        paths[0][path]=lib.load(paths[0][path])
      }
    }
    return Promise.all(paths.map(a=>lib(a)))
  },
  dir:'https://tankhellfire.glitch.me/lib/',
  cache:{}
}
if(typeof window === "undefined"){module.exports = exports =lib}