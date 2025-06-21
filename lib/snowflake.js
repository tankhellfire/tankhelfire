function snowflake(id){
  let a=BigInt(id)
  return{
    time:(a>>22n)+1420070400000n,
    worker:a>>17n &(1n<<5n)-1n,
    process:a>>12n &(1n<<5n)-1n,
    id:a &(1n<<12n)-1n
  }
}

exports=snowflake