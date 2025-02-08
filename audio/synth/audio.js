class main extends AudioWorkletProcessor{
  constructor(){
    super();
    this.gain=1.0;
    this.a=1

    this.port.onmessage=e=>{
      if (e.data.gain!==undefined){
        this.gain=e.data.gain;
      }
    }
  }

  process(inputs,outputs,parameters){

    for(let channal in outputs){
      for(let a in channal){
        outputs[channal][a]=Math.random()
      }
    }

    if(this.a){
      this.a=0
      console.log(inputs,outputs);
    }
    return true;
  }
}

registerProcessor('main', main);
