Node.prototype.insertElement = function (element, index) {
  return this.insertBefore(
    element, //document.createElement(child_element_tagName)
    this.children[index]
  );
};

Node.prototype.goto = function (pos) {
  if (pos == undefined) {
    return "?";
  }
  // clog(`${pos.x * 100}%`)
  if (pos.x != undefined) {
    if (typeof pos.x != "number") {
      console.err("a x position was givin", pos.x, "but wasn't a number");
    }
    this.style.left = `${pos.x * 100}%`;
  }
  if (pos.y != undefined) {
    if (typeof pos.y != "number") {
      console.err("a y position was givin", pos.y, "but wasn't a number");
    }
    this.style.top = `${pos.y * 100}%`;
  }
  if (pos.left != undefined) {
    if (typeof pos.left != "number") {
      console.err("a left position was givin", pos.left, "but wasn't a number");
    }
    this.style.left = `${pos.left * 100}vw`;
  }
  if (pos.top != undefined) {
    if (typeof pos.top != "number") {
      console.err("a top position was givin", pos.top, "but wasn't a number");
    }
    this.style.top = `${pos.top * 100}vh`;
  }
  if (pos.center != undefined) {
    if (typeof pos.center != "object") {
      console.err(
        "a center was givin",
        pos.center,
        "but wasn't a object (['x','y'])"
      );
    }
    this.style.transform = `translate(${pos.center[0]}, ${pos.center[1]})`;
  }
  let rot = Number(pos.rot ?? pos.rotation ?? pos.dir);
  if (rot != undefined) {
    if (typeof rot != "number") {
      console.err("a rotation was givin", rot, "but wasn't a number");
    }
    // clog(pos.rot??pos.rotation??pos.dir)
    this.style.transform = `translate(-50%, -50%) rotate(${rot}turn) translate(50%, 50%)`;
  }

  this.style.position = "absolute";
};

const $ = (id) => document.getElementById(id);

const clog = console.log;
const keys = Object.keys;

document.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  {
    passive: false,
  }
);

document.addEventListener("click", (event) => {
  document.body.requestPointerLock();
  document.documentElement.requestFullscreen();
});

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

function key(keyCode) {
  if (key[keyCode]) {
    return key[keyCode];
  }

  return {
    down: undefined,
    first: undefined,
    fall: undefined,
    raise: undefined,
    up: undefined,
  };
}
key.new=[]

document.addEventListener("keydown", (event) => {
  event.preventDefault();
  key.new.push([event.code,event.key])
  if (!key(event.code).down) {
    key[event.code] = {
      down: 1,
      first: 1,
      fall: 1,
      raise: 0,
      up: 0,
    };
  }
});
document.addEventListener("keyup", (event) => {
  event.preventDefault();
  key[event.code] = {
    down: 0,
    first: 1,
    fall: 0,
    raise: 1,
    up: 1,
  };
});

function mouseUpdate() {
  mouse.pc.new = 1;
  mouse.pc.time = event.timeStamp;
}

let pointer={}
function pointerHandler(event,sets={}) {
  if(!pointer[event.pointerId]){
    pointer[event.pointerId]={
      time:null,
      new:null,

      pointerType:null,
      
      up:null,
      down:null,
      upTime:null,
      downTime:null,

      fall:null,
      raise:null,

      x:null,
      y:null,
      xPx:null,
      yPx:null,

      startTarget:null,
      target:null,
      targets:null,
    }
  }
  if(event.isPrimary){
    pointer.primary=event.pointerId
  }
  const currentElement = document.elementFromPoint(
    event.x,
    event.y
  );
  const currentElements = document.elementsFromPoint(
    event.x,
    event.y
  );
  // clog(event)
  Object.assign(pointer[event.pointerId],{
    time:event.timeStamp,
    new:1,
    pointerType:event.pointerType,
    x:((event.x - window.innerWidth / 2) / vmax) * 2,
    y:((event.y - window.innerHeight / 2) / vmax) * 2,
    xPx:event.x,
    yPx:event.y,
    startTarget:event.target,
    target:currentElement,
    targets:currentElements,
  })
  Object.assign(pointer[event.pointerId],sets)
}

document.addEventListener("pointerdown",(event)=>{
  pointerHandler(event,{
    downTime:event.timeStamp,
    down:1,
    fall:1,
    
    up:0,
  })
})
document.addEventListener("pointerup",(event)=>{
  pointerHandler(event,{
    upTime:event.timeStamp,
    up:1,
    raise:1,
    
    down:0,
  })
})
document.addEventListener("pointermove",(event)=>{
  pointerHandler(event)
})

document.addEventListener("pointerleave",(event)=>{
  clog('deling',event.pointerId)
  delete pointer[event.pointerId]
})


Math.clamp = (x, min, max) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
};
