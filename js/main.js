var canvasXSize;
var canvasYSize;
var gameSize;
var devicePixelRatio;
var ratioSize = 1.4; // Défini un ratio pour les canvas
var landscape = true;
var ctx;
var fpsGame = 0;
var fpsGameTab = 20; // Used to average
var fpsUI = 0;
var fpsUITab = 10; // Used to average
var delayUI = 40; // 25 FPS
var fpsBG = 0;
var fpsBGTab = 4; // Used to average
var delayBG = 200; // 5 FPS
var dateGame0, dateGame1;
var dateUI0, dateUI1;
var dateBG0, dateBG1;
var creeps = [];
var towers = [];
var shots = [];
var startZone;
var endZone;
var mapSectionSize = 5; // En pourcentage
var baseMap = [];

var Creep = {
	x: 100,
	y: 100,
	vx: 1,
	vy: 1,
	speed: 2,
	radius: 0.01,
	color: 'blue',
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x), Math.round(this.y), Math.round(this.radius), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = this.color;
		ctx.stroke();
	}
};

var StartZone = {
	x: 0.15,
	y: 0.15,
	radius: 0.05,
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x*gameSize), Math.round(this.y*gameSize), Math.round(this.radius*gameSize), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = "coral";
		ctx.fillStyle = "bisque";
		ctx.fill();
		ctx.stroke();
	}
};

var EndZone = {
	x: 0.85,
	y: 0.85,
	radius: 0.05,
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x*gameSize), Math.round(this.y*gameSize), Math.round(this.radius*gameSize), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = "limegreen";
		ctx.fillStyle = "palegreen";
		ctx.fill();
		ctx.stroke();
	}
};

var Tower = {
	x: 0.1,
	y: 0.1,
	radius: 0.02,
	power: 10,
	range: 0.1, // radius
	cadence: 1, // per second
	type: 'basic',
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x), Math.round(this.y), Math.round(this.radius), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = "coral";
		ctx.fillStyle = "bisque";
		ctx.fill();
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

		for (var i = 0; i < 20; i++) {
			var creep = Object.create(Creep);
			creep.radius *= gameSize;
			creep.x = Math.floor(Math.random()*(gameSize-2*creep.radius))+creep.radius;
			creep.y = Math.floor(Math.random()*(gameSize-2*creep.radius))+creep.radius;
			creep.vx = 2*Math.random()-0.5;
			creep.vy = 2*Math.random()-0.5;
			creeps[i] = creep;
		}

		startZone = Object.create(StartZone);
		endZone = Object.create(EndZone);

		// Initialize the map
		for (var i = 0; i < 100/mapSectionSize; i++) {
			baseMap[i] = new Array(100/mapSectionSize);
			for (var j = 0; j < 100/mapSectionSize; j++) {
				baseMap[i][j] = 0;
			}
		}
		baseMap[startZone.x*100/mapSectionSize][startZone.y*100/mapSectionSize] = 'StartZone';
		baseMap[endZone.x*100/mapSectionSize][endZone.y*100/mapSectionSize] = 'EndZone';

		for (var i = 0; i < 5; i++) {
			var tower = Object.create(Tower);
			tower.radius *= gameSize;
			tower.x = Math.floor(Math.random()*(gameSize-2*tower.radius))+tower.radius;
			tower.y = Math.floor(Math.random()*(gameSize-2*tower.radius))+tower.radius;
			towers[i] = tower;
		}

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

	for (var i = 0; i < creeps.length; i++) {
		var creep = creeps[i];
		/*
		creep.x += creep.vx * creep.speed;
		creep.y += creep.vy * creep.speed;
		if(creep.x > gameSize - creep.radius || creep.x < creep.radius) {
		  creep.vx = -creep.vx;
		}
		if(creep.y > gameSize - creep.radius || creep.y < creep.radius) {
		  creep.vy = -creep.vy;
		}
		*/

		creep.draw(ctxGame);
	}

	window.requestAnimationFrame(drawGame);
}

function drawUI() {
	dateUI1 = performance.now();
	if(dateUI1 - dateUI0 > delayUI) {
		fpsUI = (fpsUI*(fpsUITab-1) + 1000. / (dateUI1 - dateUI0)) / fpsUITab;
		dateUI0 = dateUI1;

		ctxUI.clearRect(0, 0, canvasXSize, canvasYSize);

		// Title and Name
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
		ctxUI.fillText('UI: '+Math.round(fpsUI)+'fps', 2, 2+2*parseInt(ctxUI.font));
		ctxUI.fillText('BG: '+Math.round(fpsBG)+'fps', 2, 2+3*parseInt(ctxUI.font));
	}

	window.requestAnimationFrame(drawUI);
}

function drawBG() {
	dateBG1 = performance.now();
	if(dateBG1 - dateBG0 > delayBG) {
	fpsBG = (fpsBG*(fpsBGTab-1) + 1000. / (dateBG1 - dateBG0)) / fpsBGTab;
	dateBG0 = dateBG1;

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
	
	// Just for tests
	for (var i = 0; i < 100/mapSectionSize; i++) {
		for (var j = 0; j < 100/mapSectionSize; j++) {
			var tile = baseMap[i][j];
			if(tile == 0) {
				ctxBG.beginPath();
				ctxBG.arc(Math.round(i*mapSectionSize*gameSize/100+mapSectionSize*gameSize/200), Math.round(j*mapSectionSize*gameSize/100+mapSectionSize*gameSize/200), Math.round(mapSectionSize*gameSize/200), 0, Math.PI*2, false);
				ctxBG.closePath();
				ctxBG.strokeStyle = "GhostWhite";
				ctxBG.fillStyle = "GhostWhite";
				//ctxBG.fill();
				ctxBG.stroke();
			}
		}
	}
	
	// StartZone
	startZone.draw(ctxBG);
	endZone.draw(ctxBG);

	for (var i = 0; i < towers.length; i++) {
		var tower = towers[i];
		tower.draw(ctxBG);
		}
	}
	
	window.requestAnimationFrame(drawBG);
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
	
	// Trying to bypass the antialias
	ctxGame.translate(0.5,0.5);
	ctxUI.translate(0.5,0.5);
	ctxBG.translate(0.5,0.5);

	// Centre les canvas
	canvasGame.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
	canvasUI.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
	canvasBG.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
}
