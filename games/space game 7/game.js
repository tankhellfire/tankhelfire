key([
  'Space',
  'KeyR'
])
main.insertElement(document.createElement('display'), 1).id = "display";
let rot=0
function update() {
  let upf = (performance.now() - lastFrameTime) / 1000;
  lastFrameTime = performance.now();

  if (key["Space"].raise == 1) {
    clog(1);
  }

  $("mouse").gotoxy(mouse.mouse.x, mouse.mouse.y);
  rot+=upf
  $("mouse").children[0].style.transform=`translate(-50%, -50%) rotate(${rot/5}turn) translate(50%, 50%)`

  mouse.mouse.click.last = mouse.mouse.click.now;
  for (var a in key) {
    key[a].first = 0;
    key[a].fall = 0;
    key[a].raise = 0;
  }
  requestAnimationFrame(update);
}
update();
