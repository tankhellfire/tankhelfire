main.insertElement(document.createElement('display'), 1).id = "display";
var a=main.insertElement(document.createElement('div'), 0)
a.id = "text";
a.style.top ='-50vh'
a.style.position = "absolute";

let pointer={x:0,y:0}
let game=startGame()

function update() {
  let upf = (performance.now() - lastFrameTime) / 1000;
  lastFrameTime = performance.now();

  if(1){//mouse.pc.new
    pointer.x=mouse.pc.x
    pointer.y=mouse.pc.y
  }else{
    let b=0
    pointer.x=0
    pointer.y=0
    for (a of mouse.touch) {
      if(!a){continue}
      pointer.x+=a.x
      pointer.y+=a.y
      b++
    }
    pointer.x/=b
    pointer.y/=b
  }

  game.physics(upf)
  $('text').innerHTML=`${mouse.pc.mx}<br>${mouse.pc.my}<br><br>${pointer.x}<br>${pointer.y}`
  
  $("mouse").gotoxy({x:pointer.x, y:pointer.y});

  mouse.pc.new=0
  
  mouse.pc.mx=0
  mouse.pc.my=0

  mouse.pc.mxPx=0
  mouse.pc.myPx=0
  
  mouse.pc.click.first=0
  for (var a in key) {
    key[a].first = 0;
    key[a].fall = 0;
    key[a].raise = 0;
  }
  requestAnimationFrame(update);
}
update();