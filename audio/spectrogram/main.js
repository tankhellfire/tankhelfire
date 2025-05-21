loading=async(t)=>console.log(statusCard.textContent=`${t} ${performance.now()/1000}`)

function computeSpectrogram(pcm,sampleRate,fftSize=1024,hopSize=512) {
  const fft = new FFT(fftSize);
  const bins = fftSize / 2;
  const window = new Float32Array(fftSize).fill(0).map((_, i) => 
    0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)))
  );

  const spectrogram = [];
  const out = new Float32Array(fftSize);
  const complex = new Array(fftSize).fill(0).map(() => [0, 0]);

  for (let i = 0; i < pcm.length - fftSize; i += hopSize) {
    const segment = pcm.slice(i, i + fftSize);
    for (let j = 0; j < fftSize; j++) {
      out[j] = segment[j] * window[j];
    }

    const spectrum = fft.createComplexArray();
    fft.realTransform(spectrum, out);
    fft.completeSpectrum(spectrum);

    const magnitudes = [];
    for (let k = 0; k < bins; k++) {
      const re = spectrum[2 * k];
      const im = spectrum[2 * k + 1];
      magnitudes.push(Math.sqrt(re * re + im * im));
    }
    spectrogram.push(magnitudes);
  }

  return spectrogram;
}
  
;(async()=>{
  await loading('importing')


  await loading('loading')

  statusCard.remove()
  console.log(`%cload time: ${performance.now()/1000}s`,"color:#0f0")


  gl=glcanvas.getContext("webgl");
  glcanvas.width=window.innerWidth;
  glcanvas.height=window.innerHeight;
    
  audioFile.addEventListener("change",async(e)=>{
    let file=e.target.files[0]
    if(!file)return;
  
    let audioCtx=new AudioContext();
    let pcm=await audioCtx.decodeAudioData(await file.arrayBuffer()).getChannelData(0);
  
    drawSpectrogram(pcm,audioCtx.sampleRate);
  });

})()