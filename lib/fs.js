class Folder {
  constructor(handle) {
    this.handle = handle
  }

  async refresh() {
    this.children = {}
    this.files = {}
    this.folders = {}

    let val = this.handle.values()
    while (1) {
      let {value, done} = await val.next()
      if (done) {
        break
      }
      if (value.kind==="directory") {
        await (this.folders[value.name]=this.children[value.name]=new Fs.Folder(value)).refresh()
        continue
      }
      if (value.kind==="file") {
        this.files[value.name]=this.children[value.name]=new Fs.File(value)
        continue
      }
      console.warn(`unknown kind:"${value.kind}", @"${[...path, value.name].join('/')}" in`, value)
    }
    return this
  }

  async getFolder(name,handle){
    if(typeof name==='string')return this.folders[name]??(this.folders[name]=this.children[name]=await new Fs.Folder(handle??(await this.handle.getDirectoryHandle(name,{create:1}))).refresh())
    if(name.length==1)return this.getFolder(name[0])
    return (await this.getFolder(name.shift())).getFolder(name)
  }
  async get(name,handle){
    if(typeof name==='string')return this.files[name]??(this.files[name]=this.children[name]=new Fs.File(handle??(await this.handle.getFileHandle(name,{create:1}))))
    if(name.length==1)return this.get(name[0])
    let fname=name.pop()
    return (await this.getFolder(name)).get(fname)
  }
}

class File {
  constructor(handle, info={}) {
    this.info = info
    this.handle = handle
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
}

Fs.Folder=Folder
Fs.File=File

exports=Fs
