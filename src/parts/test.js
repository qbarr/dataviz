import * as THREE from 'three';
import * as dat from 'dat.gui';
import Magnify3d from 'magnify-3d-new';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// FPS monitor
javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

let camera, scene, renderer, defaultTarget, boxMesh1, boxMesh2,boxMesh4,lights;
let magnify3d, params, gui,loader,model,sphereMesh,materialTexture;
let shiftDown, ctrlDown;
let isGood = true
const MIN_ZOOM = 1;
const MAX_ZOOM = 15;
const MIN_EXP = 1;
const MAX_EXP = 100;
const MIN_RADIUS = 10;
const MAX_RADIUS = 500;
const MIN_OUTLINE_THICKNESS = 0;
const MAX_OUTLINE_THICKNESS = 50;

function initScene() {
    scene = new THREE.Scene();
    loader.load(

        './molecule2.gltf',
        // called when the resource is loadedx
        function ( gltf ) {
             gltf.scene.traverse( function ( child )  {
                if ( child.isMesh ) {
                    child.geometry.center(); // center here
                  /*   const texture1 = textureLoader.load('./texture.png',function(texture) {

                        let newMaterial =  new THREE.MeshStandardMaterial( {
                            map: texture
                        } );
                        child.material = newMaterial;

                    }) */
                }
            });
            gltf.scene.scale.set(3,3,3) // scale here
            gltf.scene.position.set(0,2,130)
            scene.add( gltf.scene );
            model = gltf.scene
        }
    );
    const textureLoader = new THREE.TextureLoader()
  
    const normalMaterial = new THREE.MeshNormalMaterial();
    const physicalmaterial = new THREE.MeshPhysicalMaterial({
        color:new THREE.Color(0x49ef4),
        roughness:1,
        metalness:0

    });
    lights = {
        light1:new THREE.PointLight( 0xffffff,1,100),  // soft white light
        light2:new THREE.PointLight(0xffffff,1,100),
        light3:new THREE.PointLight(0xffffff,1,100),
        light4:new THREE.PointLight(0xffffff,1,100),
        light4:new THREE.AmbientLight(0xffffff),
    }
     lights.light1.position.set(0,0,130)
    lights.light1.intensity =2

    lights.light2.position.set(50,0,130)
    lights.light2.intensity =2

    lights.light3.position.set(50,100,130)
    lights.light3.intensity =2 

    lights.light4.position.set(50,150,130)
    lights.light4.intensity =1
    const PointLightHelper = new THREE.PointLightHelper(lights.light1,0.2)
    PointLightHelper.scale.set(10,10,10)
    scene.add(lights.light1)
    scene.add(lights.light2)
    scene.add(lights.light3)
    scene.add(lights.light4)
    scene.add(PointLightHelper)


    
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20);
  /*  boxMesh1 = new THREE.Mesh(boxGeometry, checkerMaterial);
    boxMesh1.position.x = 50;
    scene.add(boxMesh1);

    boxMesh2 = new THREE.Mesh(boxGeometry, checkerMaterial);
    boxMesh2.position.x = -50;
    scene.add(boxMesh2);
 */
  /*   const boxMesh3 = new THREE.Mesh(boxGeometry, normalMaterial);
    boxMesh3.position.x = 100;
    scene.add(boxMesh3);

    boxMesh4 = new THREE.Mesh(boxGeometry, normalMaterial);
    boxMesh4.position.x = -100;
    scene.add(boxMesh4); */

    const PlaneGeometry = new THREE.PlaneGeometry( 300, 300 );
    const material = new THREE.MeshStandardMaterial( {color: 0x000fff,metalness:1} );

    const planeMesh = new THREE.Mesh(PlaneGeometry, material);
    planeMesh.rotation.x = 200
    scene.add(planeMesh)
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.set(0.0, 40.0, 250.0);
    camera.lookAt(0.0, 0.0, 0.0);
}

function initRenderer() {
    const pixelRatio = window.devicePixelRatio;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

    renderer.setPixelRatio( pixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.createElement('div');
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);

    defaultTarget = new THREE.WebGLRenderTarget(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio); 
    

}

