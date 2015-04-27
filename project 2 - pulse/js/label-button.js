"use strict"

var LabelButton = function(game, x, y, imageKey, label, callback, callbackContext, overFrame, downFrame, upFrame, style){

    Phaser.Button.call(this, game, x, y, imageKey, callback, callbackContext, overFrame, downFrame, upFrame);
    
    this.style = style;
    
    this.anchor.setTo(0.5, 0.5);
    this.label = new Phaser.Text(game, 0, 0, label, this.style);
    
    //puts the label in the center of the button
    this.label.anchor.setTo(0.5, 0.5);
    this.label.y += 80;
    this.addChild(this.label);
    this.setLabel(label);
    
    //adds button to game
    game.add.existing(this);
};

LabelButton.prototype = Object.create(Phaser.Button.prototype);
LabelButton.prototype.constructor = LabelButton;

LabelButton.prototype.setLabel = function(label) {
  
    this.label.setText(label);
};