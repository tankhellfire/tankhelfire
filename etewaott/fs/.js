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
      alert("start")
      
      info.textContent=await pullDir(this.dir.handle,4)
      alert("end")
    }
  }

  dir = null

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

  for (let thread = 0; thread < threads; thread++) {
    wait.push(threadPassFile(thread))
  }
  await Promise.all(wait)
  return files
}

// async function pullDir(handle) {

//   let out = []
//   async function get(handle,relative='/') {
//     let b = handle.values()
//     let c = []
//     do {
//       for (let i = 0; i < 10; i++) {
//         c.push(b.next())
//       }
//       c = await Promise.all(c)
//     } while (!c[c.length - 1].done)

//     for(let a of c){
//       if(a.done){continue}
//       if(a.value.kind==="directory"){
//         await get(a.value,relative+a.value.name+'/')
//         continue
//       }
//       const fileGet=await a.value.getFile()

//       // Step 2: Read the file as an ArrayBuffer
//       const arrayBuffer = await fileGet.arrayBuffer();

//       // Step 3: Compute the SHA-256 hash
//       const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

//       // Step 4: Convert the hash buffer to a hex string
//       const hashArray = Array.from(new Uint8Array(hashBuffer));
//       const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

//       out.push({
//         dir:relative+a.value.name,
//         handle:a.value,
//         kind:a.value.kind,

//         lastModified:fileGet.lastModified,
//         name:fileGet.name,
//         size:fileGet.size,
//         type:fileGet.type,

//         hash:{
//           sha256:hashHex
//         }
//       })
//     }
//   }
//   await get(handle)

//   let ret=[]
//   for(let a of out){
//     let val=await a

//     let i
//     for (i = 0; i < ret.length; i++) {
//       if(val.dir<ret[i].dir){
//         break
//       }
//     }
//     ret=ret.toSpliced(i,0,val)
//   }

//   return ret
// }