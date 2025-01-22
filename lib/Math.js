Math.clamp= (x, min=0, max=1) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
};

Math.mod=(a, range=1,min=0)=>{
  return (((a-min)%range)+range)%range+min;
}

Array.prototype.rand =function(){
  if (this.length === 0) {
    throw new Error("Cannot pick a random element from an empty array");
  }
  return this[Math.floor(Math.random() * this.length)];
};

exports={clamp:Math.clamp,mod:Math.mod,rand:Array.prototype.rand}