document.addEventListener("touchmove", function(e) {
  e.preventDefault();
}, {
  passive: false,
});


window.onclick = _ => {// document.body.requestPointerLock()
// document.documentElement.requestFullscreen()
}

let vmin;
function setVmin() {
  vmin = Math.min(window.innerWidth, window.innerHeight);
}
setVmin();
window.addEventListener("resize", setVmin);

//KEYBOARD

function key(gkey) {
  return (key.keys[gkey] ?? new Key(gkey))
}
key.keys = {}
class Key {
  constructor(name) {
    this.name = name
    key.keys[this.name] = this

    this.up = true
    this.down = false

    this.fall = false
    this.raise = false

    this.time = {}
    this.time.raise = 0
    this.time.fall = 0

    this.time.last = {}
    this.time.last.raise = 0
    this.time.last.fall = 0
  }
  update(e) {
    const down = e.type === "keydown"

    if (this.up && down) {
      this.fall = true
      this.time.last.fall = this.time.fall
      this.time.fall = e.timeStamp / 1000
    }
    if (this.down && !down) {
      this.raise = true
      this.time.last.raise = this.time.raise
      this.time.raise = e.timeStamp / 1000
    }
    this.down = down
    this.up = !down
  }
  end() {
    this.fall = false
    this.raise = false
  }
}
key.end = _ => Object.values(key.keys).map(e => e.end())

document.addEventListener("keydown", e => {
  // event.preventDefault()
  key(e.code).update(e)
}
);
document.addEventListener("keyup", e => {
  // event.preventDefault()
  key(e.code).update(e)
}
);

//POINTERS

let pointer = {};
function pointerHandler(event, sets={}) {
  if (!pointer[event.pointerId]) {
    pointer[event.pointerId] = {
      time: 0,
      new: 1,

      pointerType: null,

      up: false,
      down: false,
      upTime: false,
      downTime: false,

      fall: false,
      raise: false,

      x: null,
      y: null,
      mx: 0,
      my: 0,

      xPx: null,
      yPx: null,
      mxPx: 0,
      myPx: 0,

      startTarget: null,
      target: null,
      targets: null,
    };
  }
  const currentElement = document.elementFromPoint(event.x, event.y);
  const currentElements = document.elementsFromPoint(event.x, event.y);
  // clog(event)
  Object.assign(pointer[event.pointerId], {
    time: event.timeStamp,
    new: 1,
    pointerType: event.pointerType,

    mx: 2 * (event.movementX / window.innerWidth) + (pointer[event.pointerId].mx ?? 0),
    my: -2 * (event.movementY / window.innerHeight) + (pointer[event.pointerId].my ?? 0),

    mxPx: event.movementX,
    myPx: -event.movementY,
    xPx: event.x,
    yPx: -event.y,

    startTarget: event.target,
    target: currentElement,
    targets: currentElements,
  });
  if (event.pointerType === "mouse" && document.pointerLockElement) {
    pointer[event.pointerId].x += 2 * (event.movementX / window.innerWidth)
    pointer[event.pointerId].y += -2 * (event.movementY / window.innerHeight)
  } else {
    pointer[event.pointerId].x = ((event.x - window.innerWidth / 2) / window.innerWidth) * 2
    pointer[event.pointerId].y = -((event.y - window.innerHeight / 2) / window.innerHeight) * 2
  }

  Object.assign(pointer[event.pointerId], sets);
}

document.addEventListener("pointerdown", (event) => {
  pointerHandler(event, {
    downTime: event.timeStamp,
    down: 1,
    fall: 1,

    up: 0,
  });
}
);
document.addEventListener("pointerup", (event) => {
  pointerHandler(event, {
    upTime: event.timeStamp,
    up: 1,
    raise: 1,

    down: 0,
  });
}
);
document.addEventListener("pointermove", (event) => {
  pointerHandler(event);
}
);

document.addEventListener("pointerleave", (event) => {
  delete pointer[event.pointerId];
}
);

