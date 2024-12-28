const clamp= (x, min, max) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
};

const mod=(a, b=1)=>{
  return ((a % b) + b) % b;
}

exports={clamp,mod}