const lib={
  load:async(...paths)=>{
    if(paths.length===1){
      const path=paths[0]
      if(lib.cache[path]===undefined){
        console.log(`loading"${lib.dir+path}"`)
        lib.cache[path]=Function(await((await(fetch(lib.dir+path))).text()))()
      }
      return lib.cache[path]
    }
    return Promise.all(paths.map(a=>lib(a)))
  },
  dir:'https://tankhellfire.glitch.me/lib/',
  cache:{}
}
if(typeof window === "undefined"){module.exports = exports =lib}