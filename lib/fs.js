class Fs {
  constructor(dir=undefined) {
    this.dir=dir
  }
  
  async makeOverVeiw(threads=10){
    let handle=this.dir
    let files=this.overVeiw=[]

    async function getAllPaths(handle, path=[]) {
      let val = handle.values()
      while (1) {
        let {value, done} = await val.next()
        if(done){break}
        if(value.kind==="directory"){await getAllPaths(value, [...path, value.name]);continue}
        if(value.kind==="file"){files.push(new FsFile({path:[...path, value.name],handle:value}));continue}
        console.warn(`unknown kind:"${value.kind}", @"${[...path, value.name].join('/')}" in`, value)
      }
    }
    await getAllPaths(handle)
    let i = 0
    let wait = []

    async function threadPassFile(thread) {
      while (1) {
        let jobNum = i++
        let job = files[jobNum]
        if (job === undefined) {
          break
        }
        percentLog(jobNum+1,files.length,thread)
        info.textContent=jobNum
        await job.updateInfo()
      }
    }

    // alert("passing files")

    for (let thread = 0; thread < threads; thread++) {
      wait.push(threadPassFile(thread))
    }
    await Promise.all(wait)
    return files
  } 
  makeDirectoryOverVeiw(){
    this.directoryOverVeiw={}
    let i=0
    for(let fileNum=0;fileNum<this.overVeiw.length;fileNum++){
      let path=this.overVeiw[fileNum].path
      let c=this.directoryOverVeiw

      for (i = 0; i < path.length-1; i++) {
        c=c[path[i]]??(c[path[i]]={})
      }
      c[path[i]]=fileNum
    }
  }
  
  getFromPath(pathArr){
    let c=this.directoryOverVeiw
    
    for (let path of pathArr) {
      if((c=c[path])===undefined){
        return undefined
      }
    }
    return {id:c,file:this.overVeiw[c]}
  }
  async makeFromPath(pathArr){
    let handle=this.dir
    let directory=this.directoryOverVeiw
    
    let i=0
    for (i=0;i<pathArr.length-1;i++) {
      handle=await handle.getDirectoryHandle(pathArr[i],{create:1})
      directory=directory[pathArr[i]]??(directory[pathArr[i]]={})
    }
    handle=await handle.getFileHandle(pathArr[i],{create:1})
    let id=directory[pathArr[i]]??(directory[pathArr[i]]=this.overVeiw.push(new FsFile({
      handle,
      path:pathArr
    }))-1)
    return {handle,id,file:this.overVeiw[id]}
  }
}

class FsFile{
  constructor({handle,path=[],info={}}) {
    this.info=info
    this.handle=handle
    this.path=path
  }
  
  async updateInfo(){
    const fileGet = await this.handle.getFile()

    const arrayBuffer = await fileGet.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return this.info = {
      kind: this.handle.kind,

      lastModified: fileGet.lastModified,
      name: fileGet.name,
      size: fileGet.size,
      type: fileGet.type,

      hash: {
        sha256: hashHex
      }
    }
  }
  
  async read(){
    return await this.handle.getFile()
  }
  
  async write(content){
    let write=await this.handle.createWritable()
    try{
      await write.write(content)
    }catch(err){console.error(err)}
    await write.close()
    return await this.updateInfo()
  }
}
function percentLog(value,max=1,id='') {
  console.log(`${(value/max*100).toFixed(2).padStart(6)}% [${''.padEnd(value/max*50,'+').padEnd(50)}] ${value.toString().padStart(max.toString().length)}/${max} from ${id}`)
}
