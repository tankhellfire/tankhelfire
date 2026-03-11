document.addEventListener("touchmove", function(e) {
  e.preventDefault();
}, {
  passive: false,
});

let key = {
  new: [],
  keys: {},
  set: e => {
    if (!key.keys[e.code]) {
      key.keys[e.code] = {
        timeStamp: {
          key: e.timeStamp
        }
      };
    }

    key.new.push([e.code, e.key]);

    const ek = key.keys[e.code];
    const down = e.type === "keydown";

    Object.assign(ek, {
      key: e.key,
      down,
      up: !down,
      fall: down && (key.keys[e.code].up ?? true),
      raise: !down && !(key.keys[e.code].up ?? false),
    });

    for (let a of ["fall", "raise"]) {
      if (ek[a]) {
        ek.timeStamp[a] = e.timeStamp;
      }
    }
  }
  ,
  endOfFrame: e => {
    key.new = []
    for (let a of Object.values(key.keys)) {
      a.fall = false
      a.raise = false
    }
  }
};
document.addEventListener("keydown", e => {
  // event.preventDefault()
  key.set(e);
}
);
document.addEventListener("keyup", e => {
  // event.preventDefault()
  key.set(e);
}
);

window.onclick = _ => {
  // document.body.requestPointerLock()
  // document.documentElement.requestFullscreen()
}