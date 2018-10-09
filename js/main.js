
var canvasXSize;
var canvasYSize;
var gameSize;
var devicePixelRatio;
var landscape = true;
var ctx;
var fpsGame = 0;
var fpsGameTab = 4;
var fpsUI = 0;
var fpsUIDesired = 20;
var fpsUITab = 4;
var delayUI = 40;
var dateGame0, dateGame1;
var dateUI0, dateUI1;
var creeps = [];

var Creep = {
  x: 100,
  y: 100,
  vx: 1,
  vy: 1,
  speed: 2,
  radius: 10,
  color: 'blue',
  draw: function(ctx) {
	ctx.beginPath();
	ctx.arc(Math.round(this.x), Math.round(this.y), Math.round(this.radius), 0, Math.PI*2, false);
	ctx.closePath();
	ctx.strokeStyle = this.color;
	ctx.stroke();
  }
};

function init(){
  var canvasGame = document.getElementById('game-layer');
  var canvasUI = document.getElementById('ui-layer');
  var canvasBG = document.getElementById('background-layer');
  if (canvasGame.getContext) {
	ctxGame = canvasGame.getContext('2d');
	ctxUI = canvasUI.getContext('2d');
	ctxBG = canvasBG.getContext('2d');

	dateGame0 = performance.now();
	dateGame1 = dateGame0;
	dateUI0 = dateGame0;
	dateUI1 = dateGame0;

	window.addEventListener("resize", resizeGame);
	window.addEventListener('orientationchange', resizeGame);
	resizeGame();

	for (var i = 0; i < 100; i++) {
	  var creep = Object.create(Creep);
	  creep.vx = Math.random();
	  creep.vy = Math.random();
	  creep.radius = 0.01*gameSize;
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
  ctxGame.arc(0.1*gameSize, 0.1*gameSize, 0.04*gameSize, 0, Math.PI*2, false);
  ctxGame.closePath();
  ctxGame.strokeStyle = "coral";
  ctxGame.fillStyle = "bisque";
  ctxGame.fill();
  ctxGame.stroke();

  ctxGame.beginPath();
  ctxGame.arc(0.9*gameSize, 0.9*gameSize, 0.04*gameSize, 0, Math.PI*2, false);
  ctxGame.closePath();
  ctxGame.strokeStyle = "limegreen";
  ctxGame.fillStyle = "palegreen";
  ctxGame.fill();
  ctxGame.stroke();

  for (var i = 0; i < creeps.length; i++) {
	var creep = creeps[i];
	creep.x += creep.vx * creep.speed /** diffTime/1000.*/;
	creep.y += creep.vy * creep.speed /** diffTime/1000.*/;
	if(creep.x > gameSize - creep.radius || creep.x < creep.radius) creep.vx = -creep.vx;
	if(creep.y > gameSize - creep.radius || creep.y < creep.radius) creep.vy = -creep.vy;
	creep.draw(ctxGame);
  }

  window.requestAnimationFrame(drawGame);

}

function drawUI() {
  dateUI1 = performance.now();
  fpsUI = (fpsUI*(fpsUITab-1) + 1000. / (dateUI1 - dateUI0)) / fpsUITab;
  dateUI0 = dateUI1;
  if(Math.round(fpsUI) > fpsUIDesired) delayUI ++;
  else if (Math.round(fpsUI) < fpsUIDesired) delayUI --;

  ctxUI.clearRect(0, 0, canvasXSize, canvasYSize);

  // Bar UI
  ctxUI.beginPath();
  if(landscape) {
		ctxUI.moveTo(gameSize+1, 0);
		ctxUI.lineTo(gameSize+1, gameSize);
  } else {
		ctxUI.moveTo(0, gameSize+1);
		ctxUI.lineTo(gameSize, gameSize+1);
  }
  ctxUI.closePath();
  ctxUI.strokeStyle = "lavender";
  ctxUI.stroke();

  // Title
  var copyrightChar = String.fromCharCode(169);
  var text = 'CanvasTower'+copyrightChar+'Dorian Bayart';
  ctxUI.font = 12+"px Verdana";
  ctxUI.textAlign = "left";
  ctxUI.textBaseline = "top";
  var textPxLength = ctxUI.measureText(text);
  ctxUI.fillStyle = "darkgreen";
  ctxUI.fillText(text, canvasXSize-2-Math.round(textPxLength.width), canvasYSize-2-parseInt(ctxUI.font));

  // FPS
  ctxUI.font = 10+"px Verdana";
  ctxUI.textAlign = "left";
  ctxUI.textBaseline = "top";
  ctxUI.fillStyle = "darkgreen";
  ctxUI.fillText(canvasXSize+'x'+canvasYSize+' pixels ('+devicePixelRatio+')', 2, 2);
  ctxUI.fillText('Game: '+Math.round(fpsGame)+'fps', 2, 2+parseInt(ctxUI.font));
  ctxUI.fillText('UI: '+Math.round(fpsUI)+'fps - Delay: '+delayUI+'ms', 2, 2+2*parseInt(ctxUI.font));

  //window.requestAnimationFrame(drawUI);
  setTimeout(drawUI, delayUI);
}

function resizeGame() {
	var canvasGame = document.getElementById('game-layer');
	var canvasUI = document.getElementById('ui-layer');
	var canvasBG = document.getElementById('background-layer');

	// Récupère les dimensions de la fenêtre
	viewport = {
		width: window.innerWidth,
		height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1
	};
	var ratioSize = 1.6; // Défini un ratio pour les canvas

	if(viewport.width > viewport.height) {
		if(Math.floor(viewport.width / ratioSize) > viewport.height) {
			canvasYSize = viewport.height;
			canvasXSize = Math.floor(canvasYSize * ratioSize);
		} else {
			canvasXSize = viewport.width;
			canvasYSize = Math.floor(canvasXSize / ratioSize);
		}
		gameSize = canvasYSize;
		landscape = true;
	} else {
		if(Math.floor(viewport.width * ratioSize) > viewport.height) {
			canvasYSize = viewport.height;
			canvasXSize = Math.floor(canvasYSize / ratioSize);
		} else {
			canvasXSize = viewport.width;
			canvasYSize = Math.floor(canvasXSize * ratioSize);
		}
		gameSize = canvasXSize;
		landscape = false;
	}

  devicePixelRatio = viewport.devicePixelRatio;
  canvasXSize *= devicePixelRatio;
  canvasYSize *= devicePixelRatio;

	canvasGame.width = canvasXSize;
	canvasGame.height = canvasYSize;
	canvasUI.width = canvasXSize;
	canvasUI.height = canvasYSize;
	canvasBG.width = canvasXSize;
	canvasBG.height = canvasYSize;

	// Centre les canvas
	canvasGame.style.margin = (devicePixelRatio*viewport.height-canvasYSize)/2 + "px " + (devicePixelRatio*viewport.width-canvasXSize)/2 + "px";
	canvasUI.style.margin = (devicePixelRatio*viewport.height-canvasYSize)/2 + "px " + (devicePixelRatio*viewport.width-canvasXSize)/2 + "px";
	canvasBG.style.margin = (devicePixelRatio*viewport.height-canvasYSize)/2 + "px " + (devicePixelRatio*viewport.width-canvasXSize)/2 + "px";
}
