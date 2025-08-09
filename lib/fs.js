// D.fs.metadata.filter(e=>Fs.startsWith(e.local.path,['dmusic'])).forEach(e=>deepAssign(e.public,{tankhellfire:{music:1}}))

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
    this._handle=handle
    this.path=path
    this.cache={}
    this.root=root??this
  }

  async requestPermission(){
    return (await this.handle).requestPermission({mode:"readwrite"})
  }

  get handle(){
    return this._handle??(this._handle=new Promise(async(res)=>{
      console.log(`loading ${this.root?.name}://${this.path.join('/')}/`)
      res(
        (
          await this.root.getFolder(this.path.slice(0,-1)).handle
        ).getDirectoryHandle(this.path[this.path.length-1],{create:1})
      ) 
    }))
  }


  async refresh(out=[]){
    this.cache={}
    let val=(await this.handle).values()
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

  async refreshAll({threads=10,getInfo={}}={}){
    return Fs.thread([this],async(job,jobs)=>{
      if(job.constructor===Fs.Folder||job.constructor===Fs){await job.refresh(jobs)}
      if(job.constructor===Fs.File){await job.getInfo(getInfo)}
      return job
    },threads)
  }

  getFolder(name,opt={}){
    if(typeof name==='string')return this.cache[name]??(this.cache[name]=new Fs.Folder(opt.handle,[...this.path,name],this.root))
    if(name.length==1)return this.getFolder(name[0],opt)
    let a=this
    for(let child of name){
      a=a.getFolder(child,opt)
    }
    return a
  }
  get(name,opt={}){
    if(typeof name==='string')return this.cache[name]??(this.cache[name]=new Fs.File(opt.handle,[...this.path,name],this.root,opt?.create))
    if(name.length==1)return this.get(name[0],opt)    
    return this.getFolder(name.slice(0,-1),opt).get(name[name.length-1],opt)
  }

  async remove(opt){//recursive
    console.warn(`deleting ${this.root?.name}://${this.path.join('/')}`)
    return (await this.handle).remove(opt)
  }
}

class File{
  constructor(handle,path=[],root,opt={}){
    this._handle=handle
    this.path=path
    this.root=root
  }

  set metadata(val){
    this._metadata=val
  }

  get metadata(){
    if(this._metadata)return this._metadata
    if(this.root){
      if(this.root.metadata){
        if(this.root.isMeta(this.path))return;
        if(this.metadata=(this.root.metadata.find(e=>e.local.path.join('/')===this.path.join('/')))){return this._metadata}else{
          console.warn(`making ${this.root?.name}://${this.path.join('/')}`,this.root)
          return this.metadata={local:{path:this.path},unlisted:1}
        }
      }else{return this.metadata=null}
    }
    console.warn('pasing')
    return this.metadata=null
  }

  get handle(){
    return this._handle??(this._handle=new Promise(async(res)=>{
      console.log(`loading ${this.root?.name}://${this.path.join('/')}`)
      res(
        (
          await this.root.getFolder(this.path.slice(0,-1)).handle
        ).getFileHandle(this.path[this.path.length-1],{create:1})
      )
    }))
  }

  async getInfo(opt){
    return this.updateInfo(await(await this.handle).getFile(),opt)
  }

  async updateInfo(fileGet,{modified=1}={}){
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
        out.updated=1
        console.warn(`updated ${this.root?.name}/${this.path.join('/')}
${JSON.stringify(out)}`,this.root)
      }
      return Fs.deepAssign(this.metadata,out)
    }
    return out
  }

  async read(){
    if(this.inUse)await this.inUse
    let fileGet=await(await this.handle).getFile()
    await this.updateInfo(fileGet)
    return fileGet
  }
  async write(content,opt){
    let write=await(await this.handle).createWritable()
    try{
      await write.write(content)
      await write.close()
      if(this.root.metadata)await this.getInfo(opt)
    }catch(err){
      console.error(err)
      throw err 
    }
    return
  }

  async remove(opt){
    console.warn(`removeing ${this.path.join('/')}`)
    return (await this.handle).remove(opt)
  }
}

class Fs extends Folder{//showDirectoryPicker
  constructor(handle,name){
    super(handle)
    this.name=name
  }

