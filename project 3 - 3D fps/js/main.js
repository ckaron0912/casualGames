"use strict"

document.onload = setup;

//Variables
var scene;
var camera;
var renderer;

//Constant Objects
var GAME = Object.freeze({
    width: 640,
    height: 360,
    fieldWidth: 400,
    fieldHeight: 200
});
var MATERIAL = Object.seal({
    wallMaterial: undefined,
    groundMaterial: undefined,
    bulletMaterial: undefined
});

function setup(){

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, GAME.width / GAME.height, 0.1, 1000);

    // create a render and set the size
    renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    
    createCamera();
    createMaterials();
    createGeometry();
    createModels();
    createLights();
}

function createMaterials(){
    
    MATERIAL.groundMaterial = 
        new THREE.MeshLambertMaterial({color: 0x4BD121});
}

function createGeometry(){
    
}

function createCamera(){
    
}

function createModels(){
    
}

function createLights(){
    
}

function update(){
    
    requestAnimationFrame(update);
    
    //draw
	renderer.render(scene, camera);
    
    //update physics
}

//functions to do things