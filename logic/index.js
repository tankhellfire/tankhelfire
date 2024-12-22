// const img = new Image();
// img.src = "assets/mouse.svg";

Object.assign(utill, {
  pointerLock: 1,
  fullscreen: 1,
  keyPreventDefault: 1,
});

main.insertElement(document.createElement("img"), 0).id = "ico";
ico.src = "assets/mouse.svg";
ico.title = "ico";

main.insertElement(document.createElement("img"), 0).id = "b";
b.src = "assets/mouse.svg";
b.title = "ico";

main.insertElement(document.createElement("div"), 0).id = "line";
line.classList.add('line')

function drawLine(x1, y1, x2, y2) {
  const line = document.getElementById('line');
  
  const dx = x2 - x1;
  const dy = y1 - y2;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx)
  
  // Style the line
  line.style.width = `${50*length}vmax`;
  line.style.transform = `translate(${50*x1}vmax, ${-50*y1}vmax) rotate(${angle}rad)`;
}




async function update() {
  drawLine(0,0,pointer[pointer.primary]?.x,pointer[pointer.primary]?.y)
  b.goto({x:pointer[pointer.primary]?.x,y:pointer[pointer.primary]?.y})
  ico.goto({x:0,y:0})
  
  
  
  
  
  
  
  
  for (var a in key) {
    key[a].first = 0;
    key[a].fall = 0;
    key[a].raise = 0;
  }
  
  for(var a in pointer)(
    Object.assign(pointer[a],{
      new:0,
      raise:0,
      fall:0,
      mx:0,
      my:0,
      mxPx:0,
      myPx:0
    })
  )
  key.new=[]
  requestAnimationFrame(update);
}
update();