  async setup(metadataPath=['.etewaott'],writable=1){
    this.writable=writable

    let time=performance.now()
    
    let perm=this.requestPermission()

    this.cache={}
    if(metadataPath){
      this.metadataPath=metadataPath
      try{
        this.metadata=JSON.parse(await(await(await this.get([...this.metadataPath,'m.txt'])).read()).text())
        for(let id in this.metadata){
          let job=this.metadata[id]={
            local:this.metadata[id].local??{},
            public:this.metadata[id].public??{}
          }
          if(this.isMeta(job.local.path))continue
          this.get(job.local.path).metadata=job
        }
      }catch(err){
        console.error(err)
        this.metadata=[]
      }
    }else{
      delete this.metadataPath
      delete this.metadata
    }

    let fs=this
    this.api={
      async files(){return fs.metadata.map(e=>e.local.path)},
      
      async get(paths){return paths.map(e=>fs.get(e)?.metadata?.public)},
      async read(paths){
        let out=[]
        for(let path of paths){
          out.push(await fs.get(path).read())
        }
        return out
      },
      
      async set(bits){if(!fs.writable)throw `${fs.name} isn't writable`
                      
        for(let{path,data}of bits)fs.get(path).metadata.public=data
      },
      async write(bits){if(!fs.writable)throw `${fs.name} isn't writable`
                        
        for(let{path,data}of bits){
          let file=fs.get(path)
          await file.write(data)
          if(file.metadata.unlisted)fs.metadata.push(file.metadata)
        }
      },
      
      async remove(paths){if(!fs.writable)throw `${fs.name} isn't writable`
        
        let files=paths.map(e=>fs.get(e))
        let meta=files.map(e=>e.metadata)
        fs.metadata=fs.metadata.filter(e=>!meta.includes(e))
        await Promise.all(files.map(e=>e.remove()))
      },
    }

    let t=(performance.now()-time)/1000
    await perm
    return t
  }

  async saveMetadata(){
    return (await(await this.getFolder(this.metadataPath)).get('m.txt')).write(JSON.stringify(this.metadata.sort((a,b)=>(a.local.path.join('/')>b.local.path.join('/'))*2-1)))
  }

  isMeta(arr){
    return Fs.startsWith(arr,this.metadataPath)
  }

  async push(target,opt={}){
    let thisFiles=Array.from(this.metadata).map(e=>this.get(e.local.path))//(await this.refreshAll()).filter(e=>e.constructor==Fs.File&&!this.isMeta(e.path))
    let targFiles=Array.from(target.metadata).map(e=>target.get(e.local.path))//(await target.refreshAll({getInfo:{modified:0}})).filter(e=>e.constructor==Fs.File&&!target.isMeta(e.path))

    let keep=Symbol('keep')
    
    let metadataTokeep=await Fs.thread(thisFiles,async(job,jobs,id)=>{
      let tFile=await target.get(job.path)
      tFile.metadata[keep]=1
      
      if((tFile.metadata?.public?.modified??0)<(job.metadata?.public?.modified??0)){
        console.warn(job.path.join('/'),new Date(tFile.metadata?.public?.modified),new Date(job.metadata?.public?.modified))
        await tFile.write(await job.read(),{modified:0})
        Fs.deepAssign(tFile.metadata.public,job.metadata.public)
      }
      
      return tFile.metadata
    },opt.threads??10)


    let filesToRemove=[]
    for(let file of targFiles){
      if(!file.metadata[keep])filesToRemove.push(file)
    }
    
    await Fs.thread(filesToRemove,async(job,jobs,id)=>{
      await job.remove()
    },opt.threads??10)
    return target.metadata=metadataTokeep
  }


  async updateFromLocal({refreshOpt={}}={}){
    for(let metadata of this.metadata){
      metadata.unsourced=1
      delete metadata.unlisted
    }
    
    let localObjs=await this.refreshAll(refreshOpt)
    let localFiles=localObjs.filter(e=>e.constructor==Fs.File&&!this.isMeta(e.path))
    
    let files=[]
    
    let newFiles=[]
    let updatedFiles=[]
    let unchangedFiles=[]
    let removedFiles=[]
    for(let file of localFiles){
      files.push(file.metadata)
      delete file.metadata?.unsourced
      if(file.metadata?.unlisted){
        delete file.metadata?.unlisted
        newFiles.push(file.metadata)
        continue
      }
      if(file.metadata?.updated){
        delete file.metadata?.updated
        updatedFiles.push(file.metadata)
        continue
      }
      unchangedFiles.push(file.metadata)
    }

    for(let metadata of this.metadata){
      if(metadata.unsourced){
        removedFiles.push(metadata)
        continue
      }
    }
    return {files,newFiles,updatedFiles,unchangedFiles,removedFiles}
  }
}
// new updated unchanged removed


