let time;

new db("timer", "12h").then(async (e) => {
  data = e;
  if ((await data.get("time")) == undefined) {
    var now = new Date();
    data.set("time", new Date());
  }

  time = await data.get("time");

  update();
});
//await navigator.storage.estimate()
let last = 0;
async function update() {
  let now = new Date();
  text.innerText = now;

  if (time < now) {
    showNotification("/daily");
    do {
      clog('advacing time by 12h')
      time.setHours(time.getHours() + 12);
    } while (time < now);
    data.set("time", time);
  }
  while (now < new Date(time).setHours(time.getHours() - 12)) {
    clog('rewinding time by 12h')
    time.setHours(time.getHours() - 12)
  }

  let timetill = time - now;
  timer.innerText =
    String(Math.floor(timetill / 3600000) % 60).padStart(2, "0") +
    ":" +
    String(Math.floor(timetill / 60000) % 60).padStart(2, "0") +
    ":" +
    String(Math.floor(timetill / 1000) % 60).padStart(2, "0") +
    ":" +
    String(timetill % 1000).padStart(3, "0");

  alarmTime.innerText = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}:${String(time.getMilliseconds()).padStart(3, '0')}`;

  last = now;
  requestAnimationFrame(update);
}
