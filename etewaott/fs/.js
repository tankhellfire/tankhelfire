class syncFs {
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
      this.dir = await window.showDirectoryPicker()
      this.text.innerText = this.dir.name
      // alert("start")
      this.overVeiw=await pullDir(this.dir,4)
      this.directoryOverVeiw={}
      let i=0
      for(let b of fs[1].overVeiw){
        let c=this.directoryOverVeiw

        for (i = 0; i < b.path.length-1; i++) {
          c=c[b.path[i]]??(c[b.path[i]]={})
        }
        c[b.path[i]]=b
      }
      // alert("end")
    }
  }

  dir;

}

fs = [new syncFs(0), new syncFs(1)]
async function pullDir(handle, threads=1) {
  let files = []

  async function getAllPaths(handle, path=[]) {
    let val = handle.values()
    while (1) {
      let {value, done} = await val.next()
      if (done) {
        break
      }
      if (value.kind === "directory") {
        await getAllPaths(value, [...path, value.name]);
        continue
      }
      if (value.kind === "file") {
        files.push({
          path: [...path, value.name],
          handle: value
        })
        continue
      }
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



function passJson(inp,depth=0) {
  if (typeof inp==='undefined') {return}
  if (typeof inp==='function') {return 'func'}
  if (typeof inp==='object') {
    if(depth<0){
      if(inp==null){return}
      if(Object.keys(inp).length==0){return 'OOR'}
      return inp
    }
    let ret={}
    for (let a in inp){
      ret[a]=passJson(inp[a],depth-1)
    }
    if(Object.keys(ret).length==0){return {}}
    return ret
  }
  return inp
}







