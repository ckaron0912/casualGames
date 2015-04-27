"use strict"

var SpriteObject = {
    
	hasImage: true,
	flipped: false,
	tank: false,
	
    init: function(img, x, y, width, height, drawX){
    	this.img = img || "red";
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.drawX = drawX || 0;
		
		if (typeof this.img == "string"){
			this.hasImage = false;
		}
		
		if(this.flipped && this.tank){
			
			this.movingRight = false;
			this.movingLeft = true;
		}
		else if(!this.flipped && this.tank){
			
			this.movingRight = true;
			this.movingLeft = false;
		}
    },
    
    draw: function(ctx, frame){
		if (!this.hasImage){
			ctx.fillStyle = this.img;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		else if (frame == undefined){
			if(this.flipped){
				//still testing code
				ctx.fillStyle = "red";
				ctx.fillRect(this.x, this.y, this.width, this.height);
				ctx.drawImage(this.img, this.x, this.y);
				
			}
			else{
				ctx.fillStyle = "red";
				ctx.fillRect(this.x, this.y, this.width, this.height);
				ctx.drawImage(this.img, this.x, this.y);
			}
		}
		else if(this.tank){
			
			ctx.save();
			ctx.translate(this.x + (this.width/2) - 1, this.y + 5);
			ctx.rotate(this.angle);
			ctx.drawImage(this.gun, 0, 0);
			ctx.restore();
			ctx.drawImage(this.img, frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		}
		else{ //spritesheets
			//debug: show hitboxes
			//ctx.fillStyle = "red";
			//ctx.fillRect(this.x, this.y, this.width, this.height);
			ctx.drawImage(this.img, frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
		}
    }
};
