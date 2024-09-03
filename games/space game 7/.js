Node.prototype.insertElement = function (child_element_tagName, index) {
  return this.insertBefore(
    document.createElement(child_element_tagName),
    this.children[index]
  );
};

Node.prototype.gotoxy = function (x, y) {
  this.style.left = `${(x * vmin) / 2 + window.innerWidth / 2}px`;
  this.style.top = `${(y * vmin) / 2 + window.innerHeight / 2}px`;
  this.style.position = "absolute";
};

function $(a) {
  return document.getElementById(a);
}

const main = $("main");

const clog = console.log;

document.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);

// document.body.addEventListener("click", async()=>{
//   console.log(document.body.requestPointerLock());
// }
// );

// addEventListener(
//   'beforeunload',
//   function(e){
//     console.log('a')
//     e.stopPropagation();e.preventDefault();return false;
//   },
//   true
// );

let vmin = Math.min(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  vmin = Math.min(window.innerWidth, window.innerHeight);
  console.log("vmin=", vmin);
});
let ty = 0;
let upf = 0;
let keyState = {
  KeyR: {},
  Space: {},
  KeyW: {},
};
let mouse = {
  mouse: {
    x: 0,
    y: 0,
    xPx: 0,
    yPx: 0,
    click: {
      now: 0,
      last: 0,
    },
  },
  touch: {},
};

document.addEventListener("keydown", (event) => {
  clog(event);
  if (keyState[event.code]) {
    event.preventDefault();
    if (!keyState[event.code].up) {
      keyState[event.code].up = 0;
      keyState[event.code].down = 1;
      keyState[event.code].first = 1;
      keyState[event.code].fall = 1;
    }
  }
});
document.addEventListener("keyup", (event) => {
  if (keyState[event.code]) {
    event.preventDefault();
    keyState[event.code].up = 1;
    keyState[event.code].down = 0;
    keyState[event.code].first = 1;
    keyState[event.code].raise = 1;
  }
});

document.addEventListener("mousemove", (event) => {
  const currentElements = document.elementsFromPoint(
    event.clientX,
    event.clientY
  );
  // mouse.mouse.xPx += event.movementX;
  // mouse.mouse.yPx += event.movementY;
  mouse.mouse.xPx = event.clientX;
  mouse.mouse.yPx = event.clientY;
  mouse.mouse.target = event.target;
  mouse.mouse.targets = currentElements;

  mouse.mouse.x = ((mouse.mouse.xPx - window.innerWidth / 2) / vmin) * 2;
  mouse.mouse.y = ((mouse.mouse.yPx - window.innerHeight / 2) / vmin) * 2;
});
document.addEventListener("mousedown", (event) => {
  mouse.mouse.click.now = 1;
});
document.addEventListener("mouseup", (event) => {
  mouse.mouse.click.now = 0;
});

function handleTouchMove(event) {
  mouse.touch = {};
  for (const touch of event.touches) {
    const currentElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const currentElements = document.elementsFromPoint(
      touch.clientX,
      touch.clientY
    );
    mouse.touch[touch.identifier] = {
      x: touch.clientX,
      y: touch.clientY,
      startTarget: touch.target,
      target: currentElement,
      targets: currentElements,
      force: touch.force,
    };
  }
}
document.addEventListener("touchmove", handleTouchMove);
document.addEventListener("touchend", handleTouchMove);

//Math.random()
//main.children[1].style.zIndex
//while(performance.now()<ty+1000);
function clamp(x, min, max) {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
}

main.insertElement("display", 1).id = "display";

async function update() {
  //console.log(`${keyState.Space.now}:${keyState.Space.first}`);
  //try{navigator.clipboard.read()}catch(eror){console.log(eror)};
  upf = (performance.now() - ty) / 1000;
  ty = performance.now();

  if (keyState["Space"].down == 1) {
    clog(1);
  }

  $("mouse").gotoxy(mouse.mouse.x, mouse.mouse.y);

  mouse.mouse.click.last = mouse.mouse.click.now;
  for (var a in keyState) {
    keyState[a].first = 0;
    keyState[a].fall = 0;
    keyState[a].raise = 0;
  }
  requestAnimationFrame(update);
}
update();
