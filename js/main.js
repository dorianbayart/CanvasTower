var canvasXSize;
var canvasYSize;
var gameSize;
var devicePixelRatio;
var ratioSize = 1.4; // Défini un ratio pour les canvas
var landscape = true;
var ctx;
var fpsGame = 0;
var fpsGameTab = 50; // Used to average
var fpsUI = 0;
var fpsUITab = 20; // Used to average
var delayUI = 40; // 25 FPS
var fpsBG = 0;
var fpsBGTab = 10; // Used to average
var delayBG = 100; // 10 FPS
var dateGame0, dateGame1;
var dateUI0, dateUI1;
var dateBG0, dateBG1;
var dateNewCreep0, dateNewCreep1;
var dateUpdateGame0, dateUpdateGame1;
var newCreepInterval = 5000;
var updateGameInterval = 25;
var creeps = [];
var towers = [];
var shots = [];
var startZone;
var endZone;
var mapSectionSize = 0.1; // En pourcentage
var baseMap = [];
var lives = 10;

var Creep = {
	x: 100,
	y: 100,
	vx: 1,
	vy: 1,
	speed: 1,
	radius: 0.025,
	life: 10,
	color: 'cornflowerblue',
	fillColor: 'lightskyblue',
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x), Math.round(this.y), Math.round(this.radius), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.fillColor;
		ctx.fill();
		ctx.stroke();

	}
};

var StartZone = {
	x: 0.1,
	y: 0.1,
	radius: 0.04,
	color: 'coral',
	fillColor: 'bisque',
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round((this.x+mapSectionSize/2)*gameSize), Math.round((this.y+mapSectionSize/2)*gameSize), Math.round(this.radius*gameSize), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.fillColor;
		ctx.fill();
		ctx.stroke();
	}
};

var EndZone = {
	x: 0.8,
	y: 0.8,
	radius: 0.04,
	color: 'limegreen',
	fillColor: 'palegreen',
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round((this.x+mapSectionSize/2)*gameSize), Math.round((this.y+mapSectionSize/2)*gameSize), Math.round(this.radius*gameSize), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.fillColor;
		ctx.fill();
		ctx.stroke();
	}
};

var Tower = {
	x: 0.1,
	y: 0.1,
	radius: 0.04,
	angle: -Math.PI/4,
	power: 10,
	range: 0.1, // radius
	cadence: 1, // per second
  focusOn: 0, // creep focused
	type: 'basic',
	color: 'chocolate',
	fillColor: 'wheat',
	draw: function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x), Math.round(this.y), Math.round(this.radius), 0, Math.PI*2, false);
		ctx.moveTo(Math.round(this.x), Math.round(this.y));
  		ctx.lineTo(Math.round(this.x+Math.cos(this.angle)*this.radius), Math.round(this.y+Math.sin(this.angle)*this.radius));
		ctx.closePath();
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.fillColor;
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
		dateNewCreep0 = dateGame0;
		dateNewCreep1 = dateGame0;
		dateUpdateGame0 = dateGame0;
		dateUpdateGame1 = dateGame0;

		window.addEventListener("resize", resizeGame);
		//window.addEventListener("zoom", resizeGame);
		window.addEventListener('orientationchange', resizeGame);

		resizeGame();

		startZone = Object.create(StartZone);
		endZone = Object.create(EndZone);

		// Initialize the map
		for (var i = 0; i < 1/mapSectionSize; i++) {
			baseMap[i] = new Array(1/mapSectionSize);
			/*for (var j = 0; j < 1/mapSectionSize; j++) {
				baseMap[i][j] = 0;
			}*/
		}
		baseMap[1][4] = 'Wall';
		baseMap[8][7] = 'Wall';
		baseMap[9][6] = 'Wall';


		for (var i = 0; i < 5; i++) {
			var tower = Object.create(Tower);
			tower.radius *= gameSize;
			tower.x = Math.floor(Math.random()*(1/mapSectionSize))*gameSize*mapSectionSize + gameSize*mapSectionSize/2;
			tower.y = Math.floor(Math.random()*(1/mapSectionSize))*gameSize*mapSectionSize + gameSize*mapSectionSize/2;
			towers[i] = tower;
			baseMap[Math.floor(tower.x/gameSize/mapSectionSize)][Math.floor(tower.y/gameSize/mapSectionSize)] = 'Tower'
		}

		preparePathsMap();

		window.requestAnimationFrame(drawGame);
		window.requestAnimationFrame(drawUI);
		window.requestAnimationFrame(drawBG);
		window.requestAnimationFrame(updateGame);
		window.requestAnimationFrame(newCreep);
	}
}

