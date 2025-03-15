async function thread(jobs,func,threads=10){
  jobs=[...jobs]
  let out=[]
  let activeThreads=0
  
  await new Promise(done=>{
    async function newThread(){
      activeThreads++
      while(1){
        let job=jobs.pop()
        if(job===undefined)break
        if(activeThreads<threads)newThread()
        out.push(await func(job,jobs))
      }
      activeThreads--
      if(activeThreads==0)done()
    }
    
    newThread()
  })
    
  return out
}

class Folder{
  constructor(handle,path=[],root){
    this.handle=handle
    this.path=path
    this.cache={}
    this.root=root??this
  }

  async requestPermission(){
    await this.loadHandle()
    return this.handle.requestPermission({
      mode: "readwrite"
    })
  }

  async loadHandle(){
    return this.handle??(this._getHandle??(this.handle=await (this._getHandle=this.root.getFolder(this.path.slice(0,-1)).then(async(folder)=>{
      console.log(`loading /${this.path.join('/')}/`)
      return (await folder.loadHandle()).getDirectoryHandle(this.path[this.path.length-1],{create:1})
    }))))
  }

  async refresh(out=[]){
    this.cache={}
    await this.loadHandle()
    let val=this.handle.values()
    while(1){
      let {value,done}=await val.next()
      if(done)break
      if(value.kind==="directory"){
        out.push(await this.getFolder(value.name,value))
        continue
      }
      if(value.kind==="file"){
        out.push(await this.get(value.name,value))
        continue
      }
      console.warn(`unknown kind:"${value.kind}", @"${[...path,value.name].join('/')}" in`,value)
    }
    return out
  }

  async refreshAll({out=[],threads=10}={}){

    return thread([this],async(job,jobs)=>{
      if(job.constructor===Fs.Folder||job.constructor===Fs){await job.refresh(jobs)}
      return job
    },threads)
  }

  async getFolder(name,opt={}){
    if(typeof name==='string')return this.cache[name]??(this.cache[name]=new Fs.Folder(opt.handle,[...this.path,name],this.root))//await this.handle.getDirectoryHandle(name,{create:1})
    if(name.length==1)return this.getFolder(name[0],opt)
    if(name.length==0)return this
    let [first,...rest]=name
    return (await this.getFolder(first,opt)).getFolder(rest,opt)
  }
  async get(name,opt={}){
    if(typeof name==='string')return this.cache[name]??(this.cache[name]=new Fs.File(opt.handle,[...this.path,name],this.root))//await this.handle.getFileHandle(name,{create:1})
    if(name.length==1)return this.get(name[0],opt)    
    return (await this.getFolder(name.slice(0,-1),opt)).get(name[name.length-1],opt)
  }

  async remove(opt={recursive:1}){
    await this.loadHandle()
    return this.handle.remove(opt)
  }
}

class File{
  constructor(handle,path=[],root){
    this.handle=handle
    this.path=path
    if(root)this.root=root
    this.findMetadata()
  }

  findMetadata(){
    if(this.root?.metadata){
      return this.metadata=this.root.metadata.find(e=>e.file.path.join('/')===this.path.join('/'))
    }
  }

  async loadHandle(){
    // return this.handle??(this.handle=await this.root.get(this.path,{cacheOnly:0}))
    return this.handle??(this._getHandle??(this.handle=await (this._getHandle=this.root.getFolder(this.path.slice(0,-1)).then(async(folder)=>{
      console.log(`loading /${this.path.join('/')}`)
      return (await folder.loadHandle()).getFileHandle(this.path[this.path.length-1],{create:1})
    }))))
  }

  async getInfo(opt){
    await this.loadHandle()
    return this.updateInfo(await this.handle.getFile(),opt)
  }

  async updateInfo(fileGet,opt={modify:1}){
    let out={
      file:{
        path:this.path,
        size:fileGet.size,
        history:{
          create:this?.metadata?.file?.history?.create??fileGet.lastModified,
          modify:this?.metadata?.file?.history?.modify??fileGet.lastModified,
          local:fileGet.lastModified//
        }
      }
    }
    if(this?.metadata?.file?.history){
      if(this.metadata.file.history.local<out.file.history.local){
        if(opt.modify){
          out.file.history.modify=out.file.history.local
        
          console.warn(`updated ${this.path.join('/')}
from:
${JSON.stringify(this.metadata)}
to:
${JSON.stringify(out)}`)
        }
      }
    }
    if(this.metadata){
      Object.assign(this.metadata,out)
      return out
    }
    if(!this.root.metadata)return out
    if(!this.findMetadata()){
      return this.metadata=this.root.metadata[this.root.metadata.push(out)-1]
    }
    console.error('this shouldn\'t happen')
    return out
  }

  async read(){
    await this.loadHandle()
    let fileGet=await this.handle.getFile()
    await this.updateInfo(fileGet)
    return fileGet
  }
  async write(content,opt){
    await this.loadHandle()
    let write = await this.handle.createWritable()
    try {
      await write.write(content)
    } catch (err) {
      console.error(err)
    }
    await write.close()
    await this.getInfo(opt)
  }

  async remove(opt={recursive:1}){
    await this.loadHandle()
    return this.handle.remove(opt)
  }
}

class Fs extends Folder{//showDirectoryPicker
  constructor(handle){
    super(handle)
  }

  async setup(metadataPath=['.etewaott']){

    let time=performance.now()
    
    let perm=this.requestPermission()

    this.metadataPath=metadataPath
    try{
      this.metadata=JSON.parse(await(await(await fs[0].fs.get([...fs[0].fs.metadataPath,'m.txt'])).read()).text())
      this.cache={}
      await thread(fs[0].fs.metadata,async(job,jobs)=>{
        await fs[0].fs.get(job.file.path)
      },10)
    }catch(err){
      console.error(err)
      this.metadata=[]
    }

    
    await perm

    alert(`setuptime ${(performance.now()-time)/1000}`)
  }

  async blindPush(target){
    
  }

  async saveMetadata(){
    return (await(await fs[0].fs.getFolder(this.metadataPath)).get('m.txt')).write(JSON.stringify(this.metadata.sort((a,b)=>(a.file.path.join('/')>b.file.path.join('/'))*2-1)))
  }
  
}
//
// let a=await fs[0].fs.refreshAll()
// let b=await Promise.all(a.filter(e=>e.constructor==Fs.File).sort((a,b)=>(a.path.join('/')>b.path.join('/'))*2-1).map(e=>e.getInfo()))



// const arrayBuffer = await fileGet.arrayBuffer();
// const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
// const hashArray = Array.from(new Uint8Array(hashBuffer));
// const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');


Fs.Folder=Folder
Fs.File=File

exports=Fs
