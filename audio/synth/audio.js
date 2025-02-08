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

  process(inputList, outputList, parameters) {
    const input = outputList[0];
    const output = outputList[0];
    const gain = parameters.gain;

    for (let channelNum = 0; channelNum < input.length; channelNum++) {
      const inputChannel = input[channelNum];
      const outputChannel = output[channelNum];

      // If gain.length is 1, it's a k-rate parameter, so apply
      // the first entry to every frame. Otherwise, apply each
      // entry to the corresponding frame.

      for (let i = 0; i < inputChannel.length; i++) {
        outputChannel[i] = Math.random()*.02;
      }
    }

    return true;
  }

}

registerProcessor('main', main);
