class AudioPlayer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      latencyHint: 0
    })
    this.gainNode = this.audioContext.createGain();

    this.source;
    // Store the current audio source
    this.audioBuffer;
    // Store the decoded audio buffer
  }
  get volume() {
    return this.gainNode.gain.value
  }
  set volume(volume) {
    this.gainNode.gain.value = volume
  }

  get duration() {
    return this.audioBuffer?.duration
  }

  get currentTime() {
    return this.audioBuffer?.currentTime
  }

  get playbackRate() {
    return this.source.playbackRate.value
  }

  set playbackRate(e) {
    this.source.playbackRate.value = e
  }

  loadAudio(blob) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);

    return new Promise( (res, rej) => {
      reader.onload = _ => {
        this.audioContext.decodeAudioData(reader.result, buffer => {
          this.audioBuffer = buffer;
          this.start();
          res()
        }
        , err => {
          console.error('Error decoding audio data: ', err);
          rej()
        }
        )
      }

      reader.onerror = _ => {
        console.error('Error reading Blob: ', reader.error);
        rej()
      }
    }
    )

  }
  start(time=0) {
    if (this.source) {
      this.source.stop()
      this.source.disconnect();
      // Disconnect previous source
    }
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.source.start(0, time)
  }
  ;pause() {
    this.audioContext.suspend()
  }
  play() {
    this.audioContext.resume()
  }

}
audioPlayer = new AudioPlayer
mediaSession = navigator.mediaSession.metadata = new MediaMetadata()
playing = 0
 

function formatTime(seconds) {
  let secs = seconds % 60;
  return `${Math.floor(seconds / 60)}:${secs < 10 ? '0' : ''}${secs.toFixed(2)}`;
}

async function scalePNG(data, format, size) {
  let img = new Image()
  img.src = URL.createObjectURL(new Blob([new Uint8Array(data)],{
    type: format
  }))

  await new Promise(res => img.onload = res)

  let canvas = document.createElement('canvas')
  canvas.width = size / 9 * 16
  canvas.height = size

  let scale = Math.min(canvas.width / img.width, canvas.height / img.height)

  canvas.getContext('2d').drawImage(img, (canvas.width - img.width * scale) / 2, (canvas.height - img.height * scale) / 2, img.width * scale, img.height * scale)
  return new Promise(res => canvas.toBlob(blob => res(URL.createObjectURL(blob)), 'image/png'))
}

function loadSongId(id) {
  if (id < 0 || songList.length <= id)
    return 0;
  if (!songList)
    return 0;

  songNum = id
  updateUpList(id)
  return DDir.get(songList[id].local.path).read().then(loadMusic)
}

openFs.onclick = async () => {
  let a = new Fs(await window.showDirectoryPicker({
    id: `D`
  }))
  let t = await a.setup()
  songList = a.metadata.filter(e => e?.public?.tankhellfire?.music)
  songNum = -1
  DDir = a
  FsOpt.hidden = 0
  FsName.innerText = DDir.handle.name
  FsTime.innerText = t
  updateUpList(0)
}

function updateUpList(id) {
  upList.innerText = ''

  for (let a = 0; a < songList.length; a++) {
    let n = songList[a].local.path

    if (upList.children.length)
      upList.appendChild(document.createElement('br'))
    let ele = document.createElement('span')

    ele.innerText = n[n.length - 1]

    let str = n.join('/')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash = hash & hash
    }

    ele.style.color = `hwb(${Math.abs(hash % 360)} ${(songNum == a) ? 100 : 0} 0)`

    ele.onclick = e => loadSongId(a)

    upList.appendChild(ele)
  }
}

function loadMusic(file) {
  if (!file)
    return;
  h2Title.textContent = title.textContent = mediaSession.title = file.name

  setVolume()

  playing=1
  audioPlayer.loadAudio(file).then(_ => {
    totalTime.textContent = formatTime(seekBar.max = audioPlayer.duration)
    audioPlayer.playbackRate = Number(speed.value)
  }
  )

  jsmediatags.read(file, {
    onSuccess: async (tag) => {
      let {picture} = tag.tags;
      if (picture) {
        thumbnail.style.display = 'block';

        mediaSession.artwork = [{
          src: icon.href = thumbnail.src = await scalePNG(picture.data, picture.format, screen.height)
        }];
      }
    }
    ,
    onError: e => console.error('Error reading metadata:', e, icon.href = thumbnail.src = '')
  })

  seekBar.addEventListener('input', e => audioPlayer.currentTime = seekBar.value)
}

function pausePlay() {
  if (playing) {
    playing = 0
    audioPlayer.pause()
    playPauseButton.textContent = 'Play'
  } else {
    playing = 1
    audioPlayer.play()
    playPauseButton.textContent = 'Pause'
  }
}

volume.addEventListener('input', setVolume = e => volDisplay.textContent = ((100 * (audioPlayer.volume = volume.value)).toFixed(0).padStart('2', 0) + '%').substring(0, 3))

shuffleButton.onclick = e => {
  let a = songList[songNum]
  songNum = KnuthShuffle(songList).indexOf(a)
  updateUpList()
}

sortByTimeButton.onclick = e => {
  updateSongPlayTime()
  let a = songList[songNum]
  songNum = KnuthShuffle(songList).sort( (a, b) => (a?.public?.created ?? 0) - (b?.public?.created ?? 0)).indexOf(a)
  updateUpList()
}

playPauseButton.addEventListener('click', pausePlay)
thumbnail.addEventListener('click', pausePlay)

speed.addEventListener('change', e => audioPlayer.playbackRate = Number(speed.value))
