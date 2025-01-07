const fileInput = document.getElementById('fileInput');
const audioPlayer = document.getElementById('audioPlayer');
const seekBar = document.getElementById('seekBar');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const thumbnail = document.getElementById('thumbnail');

// Format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Handle file input change
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
      console.error('Error reading file:', error);
      alert('Failed to extract thumbnail.');
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

// Helper function to convert ArrayBuffer to Base64 (if needed)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}
