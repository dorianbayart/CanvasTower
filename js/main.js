
var canvasXSize;
var canvasYSize;
var ctx;
var fpsGame = 0;
var fpsGameTab = 5;
var fpsUI = 0;
var fpsUIDesired = 15;
var fpsUITab = 10;
var delayUI = 50;
var dateGame0, dateGame1;
var dateUI0, dateUI1;
var creeps = [];

var Creep = {
  x: 100,
  y: 100,
  vx: 1,
  vy: 1,
  speed: 2,
  radius: 5,
  color: 'blue',
  draw: function(ctx) {
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.stroke();
  }
};

function init(){
  var canvasGame = document.getElementById('game-layer');
  var canvasUI = document.getElementById('ui-layer');
  if (canvasGame.getContext) {
    ctxGame = canvasGame.getContext('2d');
    ctxUI = canvasUI.getContext('2d');

    canvasXSize = window.innerWidth;
    canvasYSize = window.innerHeight;

    canvasGame.width = canvasXSize;
    canvasGame.height = canvasYSize;
    canvasUI.width = canvasXSize;
    canvasUI.height = canvasYSize;

    console.log(canvasXSize);
    console.log(canvasYSize);

    dateGame0 = performance.now();
    dateGame1 = dateGame0;
    dateUI0 = dateGame0;
    dateUI1 = dateGame0;

    for (var i = 0; i < 100; i++) {
      var creep = Object.create(Creep);
      creep.vx = Math.random();
      creep.vy = Math.random();
      creeps[i] = creep;
    }

    window.requestAnimationFrame(drawGame);
    window.requestAnimationFrame(drawUI);
  }
}


function drawGame() {

  dateGame1 = performance.now();
  var diffTime = dateGame1 - dateGame0;
  fpsGame = (fpsGame*(fpsGameTab-1) + 1000. / diffTime) / fpsGameTab;
  dateGame0 = dateGame1;

  ctxGame.clearRect(0, 0, canvasXSize, canvasYSize);

  ctxGame.lineWidth = 1;

  ctxGame.beginPath();
  ctxGame.arc(150, 150, 100, 0, Math.PI*2, false);
  ctxGame.strokeStyle = "coral";
  ctxGame.fillStyle = "bisque";
  ctxGame.fill();
  ctxGame.stroke();

  for (var i = 0; i < creeps.length; i++) {
    var creep = creeps[i];
    creep.x += creep.vx * creep.speed /** diffTime/1000.*/;
    creep.y += creep.vy * creep.speed /** diffTime/1000.*/;
    if(creep.x > canvasXSize - creep.radius || creep.x < creep.radius) creep.vx = -creep.vx;
    if(creep.y > canvasYSize - creep.radius || creep.y < creep.radius) creep.vy = -creep.vy;
    creep.draw(ctxGame);
  }

  window.requestAnimationFrame(drawGame);

}

function drawUI() {
  dateUI1 = performance.now();
  fpsUI = (fpsUI*(fpsUITab-1) + 1000. / (dateUI1 - dateUI0)) / fpsUITab;
  dateUI0 = dateUI1;
  if(fpsUI > fpsUIDesired) delayUI ++;
  else if (fpsUI < fpsUIDesired) delayUI --;

  ctxUI.clearRect(0, 0, canvasXSize, canvasYSize);

  // Title
  var text = 'CanvasTower';
  ctxUI.font = "12pt Verdana";
  ctxUI.textAlign = "left";
  ctxUI.textBaseline = "top";
  var textPxLength = ctxUI.measureText(text);
  ctxUI.fillStyle = "darkgreen";
  ctxUI.fillText(text, canvasXSize-8-Math.round(textPxLength.width), 4);

  // FPS
  ctxUI.font = "8pt Verdana";
  ctxUI.textAlign = "left";
  ctxUI.textBaseline = "top";
  ctxUI.fillStyle = "darkgreen";
  ctxUI.fillText('Game: '+Math.round(fpsGame)+'fps', 2, 0);
  ctxUI.fillText('UI: '+Math.round(fpsUI)+'fps', 2, 10);

  //window.requestAnimationFrame(drawUI);
  setTimeout(drawUI, delayUI);
}
