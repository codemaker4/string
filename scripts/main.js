var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvasW = canvas.width;
canvasH = canvas.height;
var ctx = canvas.getContext('2d');

var elastic = new Elastic(0, 0.01, 100, 10);
function resetElastic() {
  elastic.setLinePath(canvas.width*0.05,canvas.height/2,canvas.width*0.95,canvas.height/2);
}

resetElastic()
elastic.offsetSinePath(Math.PI*2, 100);

function mouseDraw(ctx) {
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 100, 0, Math.PI*2);
  ctx.lineWidth = 1;
  ctx.stroke();
  if (mouseDown[0]) {
    ctx.fillStyle = "#888";
    ctx.fill();
  }
} 

var stuffToDraw = [
  () => {ctx.clearRect(0,0,canvasW, canvasH)},
  () => {mouseDraw(ctx)},
  () => {elastic.multiTick(1/60, 50)},
  () => {elastic.draw(ctx)},
];

function draw() {
  for (var i = 0; i < stuffToDraw.length; i++) {
    stuffToDraw[i]()
  }
}

var drawInterval = setInterval(draw, 1000/60);

document.addEventListener("keydown", (e) => {
  // console.log(e.code);
  if (e.code == "KeyP") {
    elastic.paused = !elastic.paused;
  } else if (e.code == "KeyF") {
    waveCount = parseFloat(prompt("geef het aantal golven", "0"))*Math.PI;
    amplitude = parseFloat(prompt("geef de amplitude", "100"));
    console.log(waveCount, amplitude);
    elastic.setSinePath(canvas.width*0.05,canvas.height/2,canvas.width*0.95,canvas.height/2, waveCount, amplitude);
  } else if (e.code == "ArrowLeft") {
    elastic.timeSpeed = elastic.timeSpeed*0.5;
  }
  else if (e.code == "ArrowRight") {
    elastic.timeSpeed = elastic.timeSpeed*2;
  }
});

function promptSinePath() {
  waveCount = parseFloat(prompt("geef het aantal golven", "0"))*Math.PI;
  amplitude = parseFloat(prompt("geef de amplitude", "100"));
  elastic.offsetSinePath(waveCount, amplitude);
}
