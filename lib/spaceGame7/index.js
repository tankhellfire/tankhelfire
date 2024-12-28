let {clamp,mod}=await lib('Math.js')

const imgs=['https://tankhellfire.glitch.me/space%20game%207/assets/mouse.svg']

class game{
  constructor({ objCount = 0 }) {
    this.obj = Array.from({ length: objCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: 2*Math.random()-1,
      vy: 2*Math.random()-1,
      dir: Math.random(),
      vdir: 2*Math.random()-1,
      img:imgs.rand()
    }));
  }

  obj

  time = 0

  async physics(timePassed) {
    this.time += timePassed;
    for(let obj of this.obj){
      obj.x=mod(obj.x+obj.vx*timePassed*.05)
      obj.y=mod(obj.y+obj.vy*timePassed*.05)
      obj.dir=mod(obj.dir+obj.vdir*timePassed)
    }
  }
}


exports = {game}