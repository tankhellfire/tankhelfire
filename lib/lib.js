//eval(await(await fetch('https://tankhellfire.glitch.me/lib/lib.js')).text())
if(typeof fetch==="undefined"){console.log('making fetch from "node-fetch"');global.fetch=require('node-fetch')}
let lib=async(path)=>{
  let url=lib.dir+path
  if(lib.cache[path]!)return lib.cache[path]
  
  console.log(`loading "${path}" from ${url}`)
  try{
    lib.cache[path]=await lib.load(await((await(fetch(path))).text()))
  }catch(err){
    console.error(err)
    return
  }
}
lib.dir='https://tankhellfire.glitch.me/lib/'
lib.cache={}
lib.load=text=>(async()=>0).constructor('exports,lib',text+'\n;return exports')({},lib)
if(typeof exports!=="undefined"){exports=lib}
if(typeof module!=="undefined"){global.lib=module.exports=lib}
if(typeof window!=="undefined"){window.lib=lib}