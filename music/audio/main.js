add.onclick = a => {
  window.showDirectoryPicker({
    id: 'audio'
  }).then(a=>addFile(a,4))
}

let m = []

async function addFile(handle, threadCount=3) {
  async function get(threadId) {
    let jobId = 0
    timer.start(`thread ${threadId}`)
    while (1) {
      let res = await val.next()
      if (res.done) {
        break
      }

      timer.start(`thread ${threadId} job ${jobId}`)

      out.push(res.value)

      timer.end(`thread ${threadId} job ${jobId}`)

      jobId++
    }
    timer.end(`thread ${threadId}`)
  }

  let timer = new Timer()
  timer.start('total')

  let val = handle.values()
  let threads = []
  let out = []
  for (let threadId = 0; threadId < threadCount; threadId++) {
    threads.push(get(threadId))
  }
  await Promise.all(threads)

  timer.end('total')
  console.log(timer, out)
  timer.drawGraph(timeline)
  m.push({
    timer,
    out
  })

}

class Timer {
  constructor() {
    this.events = [];
    // Store all the events with start and end times
  }

  start(name) {
    const start = performance.now();
    // High-resolution time
    this.events.push({
      name,
      start,
      end: null
    });
    console.log(`"${name}" at ${start} ms`);
  }

  end(name) {
    const end = performance.now();
    const event = this.events.find(e => e.name === name && e.end === null);
    if (event) {
      event.end = end;
      console.log(`"${name}" at ${end} ms`);
    } else {
      console.error(`No active event found with name "${name}"`);
    }
  }

  drawGraph(canvas) {
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate timeline bounds
    const allTimes = this.events.flatMap(e => [e.start, e.end]);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    const timelineWidth = canvas.width - 100;
    // Leave some margin
    const timeScale = timelineWidth / (maxTime - minTime);

    // Draw the timeline axis
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 50, canvas.height - 50);
    ctx.stroke();

    // Draw event bars
    const barHeight = 20;
    const barSpacing = 40;
    this.events.forEach( (event, index) => {
      const y = index * barSpacing + 20;
      const startX = 50 + (event.start - minTime) * timeScale;
      const endX = 50 + (event.end - minTime) * timeScale;

      // Draw event bar
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(startX, y, endX - startX, barHeight);

      // Draw event label
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.fillText(event.name, 10, y + barHeight / 2 + 5);

      // Draw start and end markers
      ctx.fillStyle = "#ff5722";
      ctx.beginPath();
      ctx.arc(startX, y + barHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, y + barHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    );

    // Add time labels
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i <= 10; i++) {
      const time = minTime + (i / 10) * (maxTime - minTime);
      const x = 50 + (i / 10) * timelineWidth;
      ctx.fillText(`${time.toFixed(0)} ms`, x, canvas.height - 30);
    }
  }
}
