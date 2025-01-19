class Fs {
  constructor(id) {
    this.element = fileDirs.appendChild(document.createElement("div"))
    this.element.id = "dir" + id;
    this.element.classList.add('flex')

    this.button = this.element.appendChild(document.createElement("button"))
    this.button.id = "dir" + id + "Button"
    this.button.innerText = "dir" + id

    this.text = this.element.appendChild(document.createElement("div"))
    this.text.id = "dir" + id + "text"
    this.text.innerText = "click to set location"

    this.button.onclick = async () => {
      this.dir = await window.showDirectoryPicker({id:`etewaottFs${id}`})
      this.text.innerText = this.dir.name
      // alert("start")
      await this.makeOverVeiw()
      this.directoryOverVeiw={}
      this.makeDirectoryOverVeiw()
      // alert("end")
    }
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
        info.textContent=jobNum
        console.log(thread, 'new job', jobNum)
        let job = files[jobNum]
        if (job === undefined) {
          break
        }
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
  
  async diff(to){
    let ret={same:0,push:0,pull:0}
    for(let fromFileNum in this.overVeiw){
      let fromFile=this.overVeiw[fromFileNum]
      console.log(`${(fromFileNum/this.overVeiw.length*100).toFixed(2)}% ${fromFileNum}/${this.overVeiw.length}`)
      let toFile=to.getFromPath(fromFile.path)?.file
      if(fromFile?.info?.size===toFile?.info?.size&&fromFile?.info?.hash?.sha256===toFile?.info?.hash?.sha256){
        ret.same++
        continue
      }
      if(fromFile?.info?.lastModified<toFile?.info?.lastModified){
        ret.pull++
      }else{
        ret.push++
      }
    }
    return ret
  }
  
  async sync(to,first=1,ret={same:0,push:0,pull:0}){
    for(let fromFileNum in this.overVeiw){
      let fromFile=this.overVeiw[fromFileNum]
      console.log(`${(fromFileNum/this.overVeiw.length*100).toFixed(2).padStart(6)}% ${fromFileNum.padStart(this.overVeiw.length.toString().length)}/${this.overVeiw.length}`)
      let toFile=(await to.makeFromPath(fromFile.path))?.file
      if(fromFile?.info?.size===toFile?.info?.size&&fromFile?.info?.hash?.sha256===toFile?.info?.hash?.sha256){
        ret.same++
        continue
      }
      if(fromFile.info.lastModified<toFile.info.lastModified){
        ret.pull++
        await fromFile.write(await (await toFile.read()).arrayBuffer())
      }else{
        ret.push++
        await toFile.write(await (await fromFile.read()).arrayBuffer())
      }
    }
    
    if(first){
      await to.sync(this,0,ret)
    }
    return ret
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

let fs = [new Fs(0), new Fs(1)]







