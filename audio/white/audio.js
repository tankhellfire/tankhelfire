class main extends AudioWorkletProcessor{
  constructor(){
    super();

    this.port.onmessage=e=>{
      if (e.data.gain!==undefined){
        this.gain=e.data.gain;
      }
    }
  }

process(inputList, outputList, parameters) {
  for (let channelNum = 0; channelNum < outputList[0].length; channelNum++) {
    const outputChannel = outputList[0][channelNum];

    for (let i = 0; i < outputChannel.length; i++) {
      outputChannel[i] = Math.random() * 0.1; // Random noise for each channel
    }
  }
  return true;
}

}

registerProcessor('main', main);
