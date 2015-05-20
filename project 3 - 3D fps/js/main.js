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
    var geometry;
    var material;
    var targetMaterial;
    var mesh;
    var characterMesh;
    var spotLight;
    var bulletLight;

    var firstPerson = false;
    var thirdPerson = true;
    var x = -0.2;
    var y = 0.4;
    var z = 1;
    var keyboard;
    var world;
    var solver;
    var vector;
    var physicsMaterial;
    var sphereShape;
    var sphereBody;
    var bulletShape;
    var bulletGeometry;
    var shootDirection;
    var shootVelocity = 50;
    var bulletRadius = 0.1;
    var walls = [];
    var bullets = [];
    var bulletMeshes = [];
    var boxes = [];
    var boxMeshes = [];
    var course1Targets = [];
    var course1TargetMeshes = [];

    //for gamepads
    var gamepad;
    var triggerPressed;
    var fireRate = .1;
    var fireTimer = new Date().getTime()/1000;
    var controls = Date.now; 
    var time = Date.now;

    //sounds
    var soundFilePath = "media/sounds/";
    var repulsorSound = soundFilePath + "repulsor.mp3";
    var themeMusic = soundFilePath + "themeSong.mp3";
    var soundClips = ["breach.mp3", "caught.mp3", "fly.mp3", "galaga.mp3", "myturn.mp3", "party.mp3"];
    var isPlayingSoundClip = false;
    
    //HTML elements
    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    //Set up pointerLock
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    setupPointerLock();

    //Start game
    initCannon();
    initScene();
    render();

    //Core functions
    function initCannon() {
        //set up physics world
        world = new CANNON.World();
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;
        world.defaultContactMaterial.contactEquationStiffness = 1e9;
        world.defaultContactMaterial.contactEquationRelaxation = 4;

        var solver = new CANNON.GSSolver();
        solver.iterations = 10;
        solver.tolerance = 0.1;

        var split = true;
        if(split)
            world.solver = new CANNON.SplitSolver(solver);
        else
            world.solver = solver;

        world.gravity.set(0, -50, 0);
        world.broadphase = new CANNON.NaiveBroadphase();

        //create physics material
        physicsMaterial = new CANNON.Material("groundMaterial");
        var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                                physicsMaterial,
                                                                {friction: 0.4, // friction coefficient
                                                                restitution: 0.3,  // restitution
                                                                contactEquationStiffness: 1e8,
                                                                contactEquationRelaxation: 3,
                                                                frictionEquationStiffness: 1e8,
                                                                frictionEquationRegularizationTime: 3}
                                                                );
        world.addContactMaterial(physicsContactMaterial);

        //create player sphere
        var mass = 5;
        var radius = 1.3;
        sphereShape = new CANNON.Sphere(radius);
        sphereBody = new CANNON.Body({ mass: mass });
        sphereBody.addShape(sphereShape);
        sphereBody.position.set(0, 5, 0);
        sphereBody.linearDamping = 0.9;
        world.addBody(sphereBody);

        // Create a plane
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        world.addBody(groundBody);
    }

    function initScene() {
        
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 0, 750);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        keyboard = new KeyboardState();

        setupLights();
        setupFloor();
        setupWalls();
        setupControls();
        setupRenderer();
        setupModels();
        loadObstacleCourse();

        window.addEventListener('resize', onWindowResize, false);
        
        var backgroundMusic = new Audio(themeMusic);
        backgroundMusic.volume = 0.25
        backgroundMusic.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
            console.log("looped!")
        })
        backgroundMusic.play();
    }

    function render() {

        requestAnimationFrame(render);

        if (controls.enabled) {
            var dt = 1 / 60;
            world.step(dt);

            //update bullet positions
            for(var i = 0; i < bullets.length; i++){
                bulletMeshes[i].position.copy(bullets[i].position);
                bulletMeshes[i].quaternion.copy(bullets[i].quaternion);
            }

            //update box positions
            for(var i = 0; i < boxes.length; i++){
                boxMeshes[i].position.copy(boxes[i].position);
                boxMeshes[i].quaternion.copy(boxes[i].quaternion);
            }
            
            //update box positions
            for(var i = 0; i < course1Targets.length; i++){
                
                course1TargetMeshes[i].position.copy(course1Targets[i].position);
                course1TargetMeshes[i].quaternion.copy(course1Targets[i].quaternion);
            }
            
            gamepadFireControl();
        }

        controls.update(Date.now() - time);

        renderer.render(scene, camera);

        time = Date.now();

        keyboardControls();
        
        //light bullets
        if (bullets.length > 0) {
            spotLight.position.set(bullets[bullets.length - 1].position.x,  bullets[bullets.length - 1].position.y, bullets[bullets.length - 1].position.z); 
        }
        
        if (!isPlayingSoundClip) {
            var rand = Math.random();
            
            if (rand < 0.001) {
                isPlayingSoundClip = true;
                var clipIndex = getRandomInt(0, soundClips.length - 1);
                var clipPath = soundFilePath + soundClips[clipIndex];
                var soundClip = new Audio(clipPath);
                soundClip.addEventListener('ended', function() {
                    isPlayingSoundClip = false;
                })
                soundClip.play()
            }
        }
    }
    
    function gamepadFireControl(){
      0
        //gamepad
        gamepad = navigator.getGamepads();
        var localTime = new Date().getTime()/1000;

        if(gamepad[0] != undefined){

            gamepad = navigator.getGamepads()[0];
            triggerPressed = gamepad.buttons[7].pressed;
        }
        else gamepad = undefined;
        
        if(gamepad != undefined){
            
            if(triggerPressed && localTime - fireTimer >= fireRate){

                fireTimer = new Date().getTime()/1000;

                onFire();
            }
        }
    }

    //Helper functions
    function setupPointerLock() {
        
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
        var light = new THREE.DirectionalLight(0xffffff, 0.75);
        light.position.set(0.5, 1, 0.5);
        light.target.position.set(0, 0, 0);
        light.angle = 0.15
        scene.add(light);

        spotLight = new THREE.SpotLight(0x00ffff);
        spotLight.position.set(0, -1, 0);
        spotLight.castShadow = true;
        spotLight.distance = 50;
        scene.add(spotLight);
    }

    function setupControls() {
        controls = new PointerLockControls(camera, sphereBody);
        scene.add(controls.getObject());
        window.addEventListener('click', onFire, false);
    }

    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        document.body.appendChild(renderer.domElement);
    }

    function setupModels() {
        var loader = new THREE.OBJMTLLoader();
        loader.load('models/testExport.obj', 'models/testExport.mtl', function (loadedMesh) {
            var material = new THREE.MeshPhongMaterial({map:THREE.ImageUtils.loadTexture( "textures/texture.jpg" )});
            // loadedMesh is a group of meshes. For
            // each mesh set the material, and compute the information
            // three.js needs for rendering.
            loadedMesh.children.forEach(function (child) {
                child.material = material;
                child.geometry.computeFaceNormals();
                child.geometry.computeVertexNormals();
            });

            characterMesh = loadedMesh;
            characterMesh.scale.set(0.5, 0.5, 0.5);
            characterMesh.position.x = -1;
            characterMesh.position.y = -1.2;
            characterMesh.position.z = -1;
            characterMesh.rotation.y = 3.1;
            //loadedMesh.rotation.x = -0.2;
            //characterMesh.name = 'player';
            scene.add(characterMesh);
            camera.add(characterMesh);
            //characterMesh.addChild(spotLight)
        });
    }

    function keyboardControls() {
        keyboard.update();

        if(keyboard.down("F") && firstPerson == false){
            firstPerson = true;
            thirdPerson = false;
            characterMesh.position.x = 0;
            characterMesh.position.y = -1.6;
            characterMesh.position.z = 0.15;
            x = 0.25;
            y = 0.3;
            z = 0;
        }else if(keyboard.down("F") && firstPerson == true){
            firstPerson = false;
            thirdPerson = true;
            characterMesh.position.x = -1;
            characterMesh.position.y = -1.2;
            characterMesh.position.z = -1;
            x = -0.2;
            y = 0.4;
            z = 1;
        }
        
        if(keyboard.up("R")){
         
            placeMoreTargets();
        }
        
        if(keyboard.up("L")){
            
            cleanUp();
        }
    }
    
    function cleanUp(){
        
        for(var i = 0; i < course1Targets.length; i++){
         
            world.remove(course1Targets[i]);
            scene.remove(course1TargetMeshes[i]);
        }
        
        course1TargetMeshes = [];
        course1Targets = [];
        
        placeMoreTargets();
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
        
        var halfExtents = new CANNON.Vec3(1, 1, 1);
        var boxShape = new CANNON.Box(halfExtents);
        var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);

       for(var i = 0; i < 20; i++) {
           var x = (Math.random() - 0.5) * 20;
           var y = 2;
           var z = (Math.random()  -0.5) * 20
           var boxBody = new CANNON.Body({ mass: 1 });
           boxBody.addShape(boxShape);
           boxBody.position.set(x, y, z);
           world.addBody(boxBody)
           var boxMesh = new THREE.Mesh(boxGeometry, material);
           boxMesh.position.set(x, y, z);
           boxMesh.castShadow = true;
           boxMesh.receiveShadow = true;
           scene.add(boxMesh)
           boxes.push(boxBody);
           boxMeshes.push(boxMesh);
       }
    }
    
    function loadObstacleCourse(){
     
        var mass = 100000;
        var halfExtents;
        var boxShape;
        var boxBody;
        var boxGeometry;
        var boxMesh;
        var nextLength = 0;
        var cylinderShape;
        var cylinderBody;
        var cylinderMesh;
        var cylinderGeometry;
        
        for(var i = 0; i < 20; i++){
            
            halfExtents = new CANNON.Vec3(2, 0.075 * i, 0.5);
            boxShape = new CANNON.Box(halfExtents);
            boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            boxBody = new CANNON.Body({mass: mass});
            boxBody.addShape(boxShape);
            boxBody.position.set(0, 0.5 + (i*0.15), -15 - i);
            world.addBody(boxBody);

            boxMesh = new THREE.Mesh(boxGeometry, material);
            boxMesh.position.set(0, 0.5 + (i*0.15), -15 - i);
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            boxes.push(boxBody);
            boxMeshes.push(boxMesh);
            nextLength++;
        }
        
        nextLength = nextLength + 5;
        halfExtents = new CANNON.Vec3(2, 2, 5);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(0, 0.5 + (nextLength*0.15), -20 - nextLength);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(0, 0.5 + (nextLength*0.15), -20 - nextLength);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        //stands for targets right
        for(var i = 0; i < 4; i++){
            
            halfExtents = new CANNON.Vec3(0.5, 3, 1);
            boxShape = new CANNON.Box(halfExtents);
            boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            boxBody = new CANNON.Body({mass: mass});
            boxBody.addShape(boxShape);
            boxBody.position.set(7, .5 + (nextLength*0.15), -40 -  (i*3));
            world.addBody(boxBody);

            boxMesh = new THREE.Mesh(boxGeometry, material);
            boxMesh.position.set(7, .5 + (nextLength*0.15), -40 - (i*3));
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            boxes.push(boxBody);
            boxMeshes.push(boxMesh);
        }
        
        //stands for targets left
        for(var i = 0; i < 4; i++){
            
            halfExtents = new CANNON.Vec3(0.5, 3, 1);
            boxShape = new CANNON.Box(halfExtents);
            boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            boxBody = new CANNON.Body({mass: mass});
            boxBody.addShape(boxShape);
            boxBody.position.set(-7, .5 + (nextLength*0.15), -40 -  (i*3));
            world.addBody(boxBody);

            boxMesh = new THREE.Mesh(boxGeometry, material);
            boxMesh.position.set(-7, .5 + (nextLength*0.15), -40 - (i*3));
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            boxes.push(boxBody);
            boxMeshes.push(boxMesh);
        }
        
        targetMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
        
        //targets on right
        for(var i = 0; i < 4; i++){
            
            halfExtents = new CANNON.Vec3(0.25, 0.5, 0.5);
            boxShape = new CANNON.Box(halfExtents);
            boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            boxBody = new CANNON.Body({mass: 5});
            boxBody.addShape(boxShape);
            boxBody.position.set(7, 5.5 + (nextLength*0.15), -40 -  (i*3));
            world.addBody(boxBody);

            boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
            boxMesh.position.set(7, 5.5 + (nextLength*0.15), -40 - (i*3));
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            course1Targets.push(boxBody);
            course1TargetMeshes.push(boxMesh);
        }
        
        //targets on left
        for(var i = 0; i < 4; i++){
            
            halfExtents = new CANNON.Vec3(0.25, 0.5, 0.5);
            boxShape = new CANNON.Box(halfExtents);
            boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            boxBody = new CANNON.Body({mass: 5});
            boxBody.addShape(boxShape);
            boxBody.position.set(-7, 5.5 + (nextLength*0.15), -40 -  (i*3));
            world.addBody(boxBody);

            boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
            boxMesh.position.set(-7, 5.5 + (nextLength*0.15), -40 - (i*3));
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            course1Targets.push(boxBody);
            course1TargetMeshes.push(boxMesh);
        }
        
        //second course
        
        //walls
        //right
        halfExtents = new CANNON.Vec3( 6, .5, .2);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(20, 0.5 + (0.15), 4.8);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(20, 0.5 + (0.15), 4.8);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        //left
        halfExtents = new CANNON.Vec3( 6, .5, .2);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(20, 0.5 + (0.15), -4.8);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(20, 0.5 + (0.15), -4.8);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        //back
        halfExtents = new CANNON.Vec3( .2, .5, 4.6);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(25.5, 0.5 + (0.15), 0);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(25.5, 0.5 + (0.15), 0);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        //backstands
        halfExtents = new CANNON.Vec3( .5, .6, .5);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(40, 0.5 + (0.15), 3);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(40, 0.5 + (0.15), 3);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        halfExtents = new CANNON.Vec3( .5, .6, .5);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(45, 0.5 + (0.15), -3);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(45, 0.5 + (0.15), -3);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        halfExtents = new CANNON.Vec3( .5, 1.5, .5);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(47, 0.5 + (0.15), -2);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(47, 0.5 + (0.15), -2);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        halfExtents = new CANNON.Vec3( .5, .9, .5);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: mass});
        boxBody.addShape(boxShape);
        boxBody.position.set(49, 0.5 + (0.15), 1);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, material);
        boxMesh.position.set(49, 0.5 + (0.15), 1);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        //backstand targets
        halfExtents = new CANNON.Vec3( 0.15, 0.3, 0.3);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: 5});
        boxBody.addShape(boxShape);
        boxBody.position.set(40, 1 + (0.15), 3);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
        boxMesh.position.set(40, 1 + (0.15), 3);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        halfExtents = new CANNON.Vec3( 0.15, 0.3, 0.3);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: 5});
        boxBody.addShape(boxShape);
        boxBody.position.set(45, 1 + (0.15), -3);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
        boxMesh.position.set(45, 1 + (0.15), -3);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        halfExtents = new CANNON.Vec3( 0.15, 0.3, 0.3);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: 5});
        boxBody.addShape(boxShape);
        boxBody.position.set(47, 1.7 + (0.15), -2);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
        boxMesh.position.set(47, 1.7 + (0.15), -2);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
        
        halfExtents = new CANNON.Vec3( 0.15, 0.3, 0.3);
        boxShape = new CANNON.Box(halfExtents);
        boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        boxBody = new CANNON.Body({mass: 5});
        boxBody.addShape(boxShape);
        boxBody.position.set(49, 1.2 + (0.15), 1);
        world.addBody(boxBody);

        boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
        boxMesh.position.set(49, 1.2 + (0.15), 1);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        scene.add(boxMesh);

        boxes.push(boxBody);
        boxMeshes.push(boxMesh);
    }
    
    function placeMoreTargets(){
        
        var nextLength = 25;
     
        //targets on right
        for(var i = 0; i < 4; i++){
            
            var halfExtents = new CANNON.Vec3(0.25, 0.5, 0.5);
            var boxShape = new CANNON.Box(halfExtents);
            var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            var boxBody = new CANNON.Body({mass: 5});
            boxBody.addShape(boxShape);
            boxBody.position.set(7, 5.5 + (nextLength*0.15), -40 -  (i*3));
            world.addBody(boxBody);

            var boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
            boxMesh.position.set(7, 5.5 + (nextLength*0.15), -40 - (i*3));
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            course1Targets.push(boxBody);
            course1TargetMeshes.push(boxMesh);
        }
        
        //targets on left
        for(var i = 0; i < 4; i++){
            
            var halfExtents = new CANNON.Vec3(0.25, 0.5, 0.5);
            var boxShape = new CANNON.Box(halfExtents);
            var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            var boxBody = new CANNON.Body({mass: 5});
            boxBody.addShape(boxShape);
            boxBody.position.set(-7, 5.5 + (nextLength*0.15), -40 -  (i*3));
            world.addBody(boxBody);

            var boxMesh = new THREE.Mesh(boxGeometry, targetMaterial);
            boxMesh.position.set(-7, 5.5 + (nextLength*0.15), -40 - (i*3));
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            course1Targets.push(boxBody);
            course1TargetMeshes.push(boxMesh);
        }   
    }

    function setupControls() {
        controls = new PointerLockControls(camera, sphereBody);
        scene.add(controls.getObject());
        window.addEventListener('click', onFire, false);
    }

    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        document.body.appendChild(renderer.domElement);
    }

    function getShootDirection(targetVector) {
        var vector = targetVector;
        targetVector.set(x, y, z);
        vector.unproject(camera);
        var ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize());
        targetVector.copy(ray.direction);
    }
        
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //Event listeners
    function pointerLockChange(event) {
        console.log(event);

        var element = document.body;

        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
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

    function onFire(event) {
        if (controls.enabled) {
            var repulsorSoundEffect = new Audio(repulsorSound);
            repulsorSoundEffect.play();
            
            //create bullet
            bulletShape = new CANNON.Sphere(bulletRadius);
            bulletGeometry = new THREE.SphereGeometry(bulletRadius, 32, 32);
            material = new THREE.MeshLambertMaterial({ color: 0x7df9ff });
            shootDirection = new THREE.Vector3();

            //get initial position
            var x = sphereBody.position.x;
            var y = sphereBody.position.y;
            var z = sphereBody.position.z;

            //add body
            var bulletBody = new CANNON.Body({ mass: 100 });
            bulletBody.addShape(bulletShape);
            world.addBody(bulletBody);
            bullets.push(bulletBody);

            //add mesh
            var bulletMesh = new THREE.Mesh(bulletGeometry, material);
            bulletMesh.castShadow = true;
            bulletMesh.receiveShadow = true;
            scene.add(bulletMesh);
            bulletMeshes.push(bulletMesh);

            //set velocity
            getShootDirection(shootDirection);
            bulletBody.velocity.set(  shootDirection.x * shootVelocity,
                                    shootDirection.y * shootVelocity,
                                    shootDirection.z * shootVelocity);

            //move the ball outside the player sphere
            x += shootDirection.x * (sphereShape.radius * 1.02 + bulletShape.radius);
            y += shootDirection.y * (sphereShape.radius * 1.02 + bulletShape.radius);
            z += shootDirection.z * (sphereShape.radius * 1.02 + bulletShape.radius);
            bulletBody.position.set(x, y, z);
            bulletMesh.position.set(x, y, z);
            
            //attach light
            spotLight.position.set(bulletMesh.position.x, bulletMesh.position.y, bulletMesh.position.z);
            spotLight.target = bulletMesh;
            
            //console.log(bullets[0]);
        }
        
        //if there are more bullets than the limit, remove the oldest bullet
        if(bullets.length > 50){
         
            world.remove(bullets[0]);
            scene.remove(bulletMeshes[0]);
            bullets.splice(0, 1);
            bulletMeshes.splice(0, 1);
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