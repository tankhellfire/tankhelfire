class Folder{
  constructor(handle,path=[]){
    this.handle=handle
    this.path=path
    this.cache={}
  }

  async requestPermission(){
    return this.handle.requestPermission({
      mode: "readwrite"
    })
  }

  async refresh(out=[]){

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
    let arr=[this]
    let out=[]
    let activeThreads=0
    
    await new Promise(done=>{//multithreading for -~21%
      async function thread(){
        activeThreads++
        while(1){
          let a=arr.pop()
          if(!a)break
          if(activeThreads<threads)thread()
          out.push(a)
          if(a.constructor!=Fs.Folder&&a.constructor!=Fs)continue
          await a.refresh(arr)
        }
        activeThreads--
        if(activeThreads==0)done()
      }
      
      thread()
    })
      
    return out
  }

  async getFolder(name,handle){
    if(typeof name==='string')return this.cache[name]??(this.cache[name]=new Fs.Folder(handle??(await this.handle.getDirectoryHandle(name,{create:1})),[...this.path,name]))
    if(name.length==1)return this.getFolder(name[0])
    return (await this.getFolder(name.shift())).getFolder(name)
  }
  async get(name,handle){
    if(typeof name==='string')return this.cache[name]??(this.cache[name]=new Fs.File(handle??(await this.handle.getFileHandle(name,{create:1})),[...this.path,name]))
    if(name.length==1)return this.get(name[0])
    let fname=name.pop()
    return (await this.getFolder(name)).get(fname)
  }

  remove(){
    return this.handle.remove({recursive:1})
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

  remove(){
    return this.handle.remove({recursive:1})
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


class Fs extends Folder{
  constructor(handle){
    super(handle)
  }

  async setup(metadateFolder='.etewaott'){
    let perm=this.requestPermission()

    this.metadateFolder=await this.getFolder('.etewaott')

    await this.metadateFolder.refresh()
    
    await perm
    // await (this.etewaott=new Etewaott(await this.getFolder('.etewaott'))).load()
  }
  
}


Fs.Folder=Folder
Fs.File=File
Fs.Etewaott=Etewaott

exports=Fs