function initEventListeners() {
    document.addEventListener('mousemove', (e) => {
        params.mouse = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
        params.mouse = new THREE.Vector2(e.pageX, window.innerHeight - e.pageY);
        e.preventDefault();
        e.stopPropagation();
    });

    window.addEventListener('resize', (e) => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.clientWidth = window.innerWidth;
        camera.clientHeight = window.innerHeight;
        camera.updateProjectionMatrix();
        
    });

    function onMouseWheel(e) {
        e.preventDefault();
        const delta = (e.wheelDelta && e.wheelDelta / 40) || -e.detail;

        if (shiftDown) {
            params.zoom = Math.min(Math.max(MIN_ZOOM, params.zoom + (delta / 10)), MAX_ZOOM);
        } else if (ctrlDown) {
            params.exp = Math.min(Math.max(MIN_EXP, params.exp + delta), MAX_EXP);
        } else {
            params.radius = Math.min(Math.max(MIN_RADIUS, params.radius + delta), MAX_RADIUS);
        }

        gui.updateDisplay();
    }

    window.addEventListener( 'mousewheel',     onMouseWheel );
    window.addEventListener( 'DOMMouseScroll', onMouseWheel ); // firefox

    document.addEventListener('keydown', (e) => {
        const key = e.keyCode;
        switch (key) {
            case 16:
                shiftDown = true;
                break;
            case 17:
                ctrlDown = true;
                break;    
            default:
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.keyCode;
        switch (key) {
            case 16:
                shiftDown = false;
                break;
            case 17:
                ctrlDown = false;
                break;    
            default:
                break;
        }
    });
}

function initGUI() {
    params = {
        zoom: 1.0,
        exp: 30.0,
        radius: 500.0,
        outlineThickness: 4.0,
        outlineColor: 0x555555
    }

    console.log(lights);

    gui = new dat.GUI();
    const lightFolder = gui.addFolder('light')
    lightFolder.add(lights.light1,'intensity',0,100)
    lightFolder.add(lights.light1.rotation,'x',0,100)
    lightFolder.add(lights.light1.rotation,'y',0,100)
    lightFolder.add(lights.light1.rotation,'z',0,100)
    lightFolder.add(lights.light1.position,'x',0,100)
    lightFolder.add(lights.light1.position,'y',0,100)
    lightFolder.add(lights.light1.position,'z',0,100)
    lightFolder.add(lights.light1.scale,'x',0,100)
    lightFolder.add(lights.light1.scale,'y',0,100)
    lightFolder.add(lights.light1.scale,'z',0,100)

    setTimeout(()=> {
        const moleculeFolder =  gui.addFolder('molecule')
        moleculeFolder.add(model.position,'x',0,100)
        moleculeFolder.add(model.position,'y',0,100)
        moleculeFolder.add(model.position,'z',0,100)
        moleculeFolder.add(model.rotation,'x',0,100)
        moleculeFolder.add(model.rotation,'y',0,100)
        moleculeFolder.add(model.rotation,'z',0,100)
        moleculeFolder.add(model.scale,'x',0,100)
        moleculeFolder.add(model.scale,'y',0,100)
        moleculeFolder.add(model.scale,'z',0,100)
    },2000)
  

    gui.add(params, 'radius', MIN_RADIUS, MAX_RADIUS);
    gui.add(params, 'zoom', MIN_ZOOM, MAX_ZOOM);
    gui.add(params, 'exp', MIN_EXP, MAX_EXP);
    gui.add(params, 'outlineThickness', MIN_OUTLINE_THICKNESS, MAX_OUTLINE_THICKNESS);
    gui.addColor(params, 'outlineColor');
}

function init() {
    loader = new GLTFLoader();

    initScene();
    initCamera();
    initRenderer();
    initEventListeners();
    initGUI();

    magnify3d = new Magnify3d();
}

function renderSceneToTarget(tgt) {

    renderer.render(scene, camera, tgt);
}

function render() {
       // renderSceneToTarget(defaultTarget)

        magnify3d.render({
            renderer,
            renderSceneCB: (target) => {
                if (target) {
                    renderer.setRenderTarget(target);
                } else {
                    renderer.setRenderTarget(defaultTarget);

                }
                renderer.render(scene, camera);
                  
            },
            pos: params.mouse,
            zoom: params.zoom, 
            exp: params.exp,
            radius: params.radius,
            outlineThickness: params.outlineThickness,
            outlineColor: params.outlineColor,
            antialias: true,
            inputBuffer: defaultTarget,
            outputBuffer: undefined
        });
    //    const controls = new OrbitControls( camera, renderer.domElement );
       

}

function animate() {
    requestAnimationFrame(animate);


 
    render();
}

init();
animate();