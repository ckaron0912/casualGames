//returns mouse pos in local coordinate system of element
function getMouse(e){

	var mouse = {};
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;

}

function pointInsideCircle(x, y, instance){

	var dx = x - instance.x;
	var dy = y - instance.y;
	return (dx * dx) + (dy * dy) <= instance.radius * instance.radius;

}

function getRandom(min, max){

	return Math.random() * (max - min) + min;

}

function getRandomUnitVector(){

	var x = getRandom(-1, 1);
	var y = getRandom(-1, 1);
	var length = Math.sqrt(x*x + y*y);

	if (length == 0){ //very unlikely but must account for
		x = 1;
		y = 0;
		length = 1;
	}
	else{
		x /= length;
		y /= length;
	}

	return {x:x, y:y};

}

// returns a random color of alpha 1.0
// http://paulirish.com/2009/random-hex-color-code-snippets/
function getRandomColor(){

	var red = Math.round(Math.random() * 200 + 55);
	var green = Math.round(Math.random() * 200 + 55);
	var blue = Math.round(Math.random() * 200 + 55);
	var color ='rgb(' + red + ',' + green + ',' + blue + ')';
	// OR if you want to change alpha
	// var color ='rgba('+red+','+green+','+blue+',0.50)'; // 0.50
	return color;

}

function clamp(val, min, max){

	return Math.max(min, Math.min(max, val));
	
}

function Vector(x, y) {
	
  this.x = x || 0;
  this.y = y || 0;
}

// Add a vector to another
Vector.prototype.add = function(vector) {
	
  this.x += vector.x;
  this.y += vector.y;
}

// Gets the length of the vector
Vector.prototype.getMagnitude = function () {
	
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

// Gets the angle accounting for the quadrant we're in
Vector.prototype.getAngle = function () {
	
  return Math.atan2(this.y,this.x);
};

//subtract a vector
Vector.prototype.subtract = function(vect1, vect2){
	
	return new Vector(vect1.x - vect2.x, vect1.y - vect2.x);
}

//multiply a vector
Vector.multiply = function(vect, scalar){
	
	return new Vector(vect.x * scalar, vect.y * scalar);
}

// Allows us to get a new vector from angle and magnitude
Vector.fromAngle = function (angle, magnitude) {
	
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

function angleBetween(p1, p2){
	
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function distanceBetween(obj1, obj2){
	
	return Math.sqrt( (obj2.x-=obj1.x)*obj2.x + (obj2.y-=obj1.y)*obj2.y );
}