((n, f) => {
  if (typeof exports==="object") {
    module.exports = exports = f();
  } else {
    if (typeof define === "function" && define.amd) {
      define([], f);
    } else {
      this[n] = f();
    }
  }
})("spaceGame7", () => {
  class startGame {
    constructor({ objCount = 0 }) {
      this.obj = Array.from({ length: objCount }, () => ({
        x: Math.random(),
        y: Math.random()
      }));
    }

    time = 0;

    physics(timePassed) {
      this.time += timePassed;
    }
  }

  return { startGame };
});
