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
  let a=data.keys()
  m.innerText=
  
  requestAnimationFrame(update);
}