function preparePathsMap() {
  /*
    frontier = Queue()
    frontier.put(start)
    distance = {}
    distance[start] = 0

    while not frontier.empty():
       current = frontier.get()
       for next in graph.neighbors(current):
          if next not in distance:
             frontier.put(next)
             distance[next] = 1 + distance[current]
  */

  var Coord = {
    x: 0,
    y: 0
  };

  var frontier = [];
  var f = 0;
  var c = Object.create(Coord);
  c.x = Math.round(endZone.x/mapSectionSize);
  c.y = Math.round(endZone.y/mapSectionSize);
  frontier[f] = c;
  var distance = [];
  var dx = 0, dy = 0;
  baseMap[c.x][c.y] = 0;

  while (f < frontier.length) {
    c = frontier[f];

    if( c.y > 0 && !baseMap[c.x][c.y-1] ) { // North
      var c_N = Object.create(Coord);
      c_N.x = c.x;
      c_N.y = c.y - 1;
      frontier[frontier.length] = c_N;
      baseMap[c_N.x][c_N.y] = baseMap[c.x][c.y] + 1;
    }
    if ( c.y < 1/mapSectionSize-1 && !baseMap[c.x][c.y+1] ) { // South
      var c_N = Object.create(Coord);
      c_N.x = c.x;
      c_N.y = c.y + 1;
      frontier[frontier.length] = c_N;
      baseMap[c_N.x][c_N.y] = baseMap[c.x][c.y] + 1;
    }
    if ( c.x < 1/mapSectionSize-1 && !baseMap[c.x+1][c.y] ) { // East
      var c_N = Object.create(Coord);
      c_N.x = c.x + 1;
      c_N.y = c.y;
      frontier[frontier.length] = c_N;
      baseMap[c_N.x][c_N.y] = baseMap[c.x][c.y] + 1;
    }
    if ( c.x > 0 && !baseMap[c.x-1][c.y] ) { // West
      var c_N = Object.create(Coord);
      c_N.x = c.x - 1;
      c_N.y = c.y;
      frontier[frontier.length] = c_N;
      baseMap[c_N.x][c_N.y] = baseMap[c.x][c.y] + 1;
    }
    f++;
  }

  baseMap[Math.round(endZone.x/mapSectionSize)][Math.round(endZone.y/mapSectionSize)] = 0;
}


