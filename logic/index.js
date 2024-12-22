// const img = new Image();
// img.src = "assets/mouse.svg";

Object.assign(utill, {
  pointerLock: 1,
  fullscreen: 1,
  keyPreventDefault: 1,
});

main.insertElement(document.createElement("img"), 0).id = "ico";
ico.src = "assets/mouse.svg";
ico.title = "ico";

main.insertElement(document.createElement("img"), 0).id = "b";
b.src = "assets/mouse.svg";
b.title = "ico";

main.insertElement(document.createElement("div"), 0).id = "line";
line.style.width='50max'
line.classList.add('line')



// (async () => {
// })();
