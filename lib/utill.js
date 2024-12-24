const utill = {
  pointerLock: 0,
  fullscreen: 0,
  keyPreventDefault: 0
};

Node.prototype.insertElement = function(element, index) {
  return this.insertBefore(element, //document.createElement(child_element_tagName)
  this.children[index]);
}
;

Node.prototype.goto = function(pos) {
  if (pos.x != undefined) {
    if (typeof pos?.x != "number") {
      console.err("a x position was givin", pos?.x, "but wasn't a number");
    }
    this.style.left = `${pos?.x * 50}vmax`;
  }
  if (pos.y != undefined) {
    if (typeof pos?.y != "number") {
      console.err("a y position was givin", pos?.y, "but wasn't a number");
    }
    this.style.top = `${(0 - pos?.y) * 50}vmax`;
  }
  if (pos.right != undefined) {
    if (typeof pos?.right != "number") {
      console.err("a left position was givin", pos?.right, "but wasn't a number");
    }
    this.style.left = `${pos?.right * 50}vw`;
  }
  if (pos.up != undefined) {
    if (typeof pos?.up != "number") {
      console.err("a top position was givin", pos?.up, "but wasn't a number");
    }
    this.style.top = `${(0 - pos?.up) * 50}vh`;
  }
  if (pos.center != undefined) {
    if (typeof pos?.center != "object") {
      console.err("a center was givin", pos?.center, "but wasn't a object (['x','y'])");
    }
    this.style.transform = `translate(${pos?.center[0]}%, ${pos?.center[1]}%)`;
  }
  let rot = Number(pos?.rot ?? pos?.rotation ?? pos?.dir);
  if (rot != undefined) {
    if (typeof rot != "number") {
      console.err("a rotation was givin", rot, "but wasn't a number");
    }
    this.style.transform = `translate(-50%, -50%) rotate(${rot}turn) translate(50%, 50%)`;
  }

  if (pos?.hidden == 1) {
    this.style.display = "none";
  } else {
    this.style.display = "block";
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
  passive: false,
});

document.addEventListener("click", (event) => {
  if (utill.pointerLock) {
    document.body.requestPointerLock();
  }
  if (utill.fullscreen) {
    document.documentElement.requestFullscreen();
  }
}
);

// addEventListener(
//   'beforeunload',
//   function(e){
//     console.log('a')
//     e.stopPropagation();e.preventDefault();return false;
//   },
//   true
// );

let vmax;
function setVmax() {
  vmax = Math.max(window.innerWidth, window.innerHeight);
}
setVmax();
window.addEventListener("resize", setVmax);

let time = 0;

let key = {
  new: [],
  set: (e) => {
    if (!key[e.code]) {
      key[e.code] = {
        timeStamp: {
          key: e.timeStamp
        }
      };
    }

    const ek = key[e.code];
    const down = e.type === "keydown";

    key.new.push([e.code, e.key]);

    Object.assign(ek, {
      key: e.key,
      new: 1,
      down,
      up: !down,
      fall: down & (key[e.code].up ?? 1),
      raise: !down & !(key[e.code].up ?? 1),
    });

    for (let a of ["new", "fall", "raise"]) {
      if (ek[a]) {
        ek.timeStamp[a] = e.timeStamp;
      }
    }
  }
  ,
};
document.addEventListener("keydown", (event) => {
  if (utill.keyPreventDefault) {
    event.preventDefault()
  }
  key.set(event);
}
);
document.addEventListener("keyup", (event) => {
  if (utill.keyPreventDefault) {
    event.preventDefault()
  }
  key.set(event);
}
);

let pointer = {};
function pointerHandler(event, sets={}) {
  if (!pointer[event.pointerId]) {
    pointer[event.pointerId] = {
      time: null,
      new: 1,

      pointerType: null,

      up: null,
      down: null,
      upTime: null,
      downTime: null,

      fall: null,
      raise: null,

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
  if (event.isPrimary) {
    pointer.primary = event.pointerId;
  }
  const currentElement = document.elementFromPoint(event.x, event.y);
  const currentElements = document.elementsFromPoint(event.x, event.y);
  // clog(event)
  Object.assign(pointer[event.pointerId], {
    time: event.timeStamp,
    new: 1,
    pointerType: event.pointerType,

    mx: 2 * (event.movementX / vmax) + (pointer[event.pointerId].mx ?? 0),
    my: -2 * (event.movementY / vmax) + (pointer[event.pointerId].my ?? 0),

    mxPx: event.movementX,
    myPx: -event.movementY,
    xPx: event.x,
    yPx: -event.y,

    startTarget: event.target,
    target: currentElement,
    targets: currentElements,
  });
  if (event.pointerType === "mouse" && document.pointerLockElement) {
    pointer[event.pointerId].x += 2 * (event.movementX / vmax)
    pointer[event.pointerId].y += -2 * (event.movementY / vmax)
  } else {
    pointer[event.pointerId].x = ((event.x - window.innerWidth / 2) / vmax) * 2
    pointer[event.pointerId].y = -((event.y - window.innerHeight / 2) / vmax) * 2
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
  clog("deling", event.pointerId);
  if (pointer.primary == event.pointerId) {
    delete pointer.primary;
  }
  delete pointer[event.pointerId];
}
);

Math.clamp = (x, min, max) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
}
;