"use strict"

function Bullet(img, position, angle, distance, width, height){
	
	this.position = position || new Vector(0,0);
	this.angle = angle || 10;
	this.distance = distance || 10;
	this.width = width || 10;
	this.height = height || 10;
	this.img = img || "red";
	this.accuracy = this.angle;
	this.randomOffset = getRandom(0, 1) > 0.5 ? 1 : 0;
	
	if(this.randomOffset == 1){
	
		this.accuracy -= .05;
	}
	else{
		
		this.accuracy += .05;
	}
	
	this.velocity = Vector.fromAngle(this.accuracy, 2);
};

var p = Bullet.prototype;

p.update = function(dt){
	
	this.position.add(this.velocity);
	
};

p.draw = function(ctx){
	
	ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
	//console.log(this);
}