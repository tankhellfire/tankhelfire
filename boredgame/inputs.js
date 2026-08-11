document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  {
    passive: false,
  },
);

document.onclick = (_) => {
  document.body.requestPointerLock();
  document.body.requestFullscreen();
};

let vmin;
function setVmin() {
  vmin = Math.min(window.innerWidth, window.innerHeight);
}
setVmin();
window.addEventListener("resize", setVmin);

//KEYBOARD

function key(gkey) {
  return key.keys[gkey] ?? new Key(gkey);
}
key.keys = {};
class Key {
  constructor(name) {
    this.name = name;
    key.keys[this.name] = this;

    this.up = true;
    this.down = false;

    this.fall = false;
    this.raise = false;

    this.time = {};
    this.time.raise = 0;
    this.time.fall = 0;

    this.time.last = {};
    this.time.last.raise = 0;
    this.time.last.fall = 0;
  }
  update(e) {
    const down = e.type === "keydown";

    if (this.up && down) {
      this.fall = true;
      this.time.last.fall = this.time.fall;
      this.time.fall = e.timeStamp / 1000;
    }
    if (this.down && !down) {
      this.raise = true;
      this.time.last.raise = this.time.raise;
      this.time.raise = e.timeStamp / 1000;
    }
    this.down = down;
    this.up = !down;
  }
  end() {
    this.fall = false;
    this.raise = false;
  }
}
key.end = (_) => Object.values(key.keys).map((e) => e.end());

document.addEventListener("keydown", (e) => {
  // event.preventDefault()
  key(e.code).update(e);
});
document.addEventListener("keyup", (e) => {
  // event.preventDefault()
  key(e.code).update(e);
});

//POINTERS

function pointer(i) {
  return pointer.pointers[i] ?? { live: 0 };
}
pointer.new = [];
pointer.pointers = {};
pointer.end = function () {
  for (const o of pointer.new) o.new = 0;
  pointer.new = [];
};
function pointerHandler(event, sets = {}) {
  if (!pointer(event.pointerId).live) {
    pointer.new.push(
      (pointer.pointers[event.pointerId] = {
        id: event.pointerId,
        time: 0,
        live: 1,
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
      }),
    );
  }
  const currentElement = document.elementFromPoint(event.x, event.y);
  const currentElements = document.elementsFromPoint(event.x, event.y);
  // clog(event)
  const o = pointer(event.pointerId);
  Object.assign(o, {
    time: event.timeStamp,
    pointerType: event.pointerType,

    mx: 2 * (event.movementX / window.innerWidth) + (o.mx ?? 0),
    my: -2 * (event.movementY / window.innerHeight) + (o.my ?? 0),

    mxPx: event.movementX,
    myPx: -event.movementY,
    xPx: event.x,
    yPx: -event.y,

    startTarget: event.target,
    target: currentElement,
    targets: currentElements,
  });
  if (event.pointerType === "mouse" && document.pointerLockElement) {
    o.x += 2 * (event.movementX / window.innerWidth);
    o.y += -2 * (event.movementY / window.innerHeight);
  } else {
    o.x = ((event.x - window.innerWidth / 2) / window.innerWidth) * 2;
    o.y = -((event.y - window.innerHeight / 2) / window.innerHeight) * 2;
  }

  Object.assign(o, sets);
}

document.addEventListener("pointerdown", (event) => {
  pointerHandler(event, {
    downTime: event.timeStamp,
    down: 1,
    fall: 1,

    up: 0,
  });
});
document.addEventListener("pointerup", (event) => {
  pointerHandler(event, {
    upTime: event.timeStamp,
    up: 1,
    raise: 1,

    down: 0,
  });
});
document.addEventListener("pointermove", (event) => {
  pointerHandler(event);
});

document.addEventListener("pointerleave", (event) => {
  pointerHandler(event, { live: 0 });
  delete pointer.pointers[event.pointerId];
});
