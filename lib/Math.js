const clamp=Math.clamp = (x, min, max) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
};

const mod=Math.mod =(a, b)=>{
  return ((a % b) + b) % b;
}