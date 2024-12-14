const spaceGame7={
  game:class {
    constructor({ objCount = 0 }) {
      this.obj = Array.from({ length: objCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: Math.random(),
        vy: Math.random()
      }));
    }

    obj
    

    time = 0;

    physics(timePassed) {
      this.time += timePassed;
      for(let a of this.obj){
        a.x+=
      }
    }
  }
}