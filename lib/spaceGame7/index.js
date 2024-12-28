let {clamp,mod}=await lib('Math.js')

const imgs=['https://tankhellfire.glitch.me/space%20game%207/assets/mouse.svg']

class game{
  constructor({ objCount = 0 }) {
    this.obj = Array.from({ length: objCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: Math.random(),
      vy: Math.random(),
      img:
    }));
  }

  obj

  time = 0

  async physics(timePassed) {
    this.time += timePassed;
    for(let obj of this.obj){
      obj.x=mod(obj.x+obj.vx*timePassed,2,-1)
      obj.y=mod(obj.y+obj.vy*timePassed,2,-1)
    }
  }
}


exports = {game}