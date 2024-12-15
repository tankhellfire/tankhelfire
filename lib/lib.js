const lib={
  load:async(...paths)=>{
    if(paths.length===1){
      if(typeof paths[0]==='object'){
        for(const path in paths[0]){
          paths[0][path]=lib.load(paths[0][path])
        }
        for(const path in paths[0]){
          paths[0][path]=await paths[0][path]
        }
        return paths[0]
      }
      
      const path=lib.dir+paths[0]
      if(lib.cache[path]===undefined){
        console.log(`loading"${lib.dir+path}"`)
        try{
          lib.cache[path]=Function(await((await(fetch(path))).text()))()
        }catch(err){
          console.error(err)
          return
        }
      }
      return lib.cache[path]

    }
    return Promise.all(paths.map(a=>lib.load(a)))
  },
  dir:'https://tankhellfire.glitch.me/lib/',
  cache:{}
}
if(typeof window === "undefined"){module.exports = exports =lib}