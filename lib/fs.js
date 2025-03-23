async function thread(jobs,func,threads=10){
  jobs=[...jobs]
  let out=[]
  let activeThreads=0
  
  await new Promise(done=>{
    async function newThread(){
      let id=activeThreads++
      while(1){
        let job=jobs.pop()
        if(job===undefined)break
        if(activeThreads<threads)newThread()
        out.push(await func(job,jobs,id))
      }
      activeThreads--
      if(activeThreads==0)done()
    }
    
    newThread()
  })
    
  return out
}

function startsWith(a,b){
  if(a.length<b.length)return 0
  return b.every((e,i)=>e===a[i])
}

function deepAssign(target,source){
  for(let key in source){
    if(
      (source[key]&&typeof source[key]==='object'&&!Array.isArray(source[key]))&&
      (target[key]&&typeof target[key]==='object'&&!Array.isArray(target[key]))
    ){
      deepAssign(target[key],source[key])
    }else if(source[key]!==undefined){
      target[key]=source[key]
    }
  }
  return target;
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

  async refreshAll(threads=10){

    return Fs.thread([this],async(job,jobs)=>{
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

  async remove(opt){//recursive
    await this.loadHandle()
    return this.handle.remove(opt)
  }
}

class File{
  constructor(handle,path=[],root){
    this.handle=handle
    this.path=path
    if(root)this.root=root
    this.getMetadata()
  }

  getMetadata(){
    if(this.root.isMeta(this.path))return;
    if(this.root?.metadata){
      if(this.metadata=(this.root.metadata.find(e=>e.local.path.join('/')===this.path.join('/')))){return this.metadata}else{
        console.log(`making ${this.path.join('/')}`)
        return this.metadata=this.root.metadata[this.root.metadata.push({local:{path:this.path}})-1]
      }
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

  async updateInfo(fileGet,{modified=1}={}){
    if(!this.root.isMeta(this.path)){
      this.getMetadata()
    }
    let out={
      local:{
        path:this.path,
        size:fileGet.size,
        modified:fileGet.lastModified
      },
      public:{
        created:this?.metadata?.public?.created??fileGet.lastModified,
        modified:this?.metadata?.public?.modified??fileGet.lastModified
      }
    }

    if(this.metadata){
      if(modified&&this.metadata?.local?.modified<out.local.modified){
        out.public.modified=out.local.modified
        console.warn(`updated ${this.path.join('/')}
${JSON.stringify(out)}`)
      }
      return Fs.deepAssign(this.metadata,out)
    }
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

  async remove(opt){//recursive
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
      this.metadata=JSON.parse(await(await(await this.get([...this.metadataPath,'m.txt'])).read()).text())
      this.cache={}
      await Fs.thread(this.metadata,async(job,jobs,id)=>{
        if(this.isMeta(job.local.path))return 0
        await this.get(job.local.path)
      },10)
    }catch(err){
      console.error(err)
      this.metadata=[]
    }

    
    await perm

    return (performance.now()-time)/1000
  }

  async saveMetadata(){
    return (await(await this.getFolder(this.metadataPath)).get('m.txt')).write(JSON.stringify(this.metadata.sort((a,b)=>(a.local.path.join('/')>b.local.path.join('/'))*2-1)))
  }

  isMeta(arr){
    return Fs.startsWith(arr,this.metadataPath)
  }

  
  async blindPush(target,opt){
    return Fs.thread((await this.refreshAll()).filter(e=>e.constructor==Fs.File&&!this.isMeta(e.path)).sort((a,b)=>(a.path.join('/')>b.path.join('/'))*2-1),async(job,jobs,id)=>{
      let tFile=await target.get(job.path)
      await tFile.write(await job.read(),{modified:0})
      Fs.deepAssign(tFile.metadata.public,job.metadata.public)
    },opt.threads??10)
  }
  
}
// let a=await D.fs.refreshAll()
// let b=await Promise.all(a.filter(e=>e.constructor==Fs.File&&!D.fs.isMeta(e.path)).sort((a,b)=>(a.path.join('/')>b.path.join('/'))*2-1).map(e=>e.getInfo()))

// D.fs.metadata.filter(e=>Fs.startsWith(e.local.path,['dmusic'])).forEach(e=>deepAssign(e.public,{tankhellfire:{music:1}}))

// await D.fs.saveMetadata()

// const arrayBuffer = await fileGet.arrayBuffer();
// const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
// const hashArray = Array.from(new Uint8Array(hashBuffer));
// const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');


Fs.Folder=Folder
Fs.File=File
Fs.startsWith=startsWith
Fs.thread=thread
Fs.deepAssign=deepAssign

exports=Fs
