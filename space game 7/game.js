(async()=>{
const spaceGame7=await lib.load('spaceGame7/main.js')

Object.assign(utill,{
  pointerLock: 1,
  fullscreen: 1,
  keyPreventDefault:1
})



main.insertElement(document.createElement("display"), 1).id = "display";
var a = main.insertElement(document.createElement("div"), 0);
a.id = "text";
a.style.width = "100vw";
a.style.position = "absolute";
a.style.overflowWrap="break-word"

a.goto({
  up: 1,
  left: -1,
});

let game = new spaceGame7.game({
  objCount:5
});
buffer=''
function update() {
  let dt = performance.now() / 1000 - time;//delta time
  time = performance.now() / 1000;

  for (let i of key.new) {
    buffer+=i[1]
  }

  game.physics(dt);
  $("text").innerHTML = `${Date()}<br>
  <br>
  ${pointer[pointer.primary]?.x}<br>
  ${pointer[pointer.primary]?.y}<br>
  <br>
  ${JSON.stringify(pointer)}<br>
  <br>
  ${buffer}`;

  $("mouse").goto({
    x: pointer[pointer.primary]?.x,
    y: pointer[pointer.primary]?.y,
    rot: time / 12,
  });

  
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
})()