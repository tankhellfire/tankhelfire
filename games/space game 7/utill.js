Node.prototype.insertElement = function(element, index) {
  return this.insertBefore(element //document.createElement(child_element_tagName)
  , this.children[index]);
}
;

Node.prototype.gotoxy = function(x, y) {
  setVmin()
  this.style.left = `${(x * vmin) / 2 + window.innerWidth / 2}px`;
  this.style.top = `${(y * vmin) / 2 + window.innerHeight / 2}px`;
  this.style.position = "absolute";
}
;

function $(a) {
  return document.getElementById(a);
}

const clog = console.log;
const keys=Object.keys

document.addEventListener("touchmove", function(e) {
  e.preventDefault();
}, {
  passive: false
});

document.addEventListener("click", (event) => {
  document.body.requestPointerLock()
  document.documentElement.requestFullscreen()
}
)

// addEventListener(
//   'beforeunload',
//   function(e){
//     console.log('a')
//     e.stopPropagation();e.preventDefault();return false;
//   },
//   true
// );

let vmin
function setVmin() {
  vmin = Math.min(window.innerWidth, window.innerHeight)
}

let lastFrameTime = 0;
function key(keyCode) {
  if (key[keyCode]) {
    return key[keyCode]
  }

  return {
    down: undefined,
    first: undefined,
    fall: undefined,
    raise: undefined,
    up: undefined
  }
}

let mouse = {
  pc: {
    x: 0,
    y: 0,
    xPx: 0,
    yPx: 0,
    click: {
      now: 0,
      last: 0,
    },
  },
  touch: [],
};

document.addEventListener("keydown", (event) => {
  // clog(key["Space"]);
  // if (key[event.code]) {
  event.preventDefault();
  if (!key(event.code).down) {
    key[event.code] = {
      down: 1,
      first: 1,
      fall: 1,
      raise: 0,
      up: 0
    }
  }
  // }
}
);
document.addEventListener("keyup", (event) => {
  // if (key[event.code]) {
  event.preventDefault();
  key[event.code] = {
    down: 0,
    first: 1,
    fall: 0,
    raise: 1,
    up: 1
  }
  // }
}
);

var mouseUpdate=()=>{
  mouse.pc.new=1
  mouse.pc.time=event.timeStamp
}
document.addEventListener("mousemove", (event) => {
  setVmin()
  // console.log(event)
  if (document.pointerLockElement) {
    mouse.pc.xPx += event.movementX;
    mouse.pc.yPx += event.movementY;
  } else {
    mouse.pc.xPx = event.clientX;
    mouse.pc.yPx = event.clientY;
  }

  const currentElements = document.elementsFromPoint(event.clientX, event.clientY);

  mouse.pc.target = event.target;
  mouse.pc.targets = currentElements;

  mouse.pc.x = ((mouse.pc.xPx - window.innerWidth / 2) / vmin) * 2;
  mouse.pc.y = ((mouse.pc.yPx - window.innerHeight / 2) / vmin) * 2;
  mouseUpdate()
}
);

document.addEventListener("mousedown", (event) => {
  event.preventDefault();
  mouse.pc.click = {
    down: 1,
    first: 1,
    fall: 1,
    raise: 0,
    up: 0
  };
  mouseUpdate()
}
);

document.addEventListener("mouseup", (event) => {
  mouse.pc.click={
    down: 0,
    first: 1,
    fall: 0,
    raise: 1,
    up: 1
  }
  mouseUpdate()
}
);

function handleTouchMove(event) {
  setVmin()
  mouse.touch = [];
  for (const touch of event.touches) {
    const currentElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const currentElements = document.elementsFromPoint(touch.clientX, touch.clientY);
    mouse.touch[touch.identifier] = {
      xPx: touch.clientX,
      yPx: touch.clientY,
      x: ((touch.clientX - window.innerWidth / 2) / vmin) * 2,
      y: ((touch.clientY - window.innerHeight / 2) / vmin) * 2,
      startTarget: touch.target,
      target: currentElement,
      targets: currentElements,
      force: touch.force,
    };
  }
}
document.addEventListener("touchmove", handleTouchMove);
document.addEventListener("touchend", handleTouchMove);

Math.clamp = function(x, min, max) {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
}
