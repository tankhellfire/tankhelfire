class main extends AudioWorkletProcessor {
  constructor() {
    super();
    this.gain = 1.0;

    this.port.onmessage = (event) => {
      if (event.data.gain !== undefined) {
        this.gain = event.data.gain;
      }
    }
    ;
  }

  process(inputs, outputs) {
    console.log("Worklet is processing!");
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      for (let channel = 0; channel < input.length; channel++) {
        for (let i = 0; i < input[channel].length; i++) {
          output[channel][i]=Math.random();
        }
      }
    }

    return true;
  }
}

registerProcessor('main', main);
