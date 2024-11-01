main.insertElement(document.createElement("display"), 1).id = "display";
var a = main.insertElement(document.createElement("div"), 0);
a.id = "text";
a.style.width = "100vw";
a.style.position = "absolute";
a.style.overflowWrap="break-word"

a.goto({
  top: -0.5,
  left: -0.5,
});

let pointer = {
  x: 0,
  y: 0,
};
let game = startGame();

function update() {
  let dt = performance.now() / 1000 - time;//delta time
  time = performance.now() / 1000;

  if (mouse.pc.new) {
    pointer.x = mouse.pc.x;
    pointer.y = mouse.pc.y;
  } else {
    if (mouse.touch.length != 0) {
      let b = 0;
      pointer.x = 0;
      pointer.y = 0;
      for (a of mouse.touch) {
        if (!a) {
          continue;
        }
        pointer.x += a.x;
        pointer.y += a.y;
        b++;
      }
      pointer.x /= b;
      pointer.y /= b;
    }
  }

  game.physics(dt);
  $("text").innerHTML = `${Date()}<br>
  <br>
  ${pointer.x}<br>
  ${pointer.y}<br>
  <br>
  ${JSON.stringify(mouse.pointer)}<br>
  <br>
  ${JSON.stringify(mouse.pc)}`;

  $("mouse").goto({
    x: pointer.x,
    y: pointer.y,
    rot: time / 12,
  });

  mouse.pc.new = 0;

  mouse.pc.mx = 0;
  mouse.pc.my = 0;

  mouse.pc.mxPx = 0;
  mouse.pc.myPx = 0;

  mouse.pc.click.first = 0;
  for (var a in key) {
    key[a].first = 0;
    key[a].fall = 0;
    key[a].raise = 0;
  }
  for(var a in mouse.pointer)(
    Object.assign(mouse.pointer[a],{
      new:0,
      raise:0,
      fall:0
    })
  )
  requestAnimationFrame(update);
}
update();