class FileManager{
  constructor(api){
    this.api=api
  }

  async diff(to){
    let fileTree={}
    let files=[]
    for(let path of await this.api.files()){
      let node=fileTree
      for(let name of path){
        node=(node.children??(node.children={}))[name]??(node.children[name]={})
      }
      
      files.push(node.data={path:path,0:(await this.api.get([path]))[0].modified})
    }

    for(let path of await to.api.files()){
      let node=fileTree
      for(let name of path){
        node=(node.children??(node.children={}))[name]??(node.children[name]={})
      }
      
      let modified=(await to.api.get([path]))[0].modified
      if(!node.data){
        files.push(node.data={path:path,1:modified})
      }else{
        node.data[1]=modified
      }
    }

    let newFiles=[]
    let updatedFiles=[]
    let unchangedFiles=[]
    let outdatedFiles=[]
    let removedFiles=[]

    for(let file of files){
      if(!file[0]){
        file.removed=1
        removedFiles.push(file.path)
      continue}
      if(!file[1]){
        file.new=1
        newFiles.push(file.path)
      continue}
          
      if(file[1]<file[0]){
        file.updated=1
        updatedFiles.push(file.path)
      continue}
      if(file[0]<file[1]){
        file.outdated=1
        outdatedFiles.push(file.path)
      continue}
      
      file.unchanged=1
      unchangedFiles.push(file.path)
    }
    
    return {files:files.map(e=>e.path),newFiles,updatedFiles,unchangedFiles,outdatedFiles,removedFiles,fileTree}
  }

  async copyTo(target,paths){
    await target.api.write(
      (await this.api.read(paths)).map((data,i)=>({
        path:paths[i],
        data
      }))
    )
    
    await target.api.set(
      (await this.api.get(paths)).map((data,i)=>({
        path:paths[i],
        data
      }))
    )
  }
}

class Cfs{
  constructor(folder,size=1024*1024*1){
    this.folder=folder
    this.size=size
    
    let cfs=this
    this.api={
      async files(){return cfs.metadata.arrayAfter().map(e=>e.p)},
      get:this.get,
      set:this.set,
      read:this.read,
      write:this.write,
      remove:this.remove
    }

  }

  async setup(name=this.folder?.path??'/cfs'){
    this.name=name
    let metadata=[]
    try{
      metadata=JSON.parse(await(await this.folder.get(['meta']).read()).text())
    }catch(err){console.error('no meta found'),err}


    this.metadata=new ChainNode
    this.fileTree=new TreeNode
    for(let data of metadata)this.makeNewFile(data)
  }

  makeNewFile(data){
    return this.fileTree.get(data.loc.path).d=new ChainNode(data).insertAfter(this.metadata.findBefore(node=>data?.loc?.file?.e<node.d?.loc?.file?.s))
  }

  async get(paths){
    return paths.map(path=>this.fileTree.get(path)?.d?.d?.pub??null)
  }
  async set(bits){
    for(let bit of bits){
      let treeNode=this.fileTree.get(bit.path)
      if(treeNode.d){
        treeNode.d.d.pub=bit.data
      }else{
        this.makeNewFile({loc:{path:bit.path},pub:bit.data})
      }
    }
  }

