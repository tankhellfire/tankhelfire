let {clamp,mod}=await lib('Math.js')

const imgs=['https://tankhellfire.glitch.me/space%20game%207/assets/mouse.svg']

class game{
  constructor({objCount=0}) {
    this.time=0
    this.obj = Array.from({ length: objCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (2*Math.random()-1)*.1,
      vy: (2*Math.random()-1)*.1,
      dir: Math.random(),
      vdir: 2*Math.random()-1,
      img:imgs.rand(),
      size:.09*Math.random()+.01
    }));
  }

  async physics(time) {
    const dt=time-this.time
    this.time = time;
    for(let obj of this.obj){
      obj.x=mod(obj.x+obj.vx*dt)
      obj.y=mod(obj.y+obj.vy*dt)
      obj.dir=mod(obj.dir+obj.vdir*dt)
    }
  }
}


exports={game}