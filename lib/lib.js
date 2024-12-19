if(typeof(window)=== "undefined" && typeof(fetch) === "undefined"){global.fetch=require('node-fetch')}

const lib=async(...paths)=>{
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
      console.log(`loading "${paths[0]}" from ${path}`)
      try{
        lib.cache[path]=await Object.getPrototypeOf(async()=>{}).constructor(await((await(fetch(path))).text())+';return exports')()
      }catch(err){
        console.error(err)
        return
      }
    }
    return lib.cache[path]

  }
  return Promise.all(paths.map(a=>lib.load(a)))
}
lib.dir='https://tankhellfire.glitch.me/lib/'
lib.cache={}
if(typeof window === "undefined"){global.lib=module.exports=exports=lib}else{window.lib=exports=lib}