  async read(paths){
    let out=[]
    for(let path of paths){
      let file=this.fileTree.get(path)?.d?.d
      if(!file){
        console.warn(`${[this.name,...path].join('/')} not found when reading`)
        out.push(undefined)
      continue}
      
      let fileStart=file?.loc?.file?.s??NaN
      let fileEnd=file?.loc?.file?.e??NaN
      
      if(!fileStart<fileEnd){
        console.warn(`${[this.name,...path].join('/')} doesn't have a valid size`)
        out.push(undefined)
      continue}
      
      let chunk=Math.floor(fileStart/this.size)
      let parts=[]
      
      let i=0
      while(true){if(i<1000){console.error(`hit hardcap of ${1000*this.size} (1000 chunks) when reading ${[this.name,...path].join('/')}`);break}
        
        let chunkStart=chunk*this.size
        let chunkEnd=chunkStart+this.size

        let readStart=Math.Max(chunkStart,fileStart)
        let readEnd=Math.min(chunkEnd,fileEnd)

        if(readEnd<=readStart)break
        parts.push(await this.folder.get(['chunks',String(chunk)]).read())
                  
      i++}
      
      out.push(new Blob(parts))
    }
    return out
  }
  async resize(bits){
    for(const {path,size} of bits){
      const TreeNode=this.fileTree.get(path)
      
      let fileNode=TreeNode.d
      if(fileNode){
        console.log(fileNode.p?.d,fileNode.d,fileNode.n?.d)
        fileNode.p.n=fileNode.n
      }else{
        TreeNode.d=fileNode=new ChainNode({loc:{path}})
      }
      
      
      let node=this.metadata
      let start=0
      let end=0
      do{
        start=(node.d?.loc?.e??end)
        if(!node.n){
          end=Infinity
        break}
        node=node.n
        end=(node.d?.loc?.s??start);
      }while(end-start<size)

      fileNode.d.loc.s=start
      fileNode.d.loc.e=start+size

      console.log('insertBefore',node.p?.d,node.d,node.n?.d)
      fileNode.insertBefore(node)
      console.log('post insert',fileNode.p?.d,fileNode.d,fileNode.n?.d)
      
      // makeNewFile
      
    }
  }

  async remove(paths){
    for(let path of paths){
      console.warn(`removing ${[this.name,...path].join('/')}`)
      let a=this.fileTree.get(path)
      a.d.p.n=a.d.n=//remove node from chain
      delete a.d//remove node from tree
    }
  }
}

class TreeNode{
  constructor(d){
    this.d=d

    let treeNode=this
    this._c=new Proxy({},{
      set(targ,prop,val,rec){
        val._p=treeNode
        return Reflect.set(targ,prop,val,rec)
      },
      deleteProperty(targ,prop){
        val._p=undefined
        return Reflect.deleteProperty(targ,prop)
      }
    })
  }
  
  get p(){return this._p}
  get c(){return this._c}

  get(path,create=1){
    let treeNode=this
    for(let name of path){
      if(!treeNode.c[name]){
        if(!create)return undefined
        treeNode.c[name]=new TreeNode
      }
      treeNode=treeNode.c[name]
    }
    return treeNode
  }
}

class ChainNode{
  constructor(d){this.d=d}
  
  get p(){return this._p}
  get n(){return this._n}
  
  set p(val){
    if(this.p)this.p._n=undefined
    
    if(val)val._n=this
    return this._p=val
  }
  set n(val){
    if(this.n)this.n._p=undefined
    
    if(val)val._p=this
    return this._n=val
  }

  insertBefore(chain){
    this.p=chain.p
    this.n=chain
    return this
  }
  insertAfter(chain){
    this.n=chain.n
    this.p=chain
    return this
  }
  
  before(link){
    link.insertBefore(this)
    return this
  }
  after(link){
    link.insertAfter(this)
    return this
  }
  

  arrayAfter(){
    let out=[]
    let node=this
    while(node=node.n){
      out.push(node.d)
    }
    return out
  }
  arrayBefore(){
    let out=[]
    let node=this
    while(node=node.p){
      out.push(node.d)
    }
    return out
  }

  end(){
    let node=this
    while(node.p)node=node.p
    return node
  }
  start(){
    let node=this
    while(node.n)node=node.n
    return node
  }

  findBefore(func){
    let node=this
    while(node.n){
      if(func(node.n))break
      node=node.n
    }
    return node
  }
}


Fs.Folder=Folder
Fs.File=File
Fs.startsWith=startsWith
Fs.thread=thread
Fs.deepAssign=deepAssign

exports=Fs






//a=await D.fs.updateFromLocal()
//console.log(a.newFiles.map(e=>e.local.path),a.updatedFiles.map(e=>e.local.path),a.removedFiles.map(e=>e.local.path))

//D.fs.metadata=a.files
//D.fs.metadata.filter(e=>Fs.startsWith(e.local.path,['dmusic'])).forEach(e=>deepAssign(e.public,{tankhellfire:{music:1,audio:1}}))
//await D.fs.saveMetadata()



//D.fm=new FileManager(D.fs.api)
//console.log(await fs[0].fs.setup())
//fs[0].fm=new FileManager(fs[0].fs.api)
//a=await D.fm.diff(fs[0].fm)

//await D.fm.copyTo(fs[0].fm,a.newFiles)
//await D.fm.copyTo(fs[0].fm,a.updatedFiles)
//await fs[0].fm.api.remove(a.removedFiles)
//await fs[0].fs.saveMetadata()