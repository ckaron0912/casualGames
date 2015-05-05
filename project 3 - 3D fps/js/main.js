"use strict"

window.onload = function() {
    
//Constant Objects (not used yet)
/*
var GAME = Object.freeze({
    width: 640,
    height: 360,
    fieldWidth: 400,
    fieldHeight: 200
});
var MATERIAL = Object.seal({
    groundMaterial: undefined,
    wallMaterial: undefined,
    bulletMaterial: undefined
});
*/

//Variables
var scene;
var camera;
var renderer;
var raycaster;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

var geometry;
var material;
var mesh;

var walls = [];
var bullets = [];

var controls;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = true;

//HTML elements
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

//Set up pointerLock
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
setupPointerLock();

//Start game
init();
render();

//Core functions
function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 750);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    
    setupLights();
    setupFloor();
    setupWalls();
    setupControls();
    setupRenderer();

    window.addEventListener('resize', onWindowResize, false);
}
    
function render() {
    requestAnimationFrame(render);

    processControls();

    renderer.render(scene, camera);
}

//Helper functions
function setupPointerLock() {
    console.log('Hello');
    
    if (havePointerLock) {
        //hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

        document.addEventListener('pointerlockerror', pointerLockError, false);
        document.addEventListener('mozpointerlockerror', pointerLockError, false);
        document.addEventListener('webkitpointerlockerror', pointerLockError, false);
        
        //hook click
        instructions.addEventListener('click', onInstructionsClick, false);
    }
    else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }
}

function setupLights() {
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0.5, 1, 0.5);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    
    var spotLight = new THREE.SpotLight(0xff0000);
    spotLight.position.set(0, 100, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
}

function setupFloor() {
    geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    material = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function setupWalls() {
    geometry = new THREE.BoxGeometry(20, 20, 20);
    
    for (var i = 0; i < 100; i++) {
        material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, specular: 0xffffff, shading: THREE.FlatShading });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.floor(Math.random() * 20 - 10) * 20;
        mesh.position.y += 10;
        mesh.position.z = Math.floor(Math.random() * 20 - 10) * 20;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        walls.push(mesh);
    }
}
    
function setupControls() {
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
}
    
function setupRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
    
function processControls() {
     if (controlsEnabled) {
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(walls);

        var isOnObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if (moveForward) velocity.z -= 400.0 * delta;
        if (moveBackward) velocity.z += 400.0 * delta;

        if (moveLeft) velocity.x -= 400.0 * delta;
        if (moveRight) velocity.x += 400.0 * delta;

        if (isOnObject === true) {
            velocity.y = Math.max( 0, velocity.y );
            canJump = true;
        }

        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );

        if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;
        }
        
        prevTime = time;
    }
}
    
//Event listeners
function pointerLockChange(event) {
    var element = document.body;
    
    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        controlsEnabled = true;
        controls.enabled = true;

        blocker.style.display = 'none';
    } 
    else {
        controls.enabled = false;

        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';

        instructions.style.display = '';
    }
}
    
function pointerLockError(event) {
    instructions.style.display = '';
}

function onInstructionsClick(event) {
    instructions.style.display = 'none';

    //Ask the browser to lock the pointer
    var element = document.body;
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if (/Firefox/i.test(navigator.userAgent)) {
        document.addEventListener('fullscreenchange', fullscreenChange, false);
        document.addEventListener('mozfullscreenchange', fullscreenChange, false);

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
        element.requestFullscreen();
    } 
    else {
        element.requestPointerLock();
    }
}
    
function onKeyDown(event){
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true; break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;

        case 32: // space
            if (canJump === true) velocity.y += 350;
            canJump = false;
            break;
    }
}

function onKeyUp(event) {
    switch(event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;
    }
}

function fullscreenChange(event) {
    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
        document.removeEventListener('fullscreenchange', fullscreenChange);
        document.removeEventListener('mozfullscreenchange', fullscreenChange);
        element.requestPointerLock();
    }
}
    
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
    
};//End onload function