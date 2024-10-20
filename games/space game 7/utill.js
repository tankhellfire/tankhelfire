Node.prototype.insertElement = function(element, index) {
  return this.insertBefore(element //document.createElement(child_element_tagName)
  , this.children[index]);
}
;

Node.prototype.gotoxy = function(pos) {
  // clog(`${pos.x * 100}%`)
  if (pos.x!=undefined) {
    if(typeof pos.x!='number'){console.err("a x position was givin",pos.x,"but wasn't a number")}
    this.style.left = `${pos.x * 100}%`;
  }
  if (pos.y!=undefined) {
    if(typeof pos.y!='number'){console.err("a y position was givin",pos.y,"but wasn't a number")}
    this.style.top = `${pos.y * 100}%`;
  }
  if (pos.center!=undefined) {
    if(typeof pos.center!='object'){console.err("a center was givin",pos.center,"but wasn't a object (['x','y'])")}
    this.style.transform = `translate(${pos.center[0]}, ${pos.center[1]})`
  }
  let rot=Number(pos.rot ?? pos.rotation ?? pos.dir)
  if (rot!=undefined) {
    if(typeof rot!='number'){console.err("a rotation was givin",rot,"but wasn't a number")}
    // clog(pos.rot??pos.rotation??pos.dir)
    this.style.transform = `translate(-50%, -50%) rotate(${rot}turn) translate(50%, 50%)`

  }

  this.style.position = "absolute";
}
;

const $ = (id) => document.getElementById(id);

const clog = console.log;
const keys = Object.keys;

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

let vmax
function setVmax() {
  vmax = Math.max(window.innerWidth, window.innerHeight)
}
setVmax()
window.addEventListener('resize', setVmax)

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
}
);
document.addEventListener("keyup", (event) => {
  event.preventDefault();
  key[event.code] = {
    down: 0,
    first: 1,
    fall: 0,
    raise: 1,
    up: 1
  }
}
);

function mouseUpdate() {
  mouse.pc.new = 1
  mouse.pc.time = event.timeStamp
}

document.addEventListener("mousemove", (event) => {
  mouse.pc.mxPx = event.movementX;
  mouse.pc.myPx = event.movementY;
  // console.log(event)
  if (document.pointerLockElement) {
    mouse.pc.xPx += event.movementX;
    mouse.pc.yPx += event.movementY;
  } else {
    mouse.pc.xPx = event.pageX;
    mouse.pc.yPx = event.pageY;
  }

  const currentElements = document.elementsFromPoint(event.clientX, event.clientY);

  mouse.pc.target = event.target;
  mouse.pc.targets = currentElements;

  mouse.pc.x = ((mouse.pc.xPx - window.innerWidth / 2) / vmax) * 2;
  mouse.pc.y = ((mouse.pc.yPx - window.innerHeight / 2) / vmax) * 2;

  mouse.pc.mx = ((mouse.pc.mxPx) / vmax) * 2;
  mouse.pc.my = ((mouse.pc.myPx) / vmax) * 2;
  
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
  mouse.pc.click = {
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
  mouse.touch = [];
  for (const touch of event.touches) {
    const currentElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const currentElements = document.elementsFromPoint(touch.clientX, touch.clientY);
    mouse.touch[touch.identifier] = {
      xPx: touch.pageX,
      yPx: touch.pageY,
      x: ((touch.pageX - window.innerWidth / 2) / vmax) * 2,
      y: ((touch.pageY - window.innerHeight / 2) / vmax) * 2,
      startTarget: touch.target,
      target: currentElement,
      targets: currentElements,
      force: touch.force,
    };
  }
}
document.addEventListener("touchmove", handleTouchMove);
document.addEventListener("touchend", handleTouchMove);

Math.clamp = (x, min, max) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
}
