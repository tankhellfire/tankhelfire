<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Custom Audio Player</title>
  <script src="/lib/npm/jsmediatags/dist/jsmediatags.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: 20px;
    }
    .player-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .thumbnail {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 10px;
      display: none;
    }
    .time-info {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    .slider {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 8px;
      background: #ddd;
      outline: none;
      border-radius: 4px;
      touch-action: none; /* Prevents screen scrolling on touch devices */
    }
    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #007bff;
      border-radius: 50%;
      cursor: pointer;
    }
    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #007bff;
      border-radius: 50%;
      cursor: pointer;
    }
    .play-pause {
      font-size: 18px;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #007bff;
      color: #fff;
      cursor: pointer;
    }
    .play-pause:active {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <h1>Custom Audio Player</h1>
  <div class="player-container">
    <input type="file" id="fileInput" accept="audio/*">
    <img id="thumbnail" class="thumbnail" alt="Thumbnail">
    <button id="playPauseButton" class="play-pause">Play</button>
    <div class="time-info">
      <span id="currentTime">0:00</span>
      <span id="totalTime">0:00</span>
    </div>
    <input type="range" id="seekBar" class="slider" value="0" min="0" max="100">
  </div>

  <audio id="audioPlayer" hidden></audio>

  <script>
    const fileInput = document.getElementById('fileInput');
    const audioPlayer = document.getElementById('audioPlayer');
    const seekBar = document.getElementById('seekBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const thumbnail = document.getElementById('thumbnail');
    const playPauseButton = document.getElementById('playPauseButton');

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Load the audio file into the player
      const fileURL = URL.createObjectURL(file);
      audioPlayer.src = fileURL;
      audioPlayer.load();

      // Extract metadata using jsmediatags
      jsmediatags.read(file, {
        onSuccess: (tag) => {
          const { picture } = tag.tags;
          if (picture) {
            const data = picture.data;
            const format = picture.format;
            const base64String = data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
            const thumbnailURL = `data:${format};base64,${btoa(base64String)}`;
            thumbnail.src = thumbnailURL;
            thumbnail.style.display = 'block';
          }
        },
        onError: (error) => {
          console.log('Error reading metadata:', error);
        }
      });

      // Set up event listeners for the audio player
      audioPlayer.addEventListener('loadedmetadata', () => {
        seekBar.max = Math.floor(audioPlayer.duration);
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
      });

      audioPlayer.addEventListener('timeupdate', () => {
        seekBar.value = Math.floor(audioPlayer.currentTime);
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
      });

      seekBar.addEventListener('input', () => {
        audioPlayer.currentTime = seekBar.value;
      });
    });

    // Play/Pause Button
    playPauseButton.addEventListener('click', () => {
      if (audioPlayer.paused || audioPlayer.ended) {
        audioPlayer.play();
        playPauseButton.textContent = 'Pause';
      } else {
        audioPlayer.pause();
        playPauseButton.textContent = 'Play';
      }
    });

    // Prevent screen scrolling on touch devices while interacting with the slider
    seekBar.addEventListener('touchstart', (e) => e.preventDefault());
    seekBar.addEventListener('touchmove', (e) => e.preventDefault());
  </script>
</body>
</html>

      appearance: none;
      width: 16px;
      height: 16px;
      background: #007bff;
      border-radius: 50%;
      cursor: pointer;
    }
    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #007bff;
      border-radius: 50%;
      cursor: pointer;
    }
    .play-pause {
      font-size: 18px;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #007bff;
      color: #fff;
      cursor: pointer;
    }
    .play-pause:active {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <h1>Custom Audio Player</h1>
  <div class="player-container">
    <input type="file" id="fileInput" accept="audio/*">
    <img id="thumbnail" class="thumbnail" alt="Thumbnail">
    <button id="playPauseButton" class="play-pause">Play</button>
    <div class="time-info">
      <span id="currentTime">0:00</span>
      <span id="totalTime">0:00</span>
    </div>
    <input type="range" id="seekBar" class="slider" value="0" min="0" max="100">
  </div>

  <audio id="audioPlayer" hidden></audio>

  <script>
    const fileInput = document.getElementById('fileInput');
    const audioPlayer = document.getElementById('audioPlayer');
    const seekBar = document.getElementById('seekBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const thumbnail = document.getElementById('thumbnail');
    const playPauseButton = document.getElementById('playPauseButton');

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Load the audio file into the player
      const fileURL = URL.createObjectURL(file);
      audioPlayer.src = fileURL;
      audioPlayer.load();

      // Extract metadata using jsmediatags
      jsmediatags.read(file, {
        onSuccess: (tag) => {
          const { picture } = tag.tags;
          if (picture) {
            const data = picture.data;
            const format = picture.format;
            const base64String = data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
            const thumbnailURL = `data:${format};base64,${btoa(base64String)}`;
            thumbnail.src = thumbnailURL;
            thumbnail.style.display = 'block';
          }
        },
        onError: (error) => {
          console.log('Error reading metadata:', error);
        }
      });

      // Set up event listeners for the audio player
      audioPlayer.addEventListener('loadedmetadata', () => {
        seekBar.max = Math.floor(audioPlayer.duration);
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
      });

      audioPlayer.addEventListener('timeupdate', () => {
        seekBar.value = Math.floor(audioPlayer.currentTime);
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
      });

      seekBar.addEventListener('input', () => {
        audioPlayer.currentTime = seekBar.value;
      });
    });

    // Play/Pause Button
    playPauseButton.addEventListener('click', () => {
      if (audioPlayer.paused || audioPlayer.ended) {
        audioPlayer.play();
        playPauseButton.textContent = 'Pause';
      } else {
        audioPlayer.pause();
        playPauseButton.textContent = 'Play';
      }
    });

    // Prevent screen scrolling on touch devices while interacting with the slider
    seekBar.addEventListener('touchstart', (e) => e.preventDefault());
    seekBar.addEventListener('touchmove', (e) => e.preventDefault());
  </script>
