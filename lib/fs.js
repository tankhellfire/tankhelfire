class Folder{
  constructor(handle,path=[]){
    this.handle=handle
    this.path=path
  }

  async refresh({threadJobArr}){
    this.children={}
    this.files={}
    this.folders={}

    let val=this.handle.values()
    while(1){
      let {value,done}=await val.next()
      if(done)break
      if(value.kind==="directory"){
        if(threadJobArr){
          threadJobArr.push({obj:this,func:"getFolder",paramiters:[value.name,value],value})
          continue
        }
        await this.getFolder(value.name,value)
        continue
      }
      if(value.kind==="file"){
        if(threadJobArr){
          threadJobArr.push({obj:this,func:"get",paramiters:[value.name,value],value})
          continue
        }
        await this.get(value.name,value)
        continue
      }
      console.warn(`unknown kind:"${value.kind}", @"${[...path,value.name].join('/')}" in`,value)
    }
    return this
  }

  async getFolder(name,handle,threadJobArr){
    if(typeof name==='string')return this.folders[name]??(this.folders[name]=this.children[name]=await new Fs.Folder(handle??(await this.handle.getDirectoryHandle(name,{create:1})),[...this.path,name]).refresh({threadJobArr}))
    if(name.length==1)return this.getFolder(name[0])
    return (await this.getFolder(name.shift())).getFolder(name)
  }
  async get(name,handle){
    if(typeof name==='string')return this.files[name]??(this.files[name]=this.children[name]=new Fs.File(handle??(await this.handle.getFileHandle(name,{create:1})),[...this.path,name]))
    if(name.length==1)return this.get(name[0])
    let fname=name.pop()
    return (await this.getFolder(name)).get(fname)
  }
}

class File {
  constructor(handle, path=[]) {
    this.handle=handle
    this.path=path
  }

  async getInfo() {
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

  async read() {
    return await this.handle.getFile()
  }
  async write(content) {
    let write = await this.handle.createWritable()
    try {
      await write.write(content)
    } catch (err) {
      console.error(err)
    }
    await write.close()
  }
}

class Fs extends Folder{
  constructor(handle){
    super(handle)
  }

  async requestPermission(){
    return this.handle.requestPermission({
      mode: "readwrite"
    })
  }

  async setup({progressFunc=(e=>e),threads=10}){
    let perm=this.requestPermission()
    
    let jobArr=[]
    await this.refresh({threadJobArr:jobArr})

    let wait=[]
    for (let i=0;i<threads;i++) {
      wait.push((async id=>{
        while(1){
          let job=jobArr.pop()
          if(!job)break
          await progressFunc(job)
          if(job.value.kind==="directory"){
            await this.getFolder(job.value.name,job.value,jobArr)
            continue
          }
          await job.obj[job.func](...job.paramiters)
        }
      })(i))
    }
    await Promise.all(wait)
    
    await perm
    await (this.etewaott=new Etewaott(await this.getFolder('.etewaott'))).load()
  }
}

class Etewaott{
  constructor(Folder) {
    this.Folder=Folder
    this.files=[]
  }

  async load(){
    for (let [name,file] of Object.entries(this.Folder.files)) {
      this.files[name]=JSON.parse(await (await file.read()).text())
    }
  }

  async save(fileId){
    await (await this.Folder.get(fileId.toString())).write(JSON.stringify(this.files[fileId]))
  }

}

Fs.Folder=Folder
Fs.File=File
Fs.Etewaott=Etewaott

exports=Fs
