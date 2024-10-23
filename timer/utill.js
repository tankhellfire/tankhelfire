Node.prototype.insertElement = function (element, index) {
  return this.insertBefore(
    element, //document.createElement(child_element_tagName)
    this.children[index]
  );
};

Node.prototype.goto = function (pos) {
  if (pos == undefined) {
    return "?";
  }
  // clog(`${pos.x * 100}%`)
  if (pos.x != undefined) {
    if (typeof pos.x != "number") {
      console.err("a x position was givin", pos.x, "but wasn't a number");
    }
    this.style.left = `${pos.x * 100}%`;
  }
  if (pos.y != undefined) {
    if (typeof pos.y != "number") {
      console.err("a y position was givin", pos.y, "but wasn't a number");
    }
    this.style.top = `${pos.y * 100}%`;
  }
  if (pos.left != undefined) {
    if (typeof pos.left != "number") {
      console.err("a left position was givin", pos.left, "but wasn't a number");
    }
    this.style.left = `${pos.left * 100}vw`;
  }
  if (pos.top != undefined) {
    if (typeof pos.top != "number") {
      console.err("a top position was givin", pos.top, "but wasn't a number");
    }
    this.style.top = `${pos.top * 100}vh`;
  }
  if (pos.center != undefined) {
    if (typeof pos.center != "object") {
      console.err(
        "a center was givin",
        pos.center,
        "but wasn't a object (['x','y'])"
      );
    }
    this.style.transform = `translate(${pos.center[0]}, ${pos.center[1]})`;
  }
  let rot = Number(pos.rot ?? pos.rotation ?? pos.dir);
  if (rot != undefined) {
    if (typeof rot != "number") {
      console.err("a rotation was givin", rot, "but wasn't a number");
    }
    // clog(pos.rot??pos.rotation??pos.dir)
    this.style.transform = `translate(-50%, -50%) rotate(${rot}turn) translate(50%, 50%)`;
  }

  this.style.position = "absolute";
};

const $ = (id) => document.getElementById(id);

const clog = console.log;
const keys = Object.keys;

Math.clamp = (x, min, max) => {
  if (x < min) {
    return min;
  }
  if (max < x) {
    return max;
  }
  return x;
};
