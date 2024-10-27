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



let req = window.indexedDB.open("savedata", 0);

req.onupgradeneeded=(event) => {
  const db = event.target.result;
  
  db.onerror = (event) => {
    console.error(event)
  };
}

function update() {

  text.innerText=Date()
  m.innerText=JSON.stringify(localStorage)
  
  requestAnimationFrame(update);
}
update();
