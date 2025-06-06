// D.fs.metadata.filter(e=>Fs.startsWith(e.local.path,['dmusic'])).forEach(e=>deepAssign(e.public,{tankhellfire:{music:1}}))

class chainList{
  constructor(data){
    this.data=data
  }
  get next(){
    return this._next
  }
  get last(){
    return this._last
  }

  set next(val){
    this._next=val
    if(val&&val.last!==this)val.last=this
  }
  set last(val){
    this._last=val
    if(val&&val.next!==this)val.next=this
  }

  find(condition){
    let chain=this
    while(chain.next?.data){
      if(condition(chain.next))break
      chain=chain.next
    }
    return chain
  }
  
  insert(val){
    val.last=this.last
    val.next=this
  }

  after(val){
    val.next=this.next
    val.last=this
  }

  remove(){
    if(this.last)this.last.next=this.next
    if(this.next)this.next.last=this.last
  }
  

  *[Symbol.iterator](){
    let chain=this
    while(chain?.data){
      yield chain.data
      chain=chain.next
    }
  }
}

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
    let pre=this.inUse
    return this.inUse=new Promise(async(done)=>{
      if(pre)await pre
      let write=await(await this.handle).createWritable({mode:"exclusive"})
      try {
        await write.write(content)
      } catch (err) {
        console.error(err)
      }
      await write.close()
      if(this.root.metadata)await this.getInfo(opt)
      delete this.inUse
      done()
    })
  }

  async remove(opt){//recursive
    return (await this.handle).remove(opt)
  }
}

class Fs extends Folder{//showDirectoryPicker
  constructor(handle,name){
    super(handle)
    this.name=name
  }

