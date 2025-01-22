let audioContext = new (window.AudioContext || window.webkitAudioContext)();

let scriptNode = audioContext.audioWorklet.addModule('audio.js')