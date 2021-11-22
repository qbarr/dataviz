import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Magnify3d from 'magnify-3d';
import * as dat from 'dat.gui';
import data from "./datas.json"


let camera, scene, renderer;
let geometry, material, mesh,controls;
let mouse,magnify3d,loader,defaultTarget,params,gui;
params = {
	mouse:new THREE.Vector2(window.innerWidth/2,window.innerHeight/2)

}
const MIN_ZOOM = 1;
const MAX_ZOOM = 15;
const MIN_EXP = 1;
const MAX_EXP = 100;
const MIN_RADIUS = 10;
const MAX_RADIUS = 500;
const MIN_OUTLINE_THICKNESS = 0;
const MAX_OUTLINE_THICKNESS = 50;

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
	params.mouse = new THREE.Vector2(window.innerWidth/2,window.innerHeight/2)
	loader = new GLTFLoader();
    magnify3d = new Magnify3d();
	initScene()
	initCamera()
	initRenderer()
	initEventListeners();
	initGUI()


}

function initCamera() {
	camera = new THREE.PerspectiveCamera( 70, 1, 0.01, 1000 );
	camera.position.set( 0, 0,5);
	camera.lookAt(0.0, 0.0, 0.0);
}

function initScene() {
	scene = new THREE.Scene();
	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.MeshNormalMaterial();

	data.forEach((data,i) => {
		const 	mesh = new THREE.Mesh( geometry, physicalMaterial);
		mesh.position.y += i
		scene.add( mesh);
	})

	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	scene.background = new THREE.Color( 0x000fff );
}

function renderSceneToTarget(tgt) {
    renderer.render(scene, camera, tgt);
}

function render() {
    renderSceneToTarget(defaultTarget); // Render original scene to target / screen (depends on defaultTarget).
    
    magnify3d.render({
        renderer,
        renderSceneCB: renderSceneToTarget,
        pos: params.mouse
/*         zoom: params.zoom,
        exp: params.exp,
        radius: params.radius,
        outlineThickness: params.outlineThickness,
        outlineColor: params.outlineColor,
        antialias: true,
        inputBuffer: defaultTarget,
        outputBuffer: undefined */
    });
}


function animate( ) {
	requestAnimationFrame(animate);
	render()

}

function initEventListeners() {
	document.addEventListener('mousemove', (e) => {
      //  params.mouse = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
    });

	window.addEventListener('resize', (e) => {
        renderer.setSize(window.innerWidth/4, window.innerWidth/4);
        camera.aspect = 1;
        camera.clientWidth = window.innerWidth/4;
        camera.clientHeight = window.innerWidth/4;
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
    renderer.setSize(window.innerWidth/4, window.innerWidth/4);
	renderer.setAnimationLoop( animate )

    const container = document.createElement('div');
    document.getElementsByClassName("canvas__container")[0].appendChild(renderer.domElement);
    document.body.appendChild(container);

    defaultTarget = new THREE.WebGLRenderTarget((window.innerWidth/4) * pixelRatio, (window.innerWidth/4) * pixelRatio); 
	controls = new OrbitControls( camera, renderer.domElement );

}


function initGUI() {
	params = {
        zoom: 2.0,
        exp: 30.0,
        radius: 110.0,
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