</body>
</html>

    }
    transform+=` translate(-50%, -50%) rotate(${rot}turn) translate(50%, 50%) `;
  }
  
  if (pos.center != undefined) {
    if (typeof pos?.center != "object") {
      console.err("a center was givin", pos?.center, "but wasn't a object (['x','y'])");
    }
    transform+=` translate(${pos?.center[0]}%, ${pos?.center[1]}%) `;
  }

  if (pos?.hidden == 1) {
    this.style.display = "none";
  } else {
    this.style.display = "block";
  }
  this.style.position = "absolute";
  
  if(transform!==''){
    this.style.transform = transform
  }
}
;

const $ = (id) => document.getElementById(id);

const clog = console.log;
const keys = Object.keys;

document.addEventListener("touchmove", function(e) {
  e.preventDefault();
}, {
  passive: false,
});

document.addEventListener("click", (event) => {
  if (utill.pointerLock) {
    document.body.requestPointerLock();
  }
  if (utill.fullscreen) {
    document.documentElement.requestFullscreen();
  }
}
);

// addEventListener(
//   'beforeunload',
//   function(e){
//     console.log('a')
//     e.stopPropagation();e.preventDefault();return false;
//   },
//   true
// );

let vmax;
function setVmax() {
  vmax = Math.max(window.innerWidth, window.innerHeight);
}
setVmax();
window.addEventListener("resize", setVmax);

let time = 0;

let key = {
  new: [],
  set: (e) => {
    if (!key[e.code]) {
      key[e.code] = {
        timeStamp: {
          key: e.timeStamp
        }
      };
    }

    const ek = key[e.code];
    const down = e.type === "keydown";

    key.new.push([e.code, e.key]);

    Object.assign(ek, {
      key: e.key,
      new: 1,
      down,
      up: !down,
      fall: down & (key[e.code].up ?? 1),
      raise: !down & !(key[e.code].up ?? 1),
    });

    for (let a of ["new", "fall", "raise"]) {
      if (ek[a]) {
        ek.timeStamp[a] = e.timeStamp;
      }
    }
  }
  ,
};
document.addEventListener("keydown", (event) => {
  if (utill.keyPreventDefault) {
    event.preventDefault()
  }
  key.set(event);
}
);
document.addEventListener("keyup", (event) => {
  if (utill.keyPreventDefault) {
    event.preventDefault()
  }
  key.set(event);
}
);

let pointer = {};
function pointerHandler(event, sets={}) {
  if (!pointer[event.pointerId]) {
    pointer[event.pointerId] = {
      time: null,
      new: 1,

      pointerType: null,

      up: null,
      down: null,
      upTime: null,
      downTime: null,

      fall: null,
      raise: null,

      x: null,
      y: null,
      mx: 0,
      my: 0,

      xPx: null,
      yPx: null,
      mxPx: 0,
      myPx: 0,

      startTarget: null,
      target: null,
      targets: null,
    };
  }
  if (event.isPrimary) {
    pointer.primary = event.pointerId;
  }
  const currentElement = document.elementFromPoint(event.x, event.y);
  const currentElements = document.elementsFromPoint(event.x, event.y);
  // clog(event)
  Object.assign(pointer[event.pointerId], {
    time: event.timeStamp,
    new: 1,
    pointerType: event.pointerType,

    mx: 2 * (event.movementX / vmax) + (pointer[event.pointerId].mx ?? 0),
    my: -2 * (event.movementY / vmax) + (pointer[event.pointerId].my ?? 0),

    mxPx: event.movementX,
    myPx: -event.movementY,
    xPx: event.x,
    yPx: -event.y,

    startTarget: event.target,
    target: currentElement,
    targets: currentElements,
  });
  if (event.pointerType === "mouse" && document.pointerLockElement) {
    pointer[event.pointerId].x += 2 * (event.movementX / vmax)
    pointer[event.pointerId].y += -2 * (event.movementY / vmax)
  } else {
    pointer[event.pointerId].x = ((event.x - window.innerWidth / 2) / vmax) * 2
    pointer[event.pointerId].y = -((event.y - window.innerHeight / 2) / vmax) * 2
  }

  Object.assign(pointer[event.pointerId], sets);
}

document.addEventListener("pointerdown", (event) => {
  pointerHandler(event, {
    downTime: event.timeStamp,
    down: 1,
    fall: 1,

    up: 0,
  });
}
);
document.addEventListener("pointerup", (event) => {
  pointerHandler(event, {
    upTime: event.timeStamp,
    up: 1,
    raise: 1,

    down: 0,
  });
}
);
document.addEventListener("pointermove", (event) => {
  pointerHandler(event);
}
);

document.addEventListener("pointerleave", (event) => {
  clog("deling", event.pointerId);
  if (pointer.primary == event.pointerId) {
    delete pointer.primary;
  }
  delete pointer[event.pointerId];
}
);