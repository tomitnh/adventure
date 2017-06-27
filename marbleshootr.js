const row = 20;
const col = 20;
var screenRefreshRate = 50; // ms
var spawnGauge = 0;
var spawnRate = 2000; // ms

// drawings
var pixel 	= "_";
var endGamePx 	= "o";
var missleShape = "!";
var alienShape 	= "v";
var shipShape 	= "lol";
// Setup 2D "Arrays"
var S = {},  // Manage the Pixels
	A = {},  // Manage the "Aliens" locations
	M = {};  // Manage the "Missles" locations 

for (var i=0; i<row; i++){
	S[i] = {};
	A[i] = {};
	M[i] = {};
}

fillScreen(pixel);

var timer1 = window.setInterval(screenRefresh, screenRefreshRate);
var timer2 = window.setInterval(processGameActions, screenRefreshRate/2)

// Manage the "Ship"
var Ship = {
	loc : {x:col/2, y:row-1},

	shape : shipShape,

	shootMissles : function () {
		var loc1 = {}, loc2 = {};

		loc1.x = Ship.loc.x;
		loc1.y = Ship.loc.y - 1;

		loc2.x = Ship.loc.x + Ship.shape.length-1;
		loc2.y = Ship.loc.y - 1;

		var m1 = new GameObject(missleShape, 'missle');
		var m2 = new GameObject(missleShape, 'missle');
		M[loc1.x][loc1.y] = m1;
		M[loc2.x][loc2.y] = m2;
	}
};

// Game Controls
window.onkeydown = function (e) {
	switch (e.key) {
		case "a":
		case "ArrowLeft":
		    if (Ship.loc.x > 0){
				Ship.loc.x--;
		    }
			break;
		case "d":
		case "ArrowRight":
			if (Ship.loc.x < col - Ship.shape.length){
				Ship.loc.x++;
			}
			break;
		case " ": // Space
			window.setTimeout(Ship.shootMissles,10);
			break;
		default:
	}
}


/*
 Game Controller for Mobile Devices
 */
window.addEventListener('devicemotion',onTilt);
function onTilt (e) {
	
	// Accommodate for varied browser's differences	
	var sensedLR = e.rotationRate.gamma;
	var sensedFB = e.rotationRate.beta;
	var sensedUD = e.rotationRate.alpha;
	if (window.chrome) {
		sensedLR *= 30;
		sensedFB *= 25;
		sensedUD *= 25;
	}	

	var tiltLR = Math.round(sensedLR);
	var tiltFB = Math.round(sensedFB);
	var tiltUD = Math.round(sensedUD);

	if (tiltFB < -20) {
	    if (Ship.loc.x > 0){  // Move left
		Ship.loc.x--;
	    }

	} else if (tiltFB > 20){
		if (Ship.loc.x < col - Ship.shape.length){ // Move right
			Ship.loc.x++;
		}
	}

	if (tiltUD < -25) {
		window.setTimeout(Ship.shootMissles,10);
	}
}


/*
 Constructor for GameObject
 */
function GameObject (shape, type, loc) {

	this.shape = shape;
	this.type = type;

	this.toString = function () {
		return this.shape;
	}

	this.isThat = function (o) {
		return this.type != o.type;
	}
}

/*
 Searching S[][] for GameObject o
 @return Array of found Objects
 */
function searchScreen(o) {

	var arr;

	for (var i=0; i<row; i++){
		for (var j=0; j<col; j++){

			if (S[i][j].isThat(o))
				arr.push(found)
		}
	}

	return arr;
}

/* 
  Fill S[][] data structure with char c 
  */
function fillScreen (c) {
	for (var i=0; i<row; i++){
		for (var j=0; j<col; j++){
			S[i][j] = c;
		}
	}
}

/* 
  Print S[][] data structure onto HTML screen 
  */
function drawScreen () {
	// Marbleshootr's Game Screen
	var gscreen = document.getElementById('screen');

	var str = '';
	for (var i=0; i<row; i++){
		str += String.fromCharCode(13);
		for (var j=0; j<col; j++){
			str += S[j][i] + ' ';
		}
	}

	gscreen.innerText = str;

	// Centering game screen
	var p = gscreen.parentElement;
	gscreen.style.left = p.offsetWidth/2 - gscreen.offsetWidth/2 + 'px';
	gscreen.style.top = p.offsetHeight/2 - gscreen.offsetHeight/2 + 'px';
}

/*
  Check if the Aliens will go beyond the screen
  */
function isTerminator () {
	for (var j=0; j<col; j++){
		if (S[j][row-1].type == 'alien')
			return true;
	}
	return false;
}

/*
 Advancing aliens army
 */
function advanceAliens () {

	// Spawn Control
	if (spawnGauge >= spawnRate) {
		spawnGauge = 0; 
		spawnRate  -= 25;
	} else {
		spawnGauge += 25;
		return;
	}

	// Shifting existing aliens down one row 
	for (var i=row-1; i>0; i--){
		for (var j=0; j<col; j++){
			A[j][i] = A[j][i-1];
		}
	}

	// Spawning aliens
	for (var i=0; i<row; i++){
		A[i][0] = new GameObject(alienShape, 'alien');
	}
}

/*
 Propel Missles and Clear Aliens in the way
 */
function propelMissles() {
	var dist = 1; // distance moved per processed loop

	for (var i=0; i<row; i++){
		for (var j=0; j<col; j++){
			if (M[i][j] != null){

				// Clear Aliens in the way
				for (var a=0; a>=-2; a--){
					if (j+a >= 0)
						A[i][j+a] = null;
				}

				// Propel the missle within the screen
				if (j-dist >= 0){ 
					M[i][j-dist] = M[i][j];
				}
				M[i][j]=null;
			}
		}
	}
}

/* 
 Process game mechanics
 */
function processGameActions() {
	// PropelMissle
	propelMissles();
	// Advance Aliens Army
	advanceAliens();

	if (isTerminator()){
		gameOver(); //end game scenario
	}
}

/*
 Unschedule all setIntervals and display something
 */
function gameOver() {
	window.clearInterval(timer1);
	window.clearInterval(timer2);
	fillScreen(endGamePx);
	drawScreen();
}

/*
  Update Game Objects 
 */
function screenRefresh () {
	fillScreen(pixel); // Refresh S[][] with pixels

	// Update S[][] of new missles and aliens locations
	for (var i=0; i<row; i++){
		for (var j=0; j<col; j++){

			if (M[i][j])
				S[i][j] = M[i][j];
			else if (A[i][j])
				S[i][j] = A[i][j];
			else 
				S[i][j] = pixel;
		}
	}

	// Update S[][] of Ship's location
	for (var j=0; j<Ship.shape.length; j++){
		S[Ship.loc.x+j][Ship.loc.y] = Ship.shape[j];
	}

	// Draw S[][] onto DOM element
	drawScreen();
}