function updateGame() {
	dateUpdateGame1 = performance.now();
	var diffTime = dateUpdateGame1 - dateUpdateGame0;
	var x = 0;
	var y = 0;
	var score = 0;
	var modifY = false;
	var	modifX = false;
	var speed = 1;
	var creep;
	var tower;
	if(diffTime >= updateGameInterval) {
		dateUpdateGame0 = dateUpdateGame1;
		for (var i = 0; i < creeps.length; i++) {
			creep = creeps[i];
			x = Math.floor((creep.x-creep.radius)/gameSize/mapSectionSize);
			y = Math.floor((creep.y-creep.radius)/gameSize/mapSectionSize);
			speed = creep.speed * gameSize*mapSectionSize * updateGameInterval/1000;
			score = baseMap[x][y];
			modifX = false;
			modifY = false;

			if((y > 0 && score > baseMap[x][y-1])) {
				creep.y -= speed;
				modifY = true;
			} else if ((y < 1/mapSectionSize-1 && score > baseMap[x][y+1])) {
				creep.y += speed;
				modifY = true;
			} else if ((x > 0 && score > baseMap[x-1][y])) {
				creep.x -= speed;
				modifX = true;
			} else if ((x < 1/mapSectionSize-1 && score > baseMap[x+1][y])) {
				creep.x += speed;
				modifX = true;
			}

			if(!modifY && creep.y-creep.radius/4 > y*gameSize*mapSectionSize+gameSize*mapSectionSize/2 && score < baseMap[x][y+1]) {
				creep.y -= speed;
			} else if (!modifY && creep.y+creep.radius/4 < y*gameSize*mapSectionSize+gameSize*mapSectionSize/2 && score < baseMap[x][y-1]) {
				creep.y += speed;
			} else if (!modifX && creep.x-creep.radius/4 > x*gameSize*mapSectionSize+gameSize*mapSectionSize/2 && score < baseMap[x+1][y]) {
				creep.x -= speed;
			} else if (!modifX && creep.x+creep.radius/4 < x*gameSize*mapSectionSize+gameSize*mapSectionSize/2 && score < baseMap[x-1][y]) {
				creep.x += speed;
			}

			if(x === endZone.x/mapSectionSize && y === endZone.y/mapSectionSize) {
				creeps.remove(i);
				lives --;
			}
		}

		if(creeps.length) {

			var creep;
			var x1, y1, x2, y2;
			var distance;
			for (var i = 0; i < towers.length; i++) {
				distance = gameSize*gameSize;
				tower = towers[i];
				x1 = tower.x;
				y1 = tower.y;

				for (var j=0; j < creeps.length; j++) {
					creep = creeps[j];
					x2 = creep.x;
					y2 = creep.y;
					if((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) < distance) {
						distance = Math.round((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
						tower.angle = Math.atan2(y2-y1, x2-x1);
						tower.focusOn = j;
					}
				}

			}
		}
	}
	window.requestAnimationFrame(updateGame);
}

function newCreep() {
	dateNewCreep1 = performance.now();
	var diffTime = dateNewCreep1 - dateNewCreep0;
	if(diffTime >= newCreepInterval) {
		dateNewCreep0 = dateNewCreep1;
		var creep = Object.create(Creep);
		creep.radius *= gameSize;
		
		creep.x = Math.floor(startZone.x*gameSize+gameSize*mapSectionSize/2);
		creep.y = Math.floor(startZone.y*gameSize+gameSize*mapSectionSize/2);
		creep.speed = /*Math.random()*1.2+0.4*/ 1;

		creeps[creeps.length] = creep;
	}
	window.requestAnimationFrame(newCreep);
}

function drawGame() {
	var creep;
	dateGame1 = performance.now();
	var diffTime = dateGame1 - dateGame0;
	fpsGame = (fpsGame*(fpsGameTab-1) + 1000. / diffTime) / fpsGameTab;
	dateGame0 = dateGame1;

	ctxGame.clearRect(0, 0, canvasXSize, canvasYSize);
	ctxGame.lineWidth = 1;
	
	for (var i = 0; i < creeps.length; i++) {
		creep = creeps[i];
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
		ctxUI.fillText('Creeps: '+creeps.length+'', 2, 2+4*parseInt(ctxUI.font));
		ctxUI.fillText('Lives: '+lives+'', 2, 2+5*parseInt(ctxUI.font));
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


  	for (var i = 0; i < 1/mapSectionSize; i++) {
  		for (var j = 0; j < 1/mapSectionSize; j++) {
  			var tile = baseMap[i][j];
			// Just for tests
			/*ctxBG.beginPath();
			ctxBG.arc(i*mapSectionSize*gameSize+mapSectionSize*gameSize/2, j*mapSectionSize*gameSize+mapSectionSize*gameSize/2, mapSectionSize*gameSize/2, 0, Math.PI*2, false);
			ctxBG.closePath();
			ctxBG.strokeStyle = "gainsboro";
			ctxBG.fillStyle = "ghostWhite";
			//ctxBG.fill();
			ctxBG.stroke();*/

			if(tile == 'Wall') {
  				ctxBG.beginPath();
  				ctxBG.arc(i*mapSectionSize*gameSize+mapSectionSize*gameSize/2, j*mapSectionSize*gameSize+mapSectionSize*gameSize/2, mapSectionSize*gameSize/2, 0, Math.PI*2, false);
  				ctxBG.closePath();
  				ctxBG.strokeStyle = "darkgray";
  				ctxBG.fillStyle = "gainsboro";
  				ctxBG.fill();
  				ctxBG.stroke();

  			}
        /*ctxBG.font = 10*devicePixelRatio+"px Verdana";
        ctxBG.textAlign = "center";
        ctxBG.textBaseline = "middle";
        ctxBG.fillStyle = "gainsboro";
        ctxBG.fillText(tile, i*mapSectionSize*gameSize+mapSectionSize*gameSize/2, j*mapSectionSize*gameSize+mapSectionSize*gameSize/2);*/
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

	devicePixelRatio = /*viewport.devicePixelRatio + 1*/4;
	canvasXSize *= devicePixelRatio;
	canvasYSize *= devicePixelRatio;
	gameSize *= devicePixelRatio;

	ctxGame.scale(1/devicePixelRatio, 1/devicePixelRatio);
	ctxUI.scale(1/devicePixelRatio, 1/devicePixelRatio);
	ctxBG.scale(1/devicePixelRatio, 1/devicePixelRatio);

	// Trying to bypass the antialias
	/*ctxGame.translate(0.5,0.5);
	ctxUI.translate(0.5,0.5);
	ctxBG.translate(0.5,0.5);*/

	// Centre les canvas
	canvasGame.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
	canvasUI.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
	canvasBG.style.margin = Math.floor((devicePixelRatio*viewport.height-canvasYSize)/(2*devicePixelRatio)) + "px " + Math.floor((devicePixelRatio*viewport.width-canvasXSize)/(2*devicePixelRatio)) + "px";
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
