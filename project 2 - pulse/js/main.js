"use strict";

function createGame() {

	//create game
    var GAME_WIDTH = 1280;
    var GAME_HEIGHT = 720;
	var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);
    
    //game vars
    var levelData = undefined;
    var currentLevel = 0;
    var highScores = [];
    var score = 0;
    var newRecord = false;
    
    //game colors
    var blueColor = 0x009999;
    var orangeColor = 0xFFAA00;
    var redColor = 0xFF0000;
    var whiteColor = 0xFFFFFF;
    
    //font style (global)
    var textStyle = {
        "font": "30px monospace",
        "fill": "white"
    };
    
    //helper functions
    function drawBackground(color, pulseRate, opacity) {
        for (var i = 0; i < GAME_HEIGHT / 20; i++) {
            var bgd = game.add.sprite(0, i * 20, "bgd");
            bgd.animations.add('pulse', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], pulseRate, true);
            bgd.animations.play('pulse');
            bgd.tint = color;
            bgd.alpha = opacity;
        }
    }

    //************//
	//START SCREEN//
    //************//
	var StartScreen = function(game) {
        var numLevels = undefined;
    };
    
	StartScreen.prototype = {

        init: function() {
            //start physics
            this.game.physics.startSystem(Phaser.Physics.ARCADE); 
		},

        preload: function() {
            //set scaling and position
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.setScreenSize(true);

            //spritesheets
            this.game.load.spritesheet("bgd", "assets/graphics/background_animation.png", 1280, 20);
            this.game.load.spritesheet("logo", "assets/graphics/logo_animation.png", 834, 174);
            
            this.game.load.spritesheet("player", "assets/graphics/player_animation.png", 66, 51);
            this.game.load.spritesheet("enemy", "assets/graphics/enemy_animation.png", 46, 42);
            this.game.load.spritesheet("startNode", "assets/graphics/startNode_animation.png", 41, 37);
            this.game.load.spritesheet("finishNode", "assets/graphics/finishNode_animation.png", 62, 62);
            
            //sounds
            this.game.load.audio("endlessFantasy", "assets/sounds/Anamanaguchi - Endless Fantasy.mp3");
            this.game.load.audio("planet", "assets/sounds/Anamanaguchi - Planet.mp3");
            this.game.load.audio("akira", "assets/sounds/Anamanaguchi - Akira.mp3");

            //json file
            this.game.load.json("levelData", "js/levels.json");
        },

        create: function() {
            var bps = 2;
            var pulseRate = bps * 15; //every animation has 15 frames
            
            //create background
            //drawBackground(blueColor, pulseRate, 1);

            //title
            var logo = this.game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, "logo");
            logo.anchor.setTo(0.5, 0.5);
            logo.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
            logo.animations.play('pulse');
            logo.tint = blueColor;
            
            //start button
            var startbtn = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, "", "Start", this.startGame, this, 0, 0, 0, textStyle);
            
            //get scores
            this.numLevels = this.game.cache.getJSON("levelData").level.length;
            var score = undefined;
            
            for(var i = 0; i < this.numLevels; i++) {
                if(localStorage.getItem("level-" + i + "-score") == null) {

                    score = localStorage.setItem("level-" + i + "-score", 0);
                    score = localStorage.getItem("level-" + i + "-score");
                    highScores.push(score);
                }
                else {
                    score = localStorage.getItem("level-" + i + "-score");
                    highScores.push(score);
                }
            }
        },

        startGame: function() {
            this.game.state.start("LEVEL");
        }
	};
    
    //************//
	//LEVEL SCREEN//
    //************//
	var LevelScreen = function(game) {
        var logo = undefined;
        var numLevels = undefined;
        var levelButtons = undefined;
    };
    
	LevelScreen.prototype = {

        init: function() {},

        preload: function() {     
            this.levelButtons = [];
        },

        create: function() {
            console.log(highScores);
            
            var bps = 2;
            var pulseRate = bps * 15; //every animation has 15 frames
            
            //create background
            //drawBackground(blueColor, pulseRate, 1);

            //logo
            this.logo = this.game.add.sprite(GAME_WIDTH / 2, 20, "logo");
            this.logo.anchor.setTo(0.5, 0);
            this.logo.scale.x = 0.25;
            this.logo.scale.y = 0.25;
            this.logo.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
            this.logo.animations.play('pulse');
            this.logo.tint = blueColor;
            
            //title
            var title = this.game.add.text(GAME_WIDTH / 2, 200, "Level Select", textStyle);
            title.anchor.setTo(0.5, 0);
            title.scale.x = 2;
            title.scale.y = 2;
            
            //buttons (levels)
            this.numLevels = this.game.cache.getJSON("levelData").level.length;
            var xOffset = -300;
            
            for (var i = 0; i < this.numLevels; i++) { 
                var b = undefined;
                var levelName = this.game.cache.getJSON("levelData").level[i].levelName;
                var levelBPM = this.game.cache.getJSON("levelData").level[i].trackBPM; 
                
                if (!this.game.cache.getJSON("levelData").level[i].completed) {
                    b = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2, "startNode", levelName + "\nBPM: " + levelBPM, this.levelSelected, this, 0, 0, 0, textStyle);
                    b.tint = whiteColor;
                }
                else {
                    b = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2, "finishNode", levelName + "\nBPM: " + levelBPM, this.levelSelected, this, 0, 0, 0, textStyle);
                    b.tint = blueColor;
                }
                
                b.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
                b.animations.play('pulse');
                b.name = "" + i;
                
                b.x += xOffset;
                xOffset += 300;
                
                this.levelButtons.push(b);
            }
        },

        levelSelected: function(button) {
            //console.log(button.name);
            currentLevel = button.name;
            this.game.state.start("GAME");
        }
	};
    
    //***********//
    //GAME SCREEN//
    //***********//
    var GameScreen = function(game) {     
        var numSpawned = null;
        var spawnOffset = null;
        var spawnTimer = undefined;
        var waveTimer = undefined;
        var enemies = undefined;
        
        var levelTrack = undefined;
         
        var health = undefined;
        var healthText = undefined;
        var scoreText = undefined;
        var touches = undefined;
        
        var enemies = undefined;
        var numSpawned = undefined;
        var spawnOffset = undefined;
        var spawnTimer = undefined;
        var waveTimer = undefined;
         
        var currentPath = undefined;
        var pathIndex = undefined;
        var path = undefined;
        var points = undefined;
        var bmd = undefined;
        
        var graphics = undefined;
        
        //debug:
        //var hitbox1 = undefined;
        //var hitbox2 = undefined;
    };

    GameScreen.prototype = {

        init: function() {},

        preload: function() {
            //save json into a variable
            levelData = this.game.cache.getJSON("levelData").level[currentLevel];
            
            //player
            this.health = 100;
            score = 0;
            this.touches = [];
            
            //enemies
            this.numSpawned = 0;
            this.spawnOffset = 0;
            
            //path
            this.currentPath = this.game.rnd.between(0, levelData.paths.length-1);
            this.pathIndex = 0;
            this.path = [];
            this.points = levelData.paths[this.currentPath];
            this.bmd = null;
            
            this.graphics = this.game.add.graphics(0, 0);
            
            //for debug
            //console.log(levelData);
        },

        create: function() {
            //sound
            this.levelTrack = this.game.add.sound(levelData.track, 1, false);
            this.levelTrack.play(); 
            
            var bps = levelData.trackBPM / 60.0;
            var pulseRate = bps * 15; //every animation has 15 frames
            
            //background
            drawBackground(blueColor, pulseRate, .25);
            
            //create path (hard coded)
            /*
            var g = game.add.graphics();
            g.lineStyle(3, 0xFFFFFF, .75);
            g.moveTo(this.startNode.x + this.startNode.width, this.startNode.y + this.startNode.height / 2)
            g.lineTo(this.finishNode.x, this.finishNode.y + this.finishNode.height / 2);
            */
            
            //draw path
            this.bmd = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
            this.bmd.addToWorld();
            this.plot();
            
            //start node
            this.startNode = this.game.add.sprite(levelData.paths[this.currentPath].x[0], levelData.paths[this.currentPath].y[0], "startNode");
            this.startNode.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
            this.startNode.animations.play('pulse');
            this.startNode.anchor.setTo(0.5, 0.5);

            //finish node
            this.finishNode = this.game.add.sprite(GAME_WIDTH - 80, GAME_HEIGHT / 2, "finishNode");
            this.finishNode.anchor.setTo(0.5, 0.5);
            this.finishNode.animations.add('pulse', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], pulseRate, true);
            this.finishNode.animations.play('pulse');
            this.finishNode.tint = blueColor;
            this.game.physics.arcade.enable(this.finishNode);
            this.finishNode.body.setSize(this.finishNode.width - 25, this.finishNode.height - 25, 0, 0);

            //player
            this.player = this.game.add.sprite(this.startNode.width, levelData.paths[this.currentPath].y[0], "player");
            this.player.anchor.setTo(0.5, 0.5);
            this.player.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
            this.player.animations.play('pulse');
            this.player.tint = blueColor;
            this.player.anchor.set(0.5);
            this.player.position = this.path[0];
            this.game.physics.arcade.enable(this.player);
            this.player.body.setSize(this.player.width - 25, this.player.height - 25, 0, 0);
            
            //enemies
            this.enemies = this.game.add.group();
            this.waveTimer = this.game.time.events.loop(Phaser.Timer.SECOND * levelData.waveRate, this.nextWave, this);
            
            //input
            this.touches = this.game.add.group();
            this.game.inputEnabled = true;
            this.game.input.onDown.add(this.drawTouch, this);
            
            //ui
            this.healthText = this.game.add.text(20, 20, "Health: " + this.health, textStyle);
            this.healthText.anchor.setTo(0, 0);
            this.scoreText = this.game.add.text(240, 20, "Score: " + score, textStyle);
            this.scoreText.anchor.setTo(0, 0);
        },

        plot: function(){
            this.bmd.clear();
            
            var x = 1 / (this.game.width);
            var ix = 0;
            
            for (var i = 0; i <= 1; i += x) {
                var px = this.math.catmullRomInterpolation(this.points.x, i);
                var py = this.math.catmullRomInterpolation(this.points.y, i);
                
                var node = { x: px, y: py, angle: 0 };
                
                if (ix > 0) {
                    node.angle = this.game.physics.arcade.angleBetween(this.path[ix - 1], node);
                }
                
                //console.log(this.path);
                this.path.push(node);
                
                ix++;
                
                //for line
                this.bmd.rect(px, py, 2, 2, 'rgba(255, 255, 255, 0.5)');
            }
            
            //debug to show where the points are located
            /*
            for (var p = 0; p < this.points.x.length; p++)
            {   
                this.bmd.rect(this.points.x[p]-3, this.points.y[p]-3, 10, 10, 'rgba(255, 0, 0, 1)');
            }
            */
        },
        
        drawTouch: function(e, pointer) {
            //console.log("tapped");
            var c = this.touches.create(e.x, e.y, "finishNode");
            c.anchor.setTo(0.5, 0.5);
            this.game.physics.arcade.enable(c);
            c.body.setSize(c.width - 25, c.height - 25, 0, 0);
            c.scale.x *= 2;
            c.scale.y *= 2;
        },
               
        update: function(){ 
            
            //player path movement
            var target = this.path[this.pathIndex];
            
            this.game.physics.arcade.moveToObject(this.player, target, 10);
            //console.log(target);
            
            if(this.player.position.x >= target.x-1 &&
                this.player.position.y >= target.y-1) {
                this.pathIndex+= 10;
            }
            this.player.rotation = target.angle;
            //this.player.x = this.path[this.pathIndex].x;
            //this.player.y = this.path[this.pathIndex].y;
            //this.player.rotation = this.path[this.pathIndex].angle;
            //this.pathIndex++;
            
            if(this.pathIndex >= this.path.length){
                this.pathIndex = this.path.length - 1;
            }
            
            //player trail 
            //this.graphics.lineStyle(6, blueColor, 0.5);
            //this.graphics.drawRect(this.player.x, this.player.y, 1, 1)
            
            //enemy movement + trails
            this.enemies.forEach(function(e){
                this.game.physics.arcade.moveToObject(e, this.player, 75);
                //this.graphics.lineStyle(2, orangeColor, 0.5);
                //this.graphics.drawRect(e.x, e.y, 1, 1);
            }, this);
            
            //fade and remove touches
            this.touches.forEach(function(touch) {
                touch.alpha -= 0.1;
            }, this);
            
            this.touches.forEach(function(touch) {
                if (touch.alpha <= 0) {
                    touch.kill();
                }
            }, this);
            
            //collision detection
            this.game.physics.arcade.overlap(this.player, this.enemies, this.playerHit, null, this);
            this.game.physics.arcade.overlap(this.player, this.finishNode, this.playerWin, null, this);
            this.game.physics.arcade.overlap(this.enemies, this.touches, this.removeEnemy, null, this);
            
            //debug
            //this.graphics.lineStyle(2, 0xFF0000, 1);
            //this.graphics.drawRect(this.player.body.x, this.player.body.y, this.player.body.width, this.player.body.height);
        },
        
        spawnEnemy: function(){
            //console.log("enemy spawned");
            if(this.numSpawned >= levelData.numEnemies + this.spawnOffset){
                this.game.time.events.remove(this.spawnTimer);
                return;
            }
            
            //determine enemy location
            var spawnPoint = this.game.rnd.between(0, levelData.spawnPoints - 1);
            var spawnX = levelData.spawnPointCoords[spawnPoint].x;
            var spawnY = levelData.spawnPointCoords[spawnPoint].y;
            
            //create enemy
            var enemy = this.enemies.create(spawnX, spawnY, "enemy");
            enemy.anchor.setTo(0.5, 0.5);
            enemy.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], 24, true);
            enemy.animations.play('pulse'); 
            enemy.tint = orangeColor;
            this.game.physics.arcade.enable(enemy);
            enemy.body.setSize(enemy.width - 15, enemy.height - 15, 0, 0);
            //enemy.inputEnabled = true;
            //enemy.events.onInputDown.add(this.removeEnemy, this);
            
            this.numSpawned++;
        },
        
        nextWave: function() {
            //console.log(this.numSpawned);
            //console.log("next wave called");
            
            if (this.numSpawned != 0) {
                this.spawnOffset += levelData.numEnemies;
            }
            
            this.spawnTimer = this.game.time.events.loop(Phaser.Timer.SECOND * levelData.spawnRate, this.spawnEnemy, this);
        },
        
        removeEnemy: function(enemy, touch) {
            //console.log("Frame: " + enemy.frame);
            
            if (enemy.frame >= 4){
                score += 100;
            }
            else {
                score += 50;
            }
            this.scoreText.text = "Score: " + score;
            
            enemy.kill();
        },
        
        playerHit: function(player, enemy) {
            enemy.kill();
            
            score -= 100;
            if(score <= 0) {
                score = 0;
            }
            this.scoreText.text = "Score: " + score;
            
            this.health -= 20;
            this.healthText.text = "Health: " + this.health;
            
            //check for death
            if (this.health <= 0) {
                this.health = 0;
                this.healthText.text = "Health: " + this.health;
                
                this.levelTrack.stop();
                this.game.state.start("GAME_END");
            }
        },
        
        playerWin: function(player, enemy) {
            this.levelTrack.stop();
            this.game.state.start("GAME_WIN");
        }
    }

    //****************//
	//GAME OVER SCREEN//
    //****************//
    var GameOverScreen = function(game) {};

    GameOverScreen.prototype = {

        init: function() {},

        create: function(){
            var bps = 2;
            var pulseRate = bps * 15; //every animation has 15 frames
            
            //create background
            //drawBackground(blueColor, pulseRate, 1);

            //title
            var logo = this.game.add.sprite(GAME_WIDTH / 2, 20, "logo");
            logo.anchor.setTo(0.5, 0);
            logo.scale.x = 0.25;
            logo.scale.y = 0.25;
            logo.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
            logo.animations.play('pulse');
            logo.tint = blueColor;

            //title
            var title = this.game.add.text(GAME_WIDTH / 2, 200, "Game Over", textStyle);
            title.anchor.setTo(0.5, 0);
            title.scale.x = 2;
            title.scale.y = 2;
            
            //buttons
            var levelSelectButton = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, "", "Level Select", this.levelSelect, this, 1, 0, 2, textStyle);
            levelSelectButton.anchor.setTo(0.5, 0.5);
            var retryButton = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2, "", "Retry", this.retryLevel, this, 1, 0, 2, textStyle);
            retryButton.anchor.setTo(0.5, 0.5);
        },
        
        levelSelect: function() {
            this.game.state.start("LEVEL");
        },
        
        retryLevel: function() {
            this.game.state.start("GAME");
        }
    };
    
    //***************//
	//GAME WIN SCREEN//
    //***************//
    var GameWinScreen = function(game) {};

    GameWinScreen.prototype = {

        init: function() {
            levelData.completed = true;
        },
        
        preload: function() {   
            if (score > highScores[currentLevel]) {
                localStorage.setItem("level-" + currentLevel + "-score", score);
                newRecord = true;
            }
            else {
                newRecord = false;
            }
        },

        create: function(){
            var bps = 2;
            var pulseRate = bps * 15; //every animation has 15 frames
            
            //create background
            //drawBackground(blueColor, pulseRate, 1);

            //title
            var logo = this.game.add.sprite(GAME_WIDTH / 2, 20, "logo");
            logo.anchor.setTo(0.5, 0);
            logo.scale.x = 0.25;
            logo.scale.y = 0.25;
            logo.animations.add('pulse', [0,1,2,3,4,5,6,7,6,5,4,3,2,1,0], pulseRate, true);
            logo.animations.play('pulse');
            logo.tint = blueColor;

            //title
            var title = this.game.add.text(GAME_WIDTH / 2, 200, "Level Complete", textStyle);
            title.anchor.setTo(0.5, 0);
            title.scale.x = 2;
            title.scale.y = 2;
            
            //display score
            var scoreText = this.game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, "Score: " + score, textStyle);
            scoreText.anchor.setTo(0.5, 0.5);
            
            if (newRecord) {
                var recordText = this.game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "New Record!", textStyle);
                recordText.anchor.setTo(0.5, 0.5);
            }
            else {
                var recordText = this.game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Best Score: " + levelData.highScore, textStyle);
                recordText.anchor.setTo(0.5, 0.5);
            }
            
            //buttons
            if(currentLevel != this.game.cache.getJSON("levelData").level.length-1) {
                var contButton = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, "", "Continue", this.nextLevel, this, 1, 0, 2, textStyle);
                contButton.anchor.setTo(0.5, 0.5);
            }
            var levelSelectButton = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, "", "Level Select", this.levelSelect, this, 1, 0, 2, textStyle);
            levelSelectButton.anchor.setTo(0.5, 0.5);
            var retryButton = new LabelButton(this.game, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, "", "Retry", this.retryLevel, this, 1, 0, 2, textStyle);
            retryButton.anchor.setTo(0.5, 0.5);
        },

        nextLevel: function() {
            currentLevel++;
            this.game.state.start("GAME");
        },
        
        levelSelect: function() {
            this.game.state.start("LEVEL");
        },
        
        retryLevel: function() {
            this.game.state.start("GAME");
        }
    };
    
	//gamestates
	game.state.add("START", StartScreen);
    game.state.add("LEVEL", LevelScreen);
	game.state.add("GAME", GameScreen);
    game.state.add("GAME_END", GameOverScreen);
    game.state.add("GAME_WIN", GameWinScreen);
    
	game.state.start("START");
}
