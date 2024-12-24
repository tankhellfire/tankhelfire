utill.pointerLock=1


let camera = {
  x: .5,
  y: .5,
  z: 0,

  pitch: 0,
  yaw: 0,
  roll: 0,
  rotationSpeed: 1,
  rotationMatrix: [],
  scale: 1/(Math.tan(120/2 * 2*Math.PI/360))
}
main.insertElement(document.createElement("div"), 0).id = 'hud'
hud.goto({
  right: -1,
  up: 1,
})

objs = [{
  element: main.insertElement(document.createElement("div"), 0),
  pos: [0, 0, 1]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [0, 1, 1]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [1, 0, 1]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [1, 1, 1]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [0, 0, 2]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [0, 1, 2]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [1, 0, 2]
}, {
  element: main.insertElement(document.createElement("div"), 0),
  pos: [1, 1, 2]
}, ]

function update() {
  let dt = performance.now() / 1000 - time;
  //delta time
  time = performance.now() / 1000;

  camera.yaw += (pointer[pointer.primary]?.mx ?? 0) * camera.rotationSpeed
  camera.pitch += (pointer[pointer.primary]?.my ?? 0) * camera.rotationSpeed

  camera.roll = ((key.KeyE?.down ?? 0) - (key.KeyQ?.down ?? 0)) * .125 * (2 * Math.PI)

  Movement({
    KeyW: {
      x: Math.sin(camera.yaw),
      z: Math.cos(camera.yaw)
    },
    KeyA: {
      x: -Math.cos(camera.yaw),
      z: Math.sin(camera.yaw)
    },
    KeyS: {
      x: -Math.sin(camera.yaw),
      z: -Math.cos(camera.yaw)
    },
    KeyD: {
      x: Math.cos(camera.yaw),
      z: -Math.sin(camera.yaw)
    },
    Space:{
      y:1
    },
    ShiftLeft:{
      y:-1
    }
  }, .1)

  camera.rotationMatrix = eulerToRotationMatrix(camera.pitch, camera.yaw, camera.roll)

  for (let {element: ele, pos} of objs) {
    let relitivePos = [pos[0] - camera.x, pos[1] - camera.y, pos[2] - camera.z]
    let screenPos = vectBiasRotation(relitivePos, camera.rotationMatrix)

    if (0 < screenPos[2]) {
      ele.goto({
        x: screenPos[0] / screenPos[2] * camera.scale,
        y: screenPos[1] / screenPos[2] * camera.scale,
      });
      ele.innerText = JSON.stringify(pos)
    } else {
      ele.goto({
        hidden: 1
      })
    }
  }
  hud.innerText = JSON.stringify(camera,null,2)

  for (var a in key) {
    key[a].new = 0;
    key[a].fall = 0;
    key[a].raise = 0;
  }

  for (var a in pointer)
    (Object.assign(pointer[a], {
      new: 0,
      raise: 0,
      fall: 0,
      mx: 0,
      my: 0,
      mxPx: 0,
      myPx: 0
    }))
  key.new = []
  requestAnimationFrame(update);
}
update();
// setInterval(update, 200)

function Movement(moveKeys, speed) {
  for (let a in moveKeys) {
    if (key[a]?.down) {
      camera.x += (moveKeys[a].x ?? 0) * speed
      camera.y += (moveKeys[a]?.y ?? 0) * speed
      camera.z += (moveKeys[a]?.z ?? 0) * speed
    }
  }
}

function vectBiasRotation(vect, bias) {
  let out = []
  for (let row in vect) {
    out[row] = 0
    for (let column in vect) {
      out[row] += vect[column] * bias[row][column]
    }
  }
  return out
}

function biasBiasRotation(bias1, bias2) {
  let out = []
  for (let row of bias2) {
    out.push(vectBiasRotation(row, invertBais(bias1)))
  }
  return out
}

function invertBais(bais) {
  let out = [[], [], []]
  for (let row in bais) {
    for (let column in bais) {
      out[column][row] = bais[row][column]
    }
  }
  return out
}

function eulerToRotationMatrix(pitch, yaw, roll) {
  const cx = Math.cos(pitch)
  const sx = Math.sin(pitch)
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cz = Math.cos(roll)
  const sz = Math.sin(roll);

  const pitchMatrix = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]];
  const rollMatrix = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]];
  const yawMatrix = [[cy, 0, -sy], [0, 1, 0], [sy, 0, cy]];

  return biasBiasRotation(biasBiasRotation(yawMatrix, pitchMatrix), rollMatrix)
}
