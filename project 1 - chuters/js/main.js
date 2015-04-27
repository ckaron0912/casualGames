(function(){ //begin IIFE

	"use strict";
	
	//canvas vars
	var canvas, ctx;
    var HALF_WIDTH = 0, HALF_HEIGHT = 0;

	//game vars
	var GAME_STATE_BEGIN = 0;
	var GAME_STATE_DEFAULT = 1;
	var GAME_STATE_PAUSED = 2;
	var GAME_STATE_END = 3;
	var gameState = GAME_STATE_BEGIN;
	var firstRun = true;
	var score = 0;
	var lives = 3;
	var landstreak = 0;
	var totalLanded = 0;
	var GRAVITY = 25; //pixels/sec
	var WIND_FORCE_MAX = 20; //pixels/sec
	var windForce = 0; //pixels/sec
	var smokeEmitter = {};
	
	//for score
	var finalScore = 0;
	var localScores = undefined;
	var newHigh = false;

	//animation vars
	var lastTime = 0;
	var animationID;

	//character vars
    var player = undefined; //will be created in init
    var DESCENT = .75; //pixels/sec
	var SLOW_DESCENT = .5; //pixels/sec
	var FAST_DESCENT = 1.75; //pixels/sec
	var CHUTELESS_DESCENT = 3; //pixels/sec

	//planes
	var plane = undefined;
	var bomber = undefined;
	var bombs = [];
	var BOMB_DESCENT = 5;
	
	//enemies
	var enemies = [];
	var numFlipped = 0;
	var numNorm = 0;
	//var callEnemy = undefined;
	var tankSpawnTimer = 0;
	var freq = 15;
	var MAX_FREQ = 3;
	
	//bullets
	var bullets = [];

	//keyboard
	var UP_KEY = 38;
	var LEFT_KEY = 37;
	var DOWN_KEY = 40;
	var RIGHT_KEY = 39;
	var W_KEY = 87;
	var A_KEY = 65;
	var S_KEY = 83;
	var D_KEY = 68;
	var ESC_KEY = 27;
	var SPACE_KEY = 32;

	//image vars
	var skyTileImage = undefined;
	var groundTileImage = undefined;
	var wireTileImage = undefined;
	var targetImage = undefined;
	var planeImage = undefined;
	var bomberImage = undefined;
	var bombImage = undefined;
	var enemyImage = undefined;
	var tankGunImage = undefined;
	var playerImage = undefined;

	//sound vars
	var landedSound, missedSound, planeSound, bomberSound, bombSound, bulletSound, gameOverSound, menuLoopSound;

	//----------------------------------------------------------------------------------------//
	
	window.onload = init;
	
	function init(){

		//set up canvas
		canvas = document.querySelector("canvas");
		canvas.width = 720; //may need to be tweaked
		canvas.height = 480;
		ctx = canvas.getContext("2d");
        HALF_HEIGHT = canvas.height/2;
        HALF_WIDTH = canvas.width/2;
		
		//load images
		skyTileImage = new Image();
		skyTileImage.src = "media/images/sky.png"
		groundTileImage = new Image();
		groundTileImage.src = "media/images/ground.png";
		wireTileImage = new Image();
		wireTileImage.src = "media/images/wire.png";
		targetImage = new Image();
		targetImage.src = "media/images/target.png";
		enemyImage = new Image();
		enemyImage.src = "media/images/tank_spritesheet.png";
		tankGunImage = new Image();
		tankGunImage.src = "media/images/tank_gun.png";
		planeImage = new Image();
		planeImage.src = "media/images/plane_spritesheet.png";
		bomberImage = new Image();
		bomberImage.src = "media/images/bomber_spritesheet.png";
		bombImage = new Image();
		bombImage.src = "media/images/bomb_spritesheet.png";
		playerImage = new Image();
		playerImage.src = "media/images/chuter_spritesheet.png";

		//load sounds
		landedSound = document.querySelector("#landedSound");
		missedSound = document.querySelector("#missedSound");
		planeSound = document.querySelector("#planeSound");
		bomberSound = document.querySelector("#bomberSound");
		bombSound = document.querySelector("#bombSound");
		bulletSound = document.querySelector("#bulletSound");
		gameOverSound = document.querySelector("#gameOverSound");
		menuLoopSound = document.querySelector("#menuLoopSound");

		//hook events
		window.onblur = function(){
			stopAudio();

			//pause
			if (gameState != GAME_STATE_END && gameState != GAME_STATE_BEGIN){
				gameState = GAME_STATE_PAUSED;
				if (plane.soundPlaying){
					planeSound.pause();
				}
				cancelAnimationFrame(animationID);
				update(); //calls once to draw pause screen
			}
		}

		window.onfocus = function(){
			//unpause
			if (gameState != GAME_STATE_END && gameState != GAME_STATE_BEGIN){
				gameState = GAME_STATE_DEFAULT;
				if (plane.soundPlaying){
					planeSound.play();
				}
				cancelAnimationFrame(animationID);
				update();
			}
			
			if(gameState == GAME_STATE_BEGIN || gameState == GAME_STATE_END){
				
				menuLoopSound.play();
			}
		}
		
		window.onclick = function(){
			if (gameState == GAME_STATE_END){
				gameState = GAME_STATE_DEFAULT
				lives = 3;
				score = 0;
				totalLanded = 0;
				landstreak = 0;
				windForce = 0;
				freq = 15000;
				tankSpawnTimer = 0;
				stopAudio();
				enemies = [];
				numNorm = 0;
				numFlipped = 0;
				bullets = [];
				newHigh = false;
				resetPlayer();
				resetPlane();
				reset();
				update();
			}
			
			if (gameState == GAME_STATE_BEGIN){
				stopAudio();
				gameState = GAME_STATE_DEFAULT;
				update();
			}
		}
        
        window.onkeydown = function(key){
            switch(key.keyCode){

                case RIGHT_KEY:{
                    player.movingRight = true;
                	break;
                }
                case LEFT_KEY:{
                	player.movingLeft = true;
                	break;
                }
                case UP_KEY:{
                	player.slowDescent = true;
                	break;
                }
                case DOWN_KEY:{
                	player.fastDescent = true;
                	break;
                }
				case D_KEY:{
                    player.movingRight = true;
                	break;
                }
                case A_KEY:{
                	player.movingLeft = true;
                	break;
                }
                case W_KEY:{
                	player.slowDescent = true;
                	break;
                }
                case S_KEY:{
                	player.fastDescent = true;
                	break;
                }
            }
			//debug:
        	//console.log("x: " + player.x + " y: " + player.y); 
        }
        
        window.onkeyup = function(key){
             switch(key.keyCode){
                
                case RIGHT_KEY:{
                    player.movingRight = false;
                	break;
                }
                case LEFT_KEY:{
                	player.movingLeft = false;
                	break;
                }
                case UP_KEY:{
                	player.slowDescent = false;
                	break;
                }
                case DOWN_KEY:{
                	player.fastDescent = false;
                	break;
                }
				case D_KEY:{
                    player.movingRight = false;
                	break;
                }
                case A_KEY:{
                	player.movingLeft = false;
                	break;
                }
                case W_KEY:{
                	player.slowDescent = false;
                	break;
                }
                case S_KEY:{
                	player.fastDescent = false;
                	break;
                }
            }
        }

        //set up game
		createPlayer();
		createPlane();
		createBomber();
		//callEnemy = setInterval(createEnemy, freq);
		createSmokeEmitter();
		reset();

		//begin looping
		update();
		menuLoopSound.play();
	}

	function createPlayer(){
        player = Object.create(SpriteObject);
        player.animationIndex = 0;
        player.isDropping = false;
        player.hasChute = false;
        player.didLand = false;
        player.landedTimer = 0;
        player.dropX = HALF_WIDTH - 12; //first run
        player.xSpeed = 0;
        player.ySpeed = 0;
        player.movingLeft = false;
        player.movingRight = false;
        player.slowDescent = false;
        player.fastDescent = false;
		player.inSafeZone = function(){
			
			if(this.x + this.width/2 > HALF_WIDTH - 30 && this.x + this.width/2 < HALF_WIDTH + 30 && 
				this.y + this.height/2 > canvas.height - 80){
				
				return true;
			}
			else return false;
		}
		player.intersectsWithBullet = function(object){
            if (this.x < object.position.x + object.width && // player's left side is to the left of object's right side
                this.x + this.width > object.position.x && // player's right side is to the right of object's left side
                this.y < object.position.y + object.height &&  // player's top is above object's bottom
                this.height + this.y > object.position.y){ // player's bottom is below object's top
                // collision detected!
                return true;
            }
        },
        player.update = function(dt){
        	//x movement
            if (this.movingRight){
                this.xSpeed = 30;
            }
            else if (this.movingLeft){
                this.xSpeed = -30;
            }
            else {
            	this.xSpeed = 0;
            }

            if (!this.didLand){
				this.x += (this.xSpeed + windForce) * dt;
			}
            
            //y movement
            if (this.hasChute && !this.didLand){
            	if (this.slowDescent){
	            	this.ySpeed = SLOW_DESCENT * GRAVITY;
	            }
	            else if (this.fastDescent){
	            	this.ySpeed = FAST_DESCENT * GRAVITY;
	            }
	            else {
	            	this.ySpeed = DESCENT * GRAVITY;
	            } 
	        }
            else if (!this.didLand) {
            	//fall
            	this.ySpeed = CHUTELESS_DESCENT * GRAVITY;

            	//pop chute
            	if (this.y > 80){
            	this.animationIndex++;

	            	//animation finished?
	            	if (this.animationIndex == 4){
	            		this.hasChute = true;
	            	}
	            }
            }

            if(!this.didLand){
	            this.y += this.ySpeed * dt;
	        }

            //screen wrap
			if (this.x > canvas.width){
				this.x = -this.width;
			}
			if (this.x < -this.width){
				this.x = canvas.width;
			}
            
            //stop moving if landed
            if (!this.didLand && (this.y + this.height >= canvas.height - groundTileImage.height + 6)){
            	this.didLand = true;
            	this.isDropping = false;
            }

            //animate landing
            if (this.didLand){
            	this.landedTimer += dt;
            	this.animationIndex++;
            	if (this.animationIndex > 7){
            		this.animationIndex = 7;
            	}
            }
        };
		
		player.init(playerImage, -24, 0, 24, 40); //x and y get set by update
    }

    function resetPlayer(){
    	player.animationIndex = 0;
        player.isDropping = false;
        player.hasChute = false;
        player.didLand = false;
        player.landedTimer = 0;
        player.dropX = getRandom(100, canvas.width - 100);
        player.xSpeed = 0;
        player.ySpeed = 0;
        player.movingLeft = false;
        player.movingRight = false;
        player.slowDescent = false;
        player.fastDescent = false;
    }
	
	function createPlane(){	
		plane = Object.create(SpriteObject);
		plane.animationIndex = 0;
		plane.sendTroops = true;
		plane.soundPlaying = false;
		plane.xSpeed = 150;
		plane.update = function(dt){
			if (this.sendTroops){
				if (!this.soundPlaying && this.x > -200){
					this.soundPlaying = true;
					planeSound.volume = 0.5;
					planeSound.play()
				}

				//fly in
				this.x += this.xSpeed * dt;

				//animate
				this.animationIndex++;
				if (this.animationIndex > 2){
					this.animationIndex = 0;
				}

				if (this.x > canvas.width){
					this.sendTroops = false;
					this.soundPlaying = false;
				}
			}
		};

		plane.init(planeImage, -300, 30, 156, 64);
	}
	
	function resetPlane(){
		plane.animationIndex = 0;
		plane.sendTroops = true;
		plane.soundPlaying = false;
		plane.x = -300;
	}

	function createBomber(){	
		bomber = Object.create(SpriteObject);
		bomber.animationIndex = 0;
		bomber.isActivated = false;
		bomber.soundPlaying = false;
		bomber.bombsDropped = false;
		bomber.xSpeed = -250;
		bomber.update = function(dt){
			if (this.isActivated){
				//fly in
				this.x += this.xSpeed * dt;

				//animate
				this.animationIndex++;
				if (this.animationIndex > 2){
					this.animationIndex = 0;
				}

				//drop bombs
				if (!this.bombsDropped){
					for (var i = 0; i < bombs.length; i++){
						var b = bombs[i];
						if (this.x < b.x){
							b.isActive = true;
						}
					}
				}

				if (!this.soundPlaying && this.x <= canvas.width + 50){
					this.soundPlaying = true;
					bomberSound.volume = 0.5;
					bomberSound.play()
				}
			}
		};

		//create bombs
		for (var i = 0; i < 6; i++){
			var b = Object.create(SpriteObject);
			b.animationIndex = 0;
			b.sound = bombSound;
			b.isActive = false;
			b.ySpeed = BOMB_DESCENT;
			b.init(bombImage, 60 + 100 * i, 100, 96, 96)
			bombs.push(b)
		}

		bomber.init(bomberImage, canvas.width + 300, 100, 156, 64);
	}
	
	function resetBomber(){
		bomber.animationIndex = 0;
		bomber.soundPlaying = false;
		bomber.isActivated = false;
		bomber.bombsDropped = false;
		bomber.x = canvas.width + 300;

		//create bombs
		for (var i = 0; i < 6; i++){
			var b = Object.create(SpriteObject);
			b.animationIndex = 0;
			b.sound = bombSound;
			b.isActive = false;
			b.ySpeed = BOMB_DESCENT;
			b.init(bombImage, 60 + 100 * i, 100, 96, 96)
			bombs.push(b)
		}
	}

	function createSmokeEmitter(){
		smokeEmitter.particles = [];
		smokeEmitter.rate = .17; //particles/per sec
		smokeEmitter.timer = .17;

		smokeEmitter.update = function(dt){
			this.timer += dt;
			//add particle?
			if (this.timer >= this.rate){
				this.timer = 0;

				var p = {};
				p.width = 2;
				p.height = 2;
				p.x = HALF_WIDTH - .5;
				p.y = canvas.height - 20;
				p.xSpeed = getRandom(-.05, .05);
				p.ySpeed = getRandom(-1.5, -.5);
				smokeEmitter.particles.push(p);
			}

			//move/scale particles
			for (var i = 0; i < this.particles.length; i++){
				var p = this.particles[i];
				p.width *= 1.01;
				p.height *= 1.01;
				if (p.width > 10 || p.height > 10){
					p.width = 10;
					p.height = 10;
				}

				p.x += p.xSpeed + (windForce / 10);
				p.y += p.ySpeed;
				
				//destroy particle if...
				if (p.y < 200 || p.x > canvas.width || p.x < 0){
					this.particles.splice(i, 1);
				}
			}	
		}
		smokeEmitter.draw = function(ctx){
			ctx.save();
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = "red";

			for (var i = 0; i < this.particles.length; i++){
				var p = this.particles[i];
				ctx.fillRect(p.x, p.y, p.width, p.height);
			}

			ctx.restore();
		}
	}
    
	function createEnemy(){
		
		if(firstRun || enemies.length == 6) return;
		
		var enemy = Object.create(SpriteObject);

        enemy.xSpeed = 0;
        enemy.movingLeft = false;
        enemy.movingRight = false;
		enemy.tank = true;
		enemy.maxAngle = 0;
		enemy.gun = tankGunImage;
		enemy.angle = 0;
		enemy.timer = 0;
		enemy.rate = 10;
		enemy.update = function(dt){
		
			if (this.isMoving){
				this.animationIndex++;
				if (this.animationIndex > 5){
					this.animationIndex = 0;
				}

				this.x += this.xSpeed;
			}
			
			var angleToPlayer = angleBetween({x: this.x + (this.width/2), y: this.y}, {x: player.x + (player.width/2), y: player.y + player.height + 10});
			this.angle = angleToPlayer;
			
			if(!player.inSafeZone()){
				if(this.timer >= this.rate && !player.didLand){
					this.timer = 0;
					var distToPlayer = distanceBetween({x: this.x + (this.width/2), y: this.y}, {x: player.x + (player.width/2), y: player.y + player.height + 10});
					var bullet = new Bullet("red", new Vector(this.x + (this.width/2), this.y), angleToPlayer, distToPlayer, 5, 5);
					bullets.push(bullet);
					bulletSound.volume = 0.5;
					bulletSound.play();
				}
			}
			this.timer += dt;
			
			//destination if flipped or not
			if(!this.flipped && this.x >= this.destinationX){
			
				this.x = this.destinationX;
				this.animationIndex = 0;
			}
			else if(this.flipped && this.x <= this.destinationX){
			
				this.x = this.destinationX;
				this.animationIndex = 6;
			}
				
			if(this.movingRight){
				
				this.xSpeed = 20;
			}
			else if(this.movingLeft){
				
				this.xSpeed = -20;
			}
			
			this.x += this.xSpeed * dt;
			
			this.animationIndex++;
			
			if(this.animationIndex > 5 && !this.flipped){
			
				this.animationIndex = 0;
			}
			else if(this.animationIndex > 11 && this.flipped){
			
				this.animationIndex = 6;
			}
		}

		var randSide = getRandom(0, 1) > 0.5 ? 1 : 0;//if the number returned is greater than .5 round up, else round down
		
		
		var enemyX = 0;
		var enemyY = canvas.height - 72 + 6;
		
		//spawn on left side
		if (randSide == 1 && numNorm < 3 || numFlipped == 3){
			enemyX = -96;
			enemy.destinationX = (96*numNorm) + 10;
			numNorm++;
			enemy.animationIndex = 0;
			console.log("destX: " + enemy.destinationX);
		}
		else if(numFlipped < 3){ //right side
			enemyX = canvas.width;
			//flip image
			enemy.animationIndex = 6;
			enemy.flipped = true;
			enemy.destinationX = (canvas.width - 106) - (96*numFlipped);
			numFlipped++;
		}

		enemy.init(enemyImage, enemyX, enemyY, 96, 48);
		
		
		
		//add to array of enemies
		enemies.push(enemy);
	}

	function reset(){
		//check for game over
		if (gameState == GAME_STATE_END){
			//handled in onClick
			menuLoopSound.play();
		}
		else{ //continue game loop
			if(!firstRun){

				//reset player, plane, bullets
				resetPlayer();
				resetPlane();
				bullets = [];

				//set up new wind force
				if (score > 1000){
					windForce = getRandom(-WIND_FORCE_MAX, WIND_FORCE_MAX);
				}
				else if (score > 500){
					windForce = getRandom(-10, 10);
				}
				else {
					windForce = getRandom(-5, 5);
				}

				//increase tank spawning
				if (score >= 5000){
					freq = MAX_FREQ;
				}
				else if (score >= 4000){
					freq = 5;
				}
				else if (score >= 3000){
					freq = 7.5;
				}
				else if (score >= 2000){
					freq = 15;
				}
				else if (score >= 1000){
					freq = 20;
				}
				else{
					freq = 30;
				}
				//clearInterval(callEnemy);
				//callEnemy = setInterval(createEnemy, freq);

			}
		}
	}
	
	function update(){
		//check game state
		if (gameState == GAME_STATE_BEGIN){
			drawStartScreen();
			return;
		}
		else if (gameState == GAME_STATE_END){
			drawGameOverScreen();
			return;
		}
		else if (gameState == GAME_STATE_PAUSED){
			drawPauseScreen();
			return;
		}
		else{ //enter game loop
			animationID = requestAnimationFrame(update); //calls update after delay of 1000/60 ms (60 FPS)
			var dt = calculateDeltaTime();

			//update game elements
			smokeEmitter.update(dt);

			if (bomber.isActivated){
				bomber.update(dt);

				//is bombing run finished?
				if (bomber.x < -300){
					enemies = [];
					numNorm = 0;
					numFlipped = 0;
					landstreak = 0;
					resetBomber();
					reset();
				}
			}
			else if (plane.sendTroops){
				plane.update(dt);
				if (!player.isDropping){
					player.x = plane.x + 45;
					player.y = plane.y + 4;
				}
			}

			for (var i = 0; i < bombs.length; i++){
				var b = bombs[i];
				if (b.isActive){
					b.y += b.ySpeed;
					if (b.y + b.height >= canvas.height){
						//detonate
						b.sound.play();
						b.animationIndex++;

						//check if hit tank
						for (var j = 0; j < enemies.length; j++){
							var t = enemies[j];
							if (b.x < t.x + t.width &&
				                b.x + b.width > t.x){
				                // collision detected!
				                enemies.splice(j, 1);
            				}	
						}
				
						//clear bombs after animation
						if (b.animationIndex > 7){
							bombs.splice(i, 1);
						}
					}
				}
			}
				
			if(!player.isDropping && player.x >= player.dropX){
				player.isDropping = true;
			}

			if (player.isDropping || player.didLand){
				player.update(dt);
			}

			tankSpawnTimer += dt;
			if (tankSpawnTimer >= freq){
				tankSpawnTimer = 0;
				createEnemy();
			}
			//console.log(tankSpawnTimer);
			
			if(!firstRun && enemies.length > 0){
				for(var i = 0; i < bullets.length; i++){
					
					bullets[i].update(dt);
					
					if(bullets[i].position.x > canvas.width || 
						bullets[i].position.x + bullets[i].width < 0 ||
						bullets[i].position.y + bullets[i].height < 0){
						
						bullets.splice(i, 1);
					}
				}
				
				for(var i = 0; i < enemies.length; i++){
					enemies[i].update(dt);
				}
			}
				
			checkForCollisions();

			//draw background
			for(var i = 0; i < (canvas.width / skyTileImage.width); i++){
				ctx.drawImage(skyTileImage, skyTileImage.width * i, 0);
				ctx.drawImage(groundTileImage, groundTileImage.width * i, canvas.height - groundTileImage.height);
			}
			for(var i = 0; i < (HALF_WIDTH / wireTileImage.width) - 3; i++){
				ctx.drawImage(wireTileImage, wireTileImage.width * i, canvas.height - groundTileImage.height - wireTileImage.height);
			}
			for(var i = 0; i < (HALF_WIDTH / wireTileImage.width) - 3; i++){
				ctx.save();
				ctx.translate(canvas.width, 0);
				ctx.scale(-1, 1);
				ctx.drawImage(wireTileImage, wireTileImage.width * i, canvas.height - groundTileImage.height - wireTileImage.height);
				ctx.restore();
			}
			ctx.drawImage(targetImage, HALF_WIDTH - 30, canvas.height - groundTileImage.width);
			//debug: safe zone
			//ctx.fillRect(HALF_WIDTH - 30,canvas.height - 80, targetImage.width, canvas.height);
			if (firstRun){
				drawInstructions();
			}
			smokeEmitter.draw(ctx);
			
			//draw game elements
			if(!firstRun && enemies.length > 0){
				for(var i = 0; i < bullets.length; i++){
					bullets[i].draw(ctx);
				}
				
				for(var i = 0; i < enemies.length; i++){
					enemies[i].draw(ctx, enemies[i].animationIndex);
				}
			}

			for (var i = 0; i < bombs.length; i++){
				var b = bombs[i];
				if (b.isActive){
					b.draw(ctx, b.animationIndex);
				}
			}

			if (bomber.isActivated){
				bomber.draw(ctx, bomber.animationIndex);
			}

			if(plane.sendTroops){
				plane.draw(ctx, plane.animationIndex);
			}

			player.draw(ctx, player.animationIndex);
			
			//draw UI
			drawHUD();
			//debug: display dt
			//drawText("dt: " + dt.toFixed(3), 200, 450, 24, "red");
		}
	}

	//calculates how many ms have passed since last update
	function calculateDeltaTime(){
		var now, fps;
		now = (+new Date);
		fps = 1000 / (now - lastTime);
		fps = clamp(fps, 12, 60);
		lastTime = now;
		return 1/fps;
	}

	function checkForCollisions(){
		//check enemy collision
		for(var i = 0; i < bullets.length; i++){
			if(player.intersectsWithBullet(bullets[i]) && !player.didLand){
				//check for game over
				if (lives == 0){
					gameState = GAME_STATE_END;
					checkScore();
				}
				else { //update game vars
					missedSound.play();
					lives--;
					landstreak = 0;
				}

				reset();
			}
		}

		//did we hit the barbed wire?
		if ((player.x >= 0 && player.x <= HALF_WIDTH - 40) || (player.x >= HALF_WIDTH + 40 && player.x <= canvas.width)){
			if ((player.y + player.height) >= (canvas.height - groundTileImage.height - wireTileImage.height)){
				//console.log ("fence hit");
				if (firstRun){
					firstRun = false;
				}

				//check for game over
				if (lives == 0){
					gameOverSound.play();
					gameState = GAME_STATE_END;
					checkScore();
				}
				else { //update game vars
					missedSound.play();
					lives--;
					landstreak = 0;
				}

				reset();
			}
		} 
		
		//did we hit the target? (don't need to check x values if we made it this low)
		if ((player.y + player.height) >= (canvas.height - groundTileImage.height + 6)){
			//console.log("target hit");
			if (firstRun){
				firstRun = false;
			}

			//let landing animation play before updating
			if (player.didLand && player.landedTimer >= 1){
				player.didLand = false;
				player.landedTimer = 0;
				landedSound.play();

				//update game vars
				score += 100;
				landstreak++
				totalLanded++;

				//did we earn a bombing run?
				if (landstreak == 3 && !bomber.isActivated){
					bomber.isActivated = true;
					score += 500;
					resetPlayer();
					player.y = -100;
					player.x = -100;
					//will reset after bomb run is complete
				}
				else{
					reset();
				}
			}
		}
	}

	function drawText(string, x, y, size, color){
		//ctx.font = "bold " + size + "px Monospace";
		ctx.font = ctx.font = '' + size + 'px "8Bit"';
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);
	}

	function drawHUD(){
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, 20);
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		drawText("Score: " + score, 20, 10, 12, "white");

		if (lives == 0){
			drawText("Reinforcements: " + lives, 170, 10, 12, "red");
		}
		else{
			drawText("Reinforcements: " + lives, 170, 10, 12, "white");
		}

		drawText("Streak: ", 375, 10, 12, "white");
		ctx.fillStyle = "gray";
		ctx.fillRect(435, 5, 100, 10);
		if (landstreak == 3){
			ctx.fillStyle = "green";
		}
		else {
			ctx.fillStyle = "white";
		}
		ctx.fillRect(435, 5, landstreak * (100/3), 10);

		//change wind text color?
		if (windForce > 0){
			drawText("Wind: +" + windForce.toFixed(1) + " MPH", 590, 10, 12, "white");
		}
		else {
			drawText("Wind: " + windForce.toFixed(1) + " MPH", 590, 10, 12, "white");
		}

		ctx.restore();

	}

	function drawInstructions(){
		ctx.save();
		ctx.globalAlpha = 0.5;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		drawText("Land the Chuter in the target!", HALF_WIDTH, HALF_HEIGHT - 20, 16, "white")
		drawText("Use the arrow keys or WASD to move", HALF_WIDTH, HALF_HEIGHT + 20, 16, "white")
		ctx.restore();
	}

	function drawStartScreen(){
		ctx.save();
		ctx.globalAlpha = 0.75;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		drawText("Chuters", HALF_WIDTH, HALF_HEIGHT, 60, "white")
		drawText("Click to start", HALF_WIDTH, HALF_HEIGHT + 80, 30, "white")
		ctx.restore();
	}

	function drawPauseScreen(){
		ctx.save();
		ctx.globalAlpha = 0.75;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		drawText("PAUSED", HALF_WIDTH, HALF_HEIGHT, 60, "white");
		ctx.restore();

	}

	function drawGameOverScreen(){
		ctx.save();
		ctx.globalAlpha = 0.75;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		drawText("GAME OVER", HALF_WIDTH, HALF_HEIGHT - 100, 60, "white");
		drawText("Your score: " + score, HALF_WIDTH, HALF_HEIGHT - 40, 30, "white");
		if(newHigh){
			drawText("New record!", HALF_WIDTH, HALF_HEIGHT, 30, "red");
		}
		if(localScores == null || localScores.playerScore == undefined || localScores.playerScore == "undefined"){
			drawText("High score: " + 0, HALF_WIDTH, HALF_HEIGHT + 40, 30, "white");
		}
		else{
			drawText("High score: " + localScores.playerScore, HALF_WIDTH, HALF_HEIGHT + 40, 30, "white");
		}
		drawText("Click to restart", HALF_WIDTH, HALF_HEIGHT + 80, 30, "white");
		ctx.restore();
	}
	
	function checkScore(){
	
		localScores = localStorage.getItem('scores');
		
		if(localScores == "undefined" || localScores == null){
		
			var scores = {};
			scores.playerScore = score;
			
			localStorage.setItem( 'scores', JSON.stringify(scores));
			console.log( JSON.parse( localStorage.getItem( 'scores' ) ) );
		}
		else{
			localScores = JSON.parse(localScores);
			
			if(localScores.playerScore < score){
			
				newHigh = true;
				localScores.playerScore = score;
				localStorage.setItem( 'scores', JSON.stringify(localScores));
			}
		}
	}

	function stopAudio(){
		menuLoopSound.pause();
		menuLoopSound.currentTime = 0;
	}

}()) //end of IIFE