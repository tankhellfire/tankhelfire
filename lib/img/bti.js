function bti(blob){
  return new Promise(res=>{
    let img=new Image()
    img.onload=e=>{
      let can=document.createElement('canvas')
      can.width=img.width
      can.height=img.height
      
      let ctx=can.getContext('2d',{willReadFrequently:true})
      ctx.drawImage(img,0,0)
      res(ctx)
    }
    img.src=URL.createObjectURL(blob)
  })
}

bti.to=(img,out='image/png')=>{
  return new Promise(res=>{
    let can=document.createElement('canvas')
    can.width=img.width
    can.height=img.height

    can.getContext('2d').putImageData(img,0,0)

    can.toBlob(res,out)
  })
}

function downloadBlob(blob,filename){
  let url=URL.createObjectURL(blob)
  let a=document.createElement('a')
  a.href=url
  a.download=filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadurl(url,name){
  let a=document.createElement('a')
  a.href=url
  a.download=URL.createObjectURL(await(await fetch(url)).blob())
  a.click()
  URL.revokeObjectURL(url)
}

exports=bti
// let dir=new Fs.Folder(await showDirectoryPicker())
// let files=await dir.refresh()
// let imgs=await Promise.all(files.sort((a,b)=>(a.path.join('/')<b.path.join('/'))*2-1).map(e=>e.read().then(bti)))

// let can=document.createElement('canvas')
// can.width=33660
// can.height=4080
// let ctx=can.getContext('2d')
// let offset=0
// imgs.forEach(e=>{ctx.putImageData(e,offset,0);offset+=e.width})
