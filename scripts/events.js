function reportWindowSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasW = canvas.width;
  canvasH = canvas.height;
}
window.onresize = reportWindowSize;


var mouseDown = [false, false, false];
document.body.onmousedown = function(evt) {
  mouseDown[evt.button] = true;
  console.log(mouseDown);
}
document.body.onmouseup = function(evt) {
  mouseDown[evt.button] = false;
  console.log(mouseDown);
}
var mouseX = 0;
var mouseY = 0;
canvas.addEventListener('mousemove', e => {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
});
