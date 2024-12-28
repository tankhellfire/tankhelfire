const clamp= (x, min=0, max=1) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
};

const mod=(a, range=1,min=0)=>{
  return (((a-min)%range)+range)%range+min;
}

exports={clamp,mod}