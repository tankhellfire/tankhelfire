((n,f) => {if("object"==typeof exports){module.exports=exports=f()}else{if("function"==typeof define&&define.amd){define([], f)}else{this[n] = f()}}})(
'spaceGame7',() => {
  class startGame{
    time=0;
    
    physics(timePassed) {
      this.time+=timePassed

    }
  }
  
  return {startGame}
});