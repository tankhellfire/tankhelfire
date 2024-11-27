((n,f) => {if("object"==typeof exports){module.exports=exports=f()}else{if("function"==typeof define&&define.amd){define([], f)}else{this[n] = f()}}})(
'spaceGame7',() => {
  class startGame{
    constructor({objCount=0}){
      obj=new array(objCount)
    };
    
    time=0;
    
    physics(timePassed) {
      this.time+=timePassed

    }
  }
  
  return {startGame}
});