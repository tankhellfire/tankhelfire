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
      this.dir = await window.showDirectoryPicker({id:`/etewaott/fs/index.html ${id}`})
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
        if(value.kind==="file"){files.push({path:[...path, value.name],handle:value});continue}
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
        let {handle} = job

        const fileGet = await handle.getFile()

        const arrayBuffer = await fileGet.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        job.info = {
          kind: handle.kind,

          lastModified: fileGet.lastModified,
          name: fileGet.name,
          size: fileGet.size,
          type: fileGet.type,

          hash: {
            sha256: hashHex
          }
        }
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
    return {val:c,file:this.overVeiw[c]}
  }
  makeFromPath(pathArr){
    let handle=this.dir
    let directory=this.overVeiw
    
    let i=0
    for (i=0;i<pathArr.length-1;i++) {
      handle=handle.getDirectoryHandle(pathArr[i],{make:1})
      directory=directory[pathArr[i]]??(directory[pathArr[i]]={})
    }
    directory=directory[pathArr[i]]??(this.overVeiw)
    handle=handle.getFileHandle(pathArr[i],{make:1})
  }
//   setFromPath(pathArr){
//     let handle=this.getFromPath(pathArr)?.val
//     if(handle===undefined){
      
//     }

//   }
  
  push(to){
    for(let fromFile of this.overVeiw){
      let toFile=to.getFromPath(fromFile.path)?.file
      if(fromFile?.info?.size===toFile?.info?.size&&fromFile?.info?.hash?.sha256===toFile?.info?.hash?.sha256){
          console.log('same')
          continue
      }
      console.log('diff',fromFile,toFile)
    }
  }
}
class File{
  constructor(id) {
    
  }
}

let fs = [new Fs(0), new Fs(1)]







