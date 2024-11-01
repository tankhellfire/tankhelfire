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
(new db('timer','12h')).then((e)=>{
  data=e;
  update()
})
//await navigator.storage.estimate()

async function update() {

  text.innerText=Date()
  let a=await data.keys()
  let arr={}
  for(let b of a){
    arr[b]=data.get(b)
  }
  let resolvedObj = {};
  for (let [key, promise] of Object.entries(arr)) {
    resolvedObj[key] = await promise;
  }
  
  m.innerText=JSON.stringify(resolvedObj)
  
  requestAnimationFrame(update);
}