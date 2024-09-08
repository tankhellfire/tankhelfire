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
    for (a in mouse.touch) {
      if(!a){continue}
      pointer.x=a.x
      pointer.y=a.y
      break
    }
  }
  
  $("mouse").gotoxy(pointer.x, pointer.y);

  rot += upf
  $("mouse").children[0].style.transform = `translate(-50%, -50%) rotate(${rot / 5}turn) translate(50%, 50%)`

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
