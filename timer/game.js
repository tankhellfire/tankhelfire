let data;
let dataobj = {};
let time

new db("timer", "12h").then(async (e) => {
  data = e;
  if ((await data.get("time")) == undefined) {
    var now = new Date();
    data.set("time", [
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    ]);
  }

  time=data.get('time')
  
  let a = await data.keys();
  let arr = {};
  for (let b of a) {
    arr[b] = data.get(b);
  }
  for (let [key, promise] of Object.entries(arr)) {
    dataobj[key] = await promise;
  }
  
  time=await time

  update();
});
//await navigator.storage.estimate()
let last=0
async function update() {
  let now = new Date();
  text.innerText = now;

  m.innerText = JSON.stringify(dataobj);

  
  let a=(new Date(now)).setHours(time[0], time[1], time[2], time[3]);
  let timetill=a-now
  timer.innerText=
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(Math.floor(timetill / 1000)).padStart(2, '0') + ':' +
    String(timetill%1000).padStart(3, '0');
  
  alarmTime.innerText=last

  last=now
  requestAnimationFrame(update);
}
