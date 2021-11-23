import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Magnify3d from 'magnify-3d-new';
import * as dat from 'dat.gui';
import data from "./datas.json"
import { generateUUID } from 'three/src/math/MathUtils';


const MIN_ZOOM = 1;
const MAX_ZOOM = 15;
const MIN_EXP = 1;
const MAX_EXP = 100;
const MIN_RADIUS = 10;
const MAX_RADIUS = 500;
const MIN_OUTLINE_THICKNESS = 0;
const MAX_OUTLINE_THICKNESS = 50;

let camera, scene, renderer,canvas;
let geometry, material, mesh,controls;
let mouse,magnify3d,loader,defaultTarget,params,gui;
let checkerMaterial,normalMaterial;
let isGood = true
let boxMesh1,boxMesh2,boxMesh3
const canvasSize = {
    width:window.innerWidth/4,
    height:window.innerWidth/4
}
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    console.log(rect);
    return new THREE.Vector2(
        evt.clientX - rect.left,
        evt.clientY - rect.top 
    )
}
const physicalMaterial = new THREE.MeshPhysicalMaterial({
	metalness: 0,
	roughness: 1,
	envMapIntensity: 0.9,
	clearcoat: 1,
	transparent: true,
	transmission: .95,
	opacity: 1,
	reflectivity: 0.2,
})

init();
animate()

function init() {
	//params.mouse = new THREE.Vector2(window.innerWidth/2,window.innerHeight/2)
	loader = new GLTFLoader();
    magnify3d = new Magnify3d();
	initScene()
	initCamera()
	initRenderer()
	initEventListeners();
	initGUI()

    render()


}

function initCamera() {
	camera = new THREE.PerspectiveCamera( 70, 1, 0.01, 1000 );
	//camera.position.set( 0, 0, 5);
    camera.position.set(0.0, 40.0, 250.0);

	camera.lookAt(0.0, 0.0, 0.0);
}

function initMaterials() {
    const texture = new THREE.TextureLoader().load( 'res/checkerboard.png');

    checkerMaterial = new THREE.MeshBasicMaterial( { map: texture } );
    normalMaterial = new THREE.MeshNormalMaterial();
}

function initScene() {
	scene = new THREE.Scene();
/* 	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.MeshNormalMaterial();

	data.forEach((data,i) => {
		const 	mesh = new THREE.Mesh( geometry, physicalMaterial);
		mesh.position.y += i
		scene.add( mesh);
	})
 */
    initMaterials()
    initMeshes()
   
	//scene.background = new THREE.Color( 0x000fff );
}

function initMeshes() {
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20);
    boxMesh1 = new THREE.Mesh(boxGeometry, checkerMaterial);
    boxMesh1.position.x = 50;
    scene.add(boxMesh1);

    boxMesh2 = new THREE.Mesh(boxGeometry, checkerMaterial);
    boxMesh2.position.set(0,0,0);
    scene.add(boxMesh2);

    const boxMesh3 = new THREE.Mesh(boxGeometry, normalMaterial);
    boxMesh3.position.set(0,0,0)
    scene.add(boxMesh3);

    const boxMesh4 = new THREE.Mesh(boxGeometry, normalMaterial);
    boxMesh4.position.x = -100;
    scene.add(boxMesh4);

    const sphereGeometry = new THREE.SphereGeometry(10, 64, 64);

    const sphereMesh = new THREE.Mesh(sphereGeometry, normalMaterial);
    scene.add(sphereMesh);
}

function renderSceneToTarget(tgt) {
    renderer.render(scene, camera, tgt);
}

function render() {
    renderSceneToTarget(defaultTarget); // Render original scene to target / screen (depends on defaultTarget).
  //  params.mouse = new THREE.Vector2(window.innerWidth,window.innerHeight)
   // params.mouse = new THREE.Vector2(550,420)
    magnify3d.render({
        renderer,
        renderSceneCB: target => {
            if (target) {
                renderer.setRenderTarget(target);
            } else {
                renderer.setRenderTarget(null)

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
}


function animate( ) {
	requestAnimationFrame(animate);
    render()
}

function initEventListeners() {
	document.addEventListener('mousemove', (e) => {
       // console.log(canvas);
        params.mouse = getMousePos(canvas,e)
    });

	window.addEventListener('resize', (e) => {
        renderer.setSize(canvasSize.width, canvasSize.height);
        camera.aspect = 1;
        camera.clientWidth = canvasSize.width
        camera.clientHeight = canvasSize.height;
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

 

}

function initRenderer() {
    const pixelRatio = window.devicePixelRatio;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

    renderer.setPixelRatio( pixelRatio );
    renderer.setSize(canvasSize.width, canvasSize.height);
	renderer.setAnimationLoop( animate )

    const container = document.createElement('div');
    container.classList.add('canvas')
    canvas = container
    document.getElementsByClassName("canvas__container")[0].appendChild(renderer.domElement);

    defaultTarget = new THREE.WebGLRenderTarget(canvasSize.width * pixelRatio, canvasSize.height * pixelRatio); 
	controls = new OrbitControls( camera, renderer.domElement );

}


function initGUI() {
	params = {
        zoom: 2.0,
        exp: 30.0,
        radius: 200,
        outlineThickness: 4.0,
        outlineColor: 0x555555
    }

    gui = new dat.GUI();
	const cameraFolder = gui.addFolder('Camera')
	cameraFolder.add(camera.position,'x',0,30)
	cameraFolder.add(camera.position,'y',0,30)
	cameraFolder.add(camera.position,'z',0,30)

	const loupeFolder = gui.addFolder('Loupe')
    loupeFolder.add(params, 'radius', MIN_RADIUS, MAX_RADIUS);
    loupeFolder.add(params, 'zoom', MIN_ZOOM, MAX_ZOOM);
    loupeFolder.add(params, 'exp', MIN_EXP, MAX_EXP);
    loupeFolder.add(params, 'outlineThickness', MIN_OUTLINE_THICKNESS, MAX_OUTLINE_THICKNESS);
    loupeFolder.addColor(params, 'outlineColor');

}

loader.load(
	// resource URL
	'./molecule1.glb',
	// called when the resource is loaded
	function ( gltf ) {
        console.log(gltf.asset);
		scene.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object

	}
);

