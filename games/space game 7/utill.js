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

document.addEventListener("touchmove", function(e) {
  e.preventDefault();
}, {
  passive: false
});

document.addEventListener("click", (event) => {
  document.body.requestPointerLock()
  document.documentElement.requestFullscreen()
})

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
  if (typeof (keyCode) == 'object') {
    for (var a of keyCode) {
      key(a)
    }
    return
  }
  if(keyCode==undefined){
    return keys(key)
  }
  key[keyCode] = {
    down: 0,
    first: 0,
    fall: 0,
    raise: 0,
    up: 1
  }
}

// Object.defineProperty(key, 'add', {
//   value: ( (keyCode) => 
//   ),
//   enumerable: false
// })

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
  // clog(key["Space"]);
  if (key[event.code]) {
    event.preventDefault();
    if (!key[event.code].down) {
      key[event.code] = {
        down: 1,
        first: 1,
        fall: 1,
        raise: 0,
        up: 0
      }
    }
  }
}
);
document.addEventListener("keyup", (event) => {
  if (key[event.code]) {
    event.preventDefault();
    key[event.code] = {
      down: 0,
      first: 1,
      fall: 0,
      raise: 1,
      up: 1
    }
  }
}
);

document.addEventListener("mousemove", (event) => {
  setVmin()
  // console.log(event)
  if (document.pointerLockElement) {
    mouse.mouse.xPx += event.movementX;
    mouse.mouse.yPx += event.movementY;
  } else {
    mouse.mouse.xPx = event.clientX;
    mouse.mouse.yPx = event.clientY;
  }

  const currentElements = document.elementsFromPoint(event.clientX, event.clientY);

  mouse.mouse.target = event.target;
  mouse.mouse.targets = currentElements;

  mouse.mouse.x = ((mouse.mouse.xPx - window.innerWidth / 2) / vmin) * 2;
  mouse.mouse.y = ((mouse.mouse.yPx - window.innerHeight / 2) / vmin) * 2;
}
);
document.addEventListener("mousedown", (event) => {
  event.preventDefault();
  mouse.mouse.click.now = 1;
}
);
document.addEventListener("mouseup", (event) => {
  mouse.mouse.click.now = 0;
}
);

function handleTouchMove(event) {
  setVmin()
  mouse.touch = {};
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
