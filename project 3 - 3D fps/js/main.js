"use strict"

document.onload = setup;

//Variables
var scene;
var camera;
var renderer;

function setup(){

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render and set the size
    renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;  
}

function createMaterials(){
    
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
	renderer.render(scene, camera);
}

//functions to do things