(async()=>{
statusCard.textContent='importing'
lib.dir=new URL("../../lib/",document.location.href).href
statusCard.textContent='loading'
await new Promise(resolve => setTimeout(resolve, 0));
statusCard.remove()
console.log(`%cload time: ${performance.now()/1000}s`,"color:#0f0")
})()