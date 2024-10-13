main.insertElement(document.createElement('display'), 1).id = "display";

let rot = 0
let pointer={x:0,y:0}

function update() {
  let upf = (performance.now() - lastFrameTime) / 1000;
  lastFrameTime = performance.now();

  for(a in key){
    if (key(a).raise == 1) {
      clog(a);
    }
  }

  if(mouse.pc.new==1){
    pointer.x=mouse.pc.x
    pointer.y=mouse.pc.y
  }else{
    let b=0
    pointer.x=0
    pointer.y=0
    for (a of mouse.touch) {
      if(!a){continue}
      // clog(a)
      pointer.x+=a.x
      pointer.y+=a.y
      b++
    }
    pointer.x/=b
    pointer.y/=b
  }
  $("text").innerHTML=pointer.x
  
  rot += upf
  if(!key('Space').down){
  $("mouse").gotoxy({x:pointer.x, y:pointer.y,rot:rot/5});
  }

  mouse.pc.new=0
  
  mouse.pc.click.first=0
  for (var a in key) {
    key[a].first = 0;
    key[a].fall = 0;
    key[a].raise = 0;
  }
  requestAnimationFrame(update);
}
update();