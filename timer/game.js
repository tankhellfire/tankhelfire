main.insertElement(document.createElement("display"), 1).id = "display";
var a = main.insertElement(document.createElement("div"), 0);
a.id = "gui";
a.style.position = "absolute";

a.goto({
  top: -0.5,
  left: -0.5,
});

a=gui.appendChild(document.createElement("div"));
a.id = "text";
a.style.width = "100vw";

a=gui.appendChild(document.createElement("div"));
a.id = "m";
a.style.width = "100vw";

let data
let dataobj=clog

(new db('timer','12h')).then(
  async (e)=>{
  data=e;
  if(await data.get('time')==undefined){
    var now=new Date()
    data.set('time',[now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds()])
  }
  
  let a=await data.keys()
  let arr={}
  for(let b of a){
    arr[b]=data.get(b)
  }
  for (let [key, promise] of Object.entries(arr)) {
    dataobj[key] = await promise;
  }
  
  update()
})
//await navigator.storage.estimate()

async function update() {

  let now=new Date()
  text.innerText=now
  
  

  
  m.innerText=JSON.stringify(dataobj)
  
  
  let time=await data.get('time')
  now.setHours(time[0],time[1],time[2],time[3])
  
  requestAnimationFrame(update);
}