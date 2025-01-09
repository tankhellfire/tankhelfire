let {game}=0;
(async()=>{
const spaceGame7=await lib('spaceGame7/index.js')

Object.assign(utill,{
  pointerLock: 1,
  fullscreen: 1,
  keyPreventDefault:1
})

  
main.insertElement(document.createElement("display"), 1).id = "display";
(()=>{
  let eleCounter=0
  display.start=()=>{
    eleCounter=0

  }
  display.draw=(object)=>{
    if(display.children.length-1<eleCounter){
      display.appendChild(document.createElement("img"))
    }
    const ele=display.children[eleCounter]
    
    ele.goto({
      x:object.x*3-1.5,
      y:object.y*3-1.5,
      rot:object.dir,
      center:[-50,-50]
    })
    ele.src=object.img
    
    eleCounter++
  }
  display.end=()=>{
    while(eleCounter<display.children.length){
      display.children[eleCounter].remove()
    }
  }
})()


var a = main.insertElement(document.createElement("div"), 0);
a.id = "text";
a.style.width = "100vw";
a.style.position = "absolute";
a.style.overflowWrap="break-word"

a.goto({
  up: 1,
  right: -1,
});

game = new spaceGame7.game({
  objCount:50
});
  
  
buffer=''
async function update() {
  let dt = performance.now() / 1000 - time;//delta time
  time = performance.now() / 1000;

  for (let i of key.new) {
    buffer+=i[1]
  }

  game.physics(performance.now());
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
  
  display.start()
  
  game.obj.forEach((obj)=>{
    display.draw(obj)
  })
  
  display.end()

  
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