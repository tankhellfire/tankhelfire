main.insertElement(document.createElement("display"), 1).id = "display";
var a = main.insertElement(document.createElement("div"), 0);
a.id = "gui";
a.style.position = "absolute";
document.cookie=`startTime=; expires=Thu, 01 Jan 1900 00:00:00 UTC; path=/;`

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

function update() {

  text.innerHTML=Date()
  m.innerHTML=document.cookie
  
  requestAnimationFrame(update);
}
update();
