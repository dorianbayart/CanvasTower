
var canvasXSize;
var canvasYSize;
var gameSize;
var devicePixelRatio;
var ratioSize = 1.4; // Défini un ratio pour les canvas
var landscape = true;
var ctx;
var fpsGame = 0;
var fpsGameTab = 4;
var fpsUI = 0;
var fpsUIDesired = 20;
var fpsUITab = 4;
var delayUI = 40;
var fpsBG = 0;
var fpsBGDesired = 4;
var fpsBGTab = 2;
var delayBG = 200;
var dateGame0, dateGame1;
var dateUI0, dateUI1;
var dateBG0, dateBG1;
var creeps = [];
var mapSectionSize = 5; // En pourcentage
var baseMap = [];

var Creep = {
  x: 100,
  y: 100,
  vx: 1,
  vy: 1,
  speed: 2,
  radius: 2,
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
	
	// Prevent from scrolling on mobile
	document.body.addEventListener("touchmove", function(event) {
		event.preventDefault();
		event.stopPropagation();
	}, false);
	
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
    dateBG0 = dateGame0;
  	dateBG1 = dateGame0;

  	window.addEventListener("resize", resizeGame);
    //window.addEventListener("zoom", resizeGame);
  	window.addEventListener('orientationchange', resizeGame);
  	resizeGame();

  	for (var i = 0; i < 100; i++) {
  	  var creep = Object.create(Creep);
  	  creep.radius = 1/100*gameSize;
      creep.x = Math.floor(Math.random()*(gameSize-2*creep.radius))+creep.radius;
  	  creep.y = Math.floor(Math.random()*(gameSize-2*creep.radius))+creep.radius;
  	  creep.vx = 2*Math.random()-0.5;
  	  creep.vy = 2*Math.random()-0.5;
  	  creeps[i] = creep;
  	}
	
	
	/*for (var i = 0; i < 100/mapSectionSize; i++) {
		for (var j = 0; j < 100/mapSectionSize; j++) {
			
		}
	}*/

  	window.requestAnimationFrame(drawGame);
  	window.requestAnimationFrame(drawUI);
    window.requestAnimationFrame(drawBG);
  }
}


function drawGame() {

  dateGame1 = performance.now();
  var diffTime = dateGame1 - dateGame0;
  fpsGame = (fpsGame*(fpsGameTab-1) + 1000. / diffTime) / fpsGameTab;
  dateGame0 = dateGame1;

  ctxGame.clearRect(0, 0, canvasXSize, canvasYSize);

  ctxGame.lineWidth = 1;

  ctxGame.strokeStyle = "coral";
  ctxGame.fillStyle = "bisque";
  for (var i = 0; i < 25; i++) {
    ctxGame.beginPath();
    ctxGame.arc(i*0.04*gameSize + 0.04*gameSize/2, 0.4*gameSize, 0.02*gameSize, 0, Math.PI*2, false);
    ctxGame.closePath();
    ctxGame.fill();
    ctxGame.stroke();
  }

  for (var i = 0; i < creeps.length; i++) {
  	var creep = creeps[i];
  	creep.x += creep.vx * creep.speed /** diffTime/1000.*/;
  	creep.y += creep.vy * creep.speed /** diffTime/1000.*/;
  	if(creep.x > gameSize - creep.radius || creep.x < creep.radius) {
      creep.vx = -creep.vx;
    }
  	if(creep.y > gameSize - creep.radius || creep.y < creep.radius) {
      creep.vy = -creep.vy;
    }

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

  // Title
  var copyrightChar = String.fromCharCode(169);
  var text = 'CanvasTower'+copyrightChar+'Dorian Bayart';
  ctxUI.font = 10*devicePixelRatio+"px Verdana";
  ctxUI.textAlign = "left";
  ctxUI.textBaseline = "top";
  var textPxLength = ctxUI.measureText(text);
  ctxUI.fillStyle = "darkgreen";
  ctxUI.fillText(text, canvasXSize-2-Math.round(textPxLength.width), canvasYSize-4-parseInt(ctxUI.font));

  // FPS
  ctxUI.font = 10*devicePixelRatio+"px Verdana";
  ctxUI.textAlign = "left";
  ctxUI.textBaseline = "top";
  ctxUI.fillStyle = "darkgreen";
  ctxUI.fillText(canvasXSize+'x'+canvasYSize+'px (DPR:'+devicePixelRatio+')', 2, 2);
  ctxUI.fillText('Game: '+Math.round(fpsGame)+'fps', 2, 2+parseInt(ctxUI.font));
  ctxUI.fillText('UI: '+Math.round(fpsUI)+'fps - Delay: '+delayUI+'ms', 2, 2+2*parseInt(ctxUI.font));
  ctxUI.fillText('BG: '+Math.round(fpsBG)+'fps - Delay: '+delayBG+'ms', 2, 2+3*parseInt(ctxUI.font));

  //window.requestAnimationFrame(drawUI);
  setTimeout(drawUI, delayUI);
}

function drawBG() {
  dateBG1 = performance.now();
  fpsBG = (fpsBG*(fpsBGTab-1) + 1000. / (dateBG1 - dateBG0)) / fpsBGTab;
  dateBG0 = dateBG1;
  if(Math.round(fpsBG) > fpsBGDesired) delayBG ++;
  else if (Math.round(fpsBG) < fpsBGDesired) delayBG --;

  ctxBG.clearRect(0, 0, canvasXSize, canvasYSize);

  ctxBG.lineWidth = 1;

  // Bar UI
  ctxBG.beginPath();
  if(landscape) {
		ctxBG.moveTo(gameSize+1, 0);
		ctxBG.lineTo(gameSize+1, gameSize);
  } else {
		ctxBG.moveTo(0, gameSize+1);
		ctxBG.lineTo(gameSize, gameSize+1);
  }
  ctxBG.closePath();
  ctxBG.strokeStyle = "lavender";
  ctxBG.stroke();

  // Start zone : Size = 10%
  ctxBG.beginPath();
  ctxBG.arc(0.15*gameSize, 0.15*gameSize, 0.05*gameSize, 0, Math.PI*2, false);
  ctxBG.closePath();
  ctxBG.strokeStyle = "coral";
  ctxBG.fillStyle = "bisque";
  ctxBG.fill();
  ctxBG.stroke();

  // End zone : Size = 10%
  ctxBG.beginPath();
  ctxBG.arc(0.85*gameSize, 0.85*gameSize, 0.05*gameSize, 0, Math.PI*2, false);
  ctxBG.closePath();
  ctxBG.strokeStyle = "limegreen";
  ctxBG.fillStyle = "palegreen";
  ctxBG.fill();
  ctxBG.stroke();

  setTimeout(drawBG, delayBG);
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

  canvasGame.width = canvasXSize;
  canvasGame.height = canvasYSize;
  canvasUI.width = canvasXSize;
  canvasUI.height = canvasYSize;
  canvasBG.width = canvasXSize;
  canvasBG.height = canvasYSize;

  devicePixelRatio = viewport.devicePixelRatio;
  canvasXSize *= devicePixelRatio;
  canvasYSize *= devicePixelRatio;
  gameSize *= devicePixelRatio;

  ctxGame.scale(1/devicePixelRatio, 1/devicePixelRatio);
  ctxUI.scale(1/devicePixelRatio, 1/devicePixelRatio);
  ctxBG.scale(1/devicePixelRatio, 1/devicePixelRatio);

	// Centre les canvas
	canvasGame.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
	canvasUI.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
	canvasBG.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
}
