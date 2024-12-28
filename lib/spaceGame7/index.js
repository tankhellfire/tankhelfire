await 

class game{
  constructor({ objCount = 0 }) {
    this.obj = Array.from({ length: objCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: Math.random(),
      vy: Math.random()
    }));
  }

  obj

  time = 0

  async physics(timePassed) {
    this.time += timePassed;
    for(let obj of this.obj){
      obj.x=(obj.x+obj.vx*timePassed)%1
      obj.y=(obj.y+obj.vy*timePassed)%1
    }
  }
}


exports = {game}