  async setup(metadataPath=['.etewaott']){

    let time=performance.now()
    
    let perm=this.requestPermission()

    this.cache={}
    if(metadataPath){
      this.metadataPath=metadataPath
      try{
        this.metadata=JSON.parse(await(await(await this.get([...this.metadataPath,'m.txt'])).read()).text())
        for(let job of this.metadata){
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

  
  async blindPush(target,opt={}){
    return Fs.thread((await this.refreshAll()).filter(e=>e.constructor==Fs.File&&!this.isMeta(e.path)).sort((a,b)=>(a.path.join('/')>b.path.join('/'))*2-1),async(job,jobs,id)=>{
      let tFile=await target.get(job.path)
      await tFile.write(await job.read(),{modified:0})
      Fs.deepAssign(tFile.metadata.public,job.metadata.public)
    },opt.threads??10)
  }

  async push(target,opt={}){
    let thisFiles=Array.from(this.metadata).map(e=>this.get(e.local.path))//(await this.refreshAll()).filter(e=>e.constructor==Fs.File&&!this.isMeta(e.path))
    let targFiles=Array.from(target.metadata).map(e=>target.get(e.local.path))//(await target.refreshAll({getInfo:{modified:0}})).filter(e=>e.constructor==Fs.File&&!target.isMeta(e.path))

    let keep=Symbol('keep')
    
    let metadataTokeep=await Fs.thread(thisFiles,async(job,jobs,id)=>{
      let tFile=await target.get(job.path)
      tFile[keep]=1
      
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

  diff(targ){
    
  }


  async updateFromLocal({refreshOpt={}}={}){
    for(let metadata of this.metadata){
      metadata.unsourced=1
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

class ChunkedFs{
  constructor(handle,name){
    (this.folder=new Fs.Folder(handle)).name=name
    this.partitionSize=10*1000*1000
  }

  get metadata(){return this._metadata};set metadata(val){}

  async setup(opt){
    let startTime=performance.now()/1000
    let perm=this.folder.requestPermission()

    
    this.fileTree=new Fs.ChunkedFs.chunkTreeObject([],this)
    let metaChain=this._metadata=new chainList
    let partitions=this.partitions=new chainList

    let metadata=[]
    try{metadata=JSON.parse(await(await this.folder.get('0').read()).text())}catch(err){console.warn(err,'will replace on save')}
    
    for(let data of metadata){
      let file=this.get(data.local.path)
      file.metadata=data
      let chunkes=file.chunkes
      for(let chunk of data.local.chunkes??[]){
        let chunkItem=new chainList({path:data.local.path,start:chunk[0],end:chunk[1]})
        chunkes=chunkes.next=new chainList(chunkItem)

        let start=chunkItem.data.start
        partitions.find(a=>start<a.data.start).after(chunkItem)
      }
    }

    let pointer=partitions
    while(pointer.next?.data)pointer=pointer.next
    this.chunks=pointer.data?new Array(Math.ceil(pointer.data.end/this.partitionSize)).fill(new Blob):[]
    
        
    await perm
    return performance.now()/1000-startTime
  }

  async saveMetadata(){
    return this.folder.get('0').write(JSON.stringify(Array.from(cFs.metadata.next)))
  }

  get(path){
    let point=cFs.fileTree
    for(let name of path)point=(point.children??(point.children={}))[name]??(point.children[name]=new Fs.ChunkedFs.chunkTreeObject([...point.path,name],this))
    return point
  }

  async read(from,to){
    let chunks=[]
    let chunkOfset=from
    let going=1
    do{
      let start=chunkOfset
      let partition=Math.ceil((chunkOfset+1)/this.partitionSize)
      let end=partition*this.partitionSize
      let ofset=end-this.partitionSize
      if(to<=end){end=to;going=0}
      
      chunks.push(this.folder.get(partition+'').read().then(e=>e.slice(start-ofset,end-ofset)))
      chunkOfset=end
    }while(going)
    return new Blob(await Promise.all(chunks))
  }

  write(blob,to){
    let chunks=[]
    let chunkOfset=to
    let going=1
    do{
      let start=chunkOfset
      let partition=Math.ceil((chunkOfset+1)/this.partitionSize)
      let endOfPartition=partition*this.partitionSize
      let startOfPartition=endOfPartition-this.partitionSize
      let end=endOfPartition
      if(blob.size+to<=end){end=blob.size+to;going=0}

      let file=this.chunks[partition-1]??new Blob
      chunks.push(this.chunks[partition-1]=new Blob([file.slice(0,start-startOfPartition),blob.slice(start-to,end-to),file.slice(end-startOfPartition,this.partitionSize)]))
      //chunks.push(this.folder.get(partition+'').read().then(file=>this.folder.get(partition+'').write(new Blob([file.slice(0,start-startOfPartition),blob.slice(start-to,end-to),file.slice(end-startOfPartition,this.partitionSize)]))))
      chunkOfset=endOfPartition
    }while(going)
    return chunks
  }
}

class chunkTreeObject{
  constructor(path,root){
    this.root=root??this
    this.path=path
    this.isFile=0
  }

  becomeFile(){
    if(this.isFile)return;
    if(this.children)throw `but I'm a folder?`;
    this.isFile=1
    
    this.root.metadata.after(this._meta=new chainList({local:{path:this.path},public:{}}))
    this._chunkes=new chainList
  }

  get meta(){this.becomeFile();return this._meta};set meta(val){this.becomeFile();this._meta=val}
  get chunkes(){this.becomeFile();return this._chunkes};set chunkes(val){this.becomeFile();this._chunkes=val}

  get metadata(){return this.meta.data};set metadata(val){this.meta.data=val}

  async read(){
    let chunks=[]
    for(let chunkChain of this.chunkes.next)chunks.push(this.root.read(chunkChain.data.start,chunkChain.data.end))
    return new Blob(await Promise.all(chunks))
  }

  remove(){
    this.meta.remove()
    for(let chunk of this.chunkes.next??[]){chunk.remove()}
  }

  async write(blob){
    for(let chunk of this.chunkes.next??[]){chunk.remove()}
    
    let blobDone=0
    let chunkChain=this.chunkes
    let done=0
    let partitionHead=this.root.partitions
    let chunkes=[]
    
    do{
      partitionHead=partitionHead.find(a=>(a.last.data?.end??0)<(a?.data?.start??Infinity))
      let start=(partitionHead.data?.end??0)
      let maxLen=(partitionHead.next?.data?.start??Infinity)-start
      if(blob.size-blobDone<maxLen){maxLen=blob.size-blobDone;done=1}
      chunkes.push([start,start+maxLen])
      
      await Promise.all(this.root.write(blob.slice(blobDone,blobDone+maxLen),start))
      blobDone+=maxLen
      let chunkItem=new chainList({meta:this.path,start:start,end:start+maxLen})
      partitionHead.after(chunkItem)
      chunkChain=chunkChain.next=new chainList(chunkItem)
      
      partitionHead=chunkItem
    }while(!done)

    return chunkes
  }


// let cFs=new ChunkedFs(fs[0].fs.handle,'chunk')
// await cFs.setup()

// for(let meta of D.fs.metadata){
//     await cFs.get(meta.local.path).write(await D.fs.get(meta.local.path).read())
// }

// for(let i in cFs.chunks){
//     await cFs.folder.get(i*1+1+'').write(cFs.chunks[i])
// }
}


// let maxChunkSize=1000*1000*50
// let etefs=D.fs
// let chunckFs=fs[0].fs

// async function closeChunck(){
//   await write.close()
// }
// async function newChunck(){
//   if(write)await closeChunck()
//   write=await(await chunckFs.get(chunkes.push(chunk=[])+'').handle).createWritable()
//   chunkOfSet=0
// }
// let chunk
// let chunkes=[]
// let chunkOfSet
// let write
// await newChunck()

// async function addToChunk(data){
//   await write.write(data)
// }


// for(let file of etefs.metadata.map(e=>etefs.get(e.local.path))){
//   let data=await file.read()
//   let fileOfSet=0
//   let fileSize=data.size

//   while(1){
//     if(fileSize-fileOfSet<=maxChunkSize-chunkOfSet){
      
//       chunk.push({
//         file:file.path.join('/'),
//         from:fileOfSet,
//         to:fileSize
//       })
//       await addToChunk(data.slice(fileOfSet,fileSize))
//       chunkOfSet+=fileSize-fileOfSet
      
//       break
//     }else{

//       let pastFileOfSet=fileOfSet
//       chunk.push({
//         file:file.path.join('/'),
//         from:pastFileOfSet,
//         to:fileOfSet+=maxChunkSize-chunkOfSet
//       })
//       await addToChunk(data.slice(pastFileOfSet,fileOfSet))
//       await newChunck()
      
//     }
    
//   }
// }
// await closeChunck()

Fs.Folder=Folder
Fs.File=File
Fs.ChunkedFs=ChunkedFs
Fs.ChunkedFs.chunkTreeObject=chunkTreeObject
Fs.startsWith=startsWith
Fs.thread=thread
Fs.deepAssign=deepAssign

exports=Fs



// DDir.metadata.filter(e=>Fs.startsWith(e.local.path,['dmusic'])).forEach(e=>Fs.deepAssign(e.public,{tankhellfire:{music:1}}))
