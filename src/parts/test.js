import * as THREE from 'three';
import * as dat from 'dat.gui';
import Magnify3d from 'magnify-3d-new';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RectAreaLightHelper }  from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js'
import {getDatas,getSmallestAndHighest,getDifference,getNormalizeScale,getScaleMolecule} from './datas.js'

// FPS monitor
javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

let datas = getDatas()

let camera, scene, renderer, defaultTarget, boxMesh1, boxMesh2,boxMesh4,lights;
let magnify3d, params, gui,loader,model,torusGeometry,torus,torus2,sphereMesh,materialTexture;
let shiftDown, ctrlDown;
let circle,circle2
let textureLoader,normalMaterial,physicalMaterial
let spheres = []
let torusBackMaterial,torusFrontMaterial
let raycaster = new THREE.Raycaster()
let time = 0
let isGood = true
let newMouse = new THREE.Vector2()
let transitions = []

for(let i =0;i<50;i++){
    transitions[i]=true
}
const MIN_ZOOM = 1;
const MAX_ZOOM = 15;
const MIN_EXP = 1;
const MAX_EXP = 100;
const MIN_RADIUS = 10;
const MAX_RADIUS = 100;
const MIN_OUTLINE_THICKNESS = 0;
const MAX_OUTLINE_THICKNESS = 50;

function initScene() {
    scene = new THREE.Scene();

    initTexturesAndMaterials()
    textureLoader = new THREE.TextureLoader()
    normalMaterial = new THREE.MeshNormalMaterial();
    physicalMaterial = new THREE.MeshPhysicalMaterial({
        color:new THREE.Color(0x49ef4),
        roughness:1,
        metalness:0
    });

    initLights()
        textureLoader.load(
            // resource URL
            './alphatexture.jpg',
    
            function ( alphaTexture ) {
                alphaTexture.repeat.set(0.2, 0.2);
                initMeshes(alphaTexture)
            }
        );


    loader.load(

        './newMolecule.gltf',
        // called when the resource is loadedx
        function ( gltf ) {
         
            gltf.scene.traverse( function ( child )  {
                if ( child.isMesh ) {
                    child.scale.set(0.7,0.7,0.7)
                    child.geometry.center(); 
                    if(child.name[1]==="S") {
                        const SCALEFACTOR = 1.25
                        const SCALEFACTORNO =1.8
                        const scaleSphere = getScaleMolecule(child.name[child.name.length-1])
                        if(child.name[2]==="P") {
                            child.scale.set(SCALEFACTOR*child.scale.x*scaleSphere.CO2,SCALEFACTOR*child.scale.y*scaleSphere.CO2,SCALEFACTOR*child.scale.z*scaleSphere.CO2)
                        } else if(child.name[2]==="Y") {
                            child.scale.set(SCALEFACTOR*child.scale.x*scaleSphere.NO2,SCALEFACTOR*child.scale.y*scaleSphere.NO2,SCALEFACTOR*child.scale.z*scaleSphere.NO2)
                        } else if(child.name[2]==="B") {
                            child.scale.set(SCALEFACTORNO*child.scale.x*scaleSphere.NO,SCALEFACTORNO*child.scale.y*scaleSphere.NO,SCALEFACTORNO*child.scale.z*scaleSphere.NO)
                        }
                    }
                }
            });
            //MeshPhongMaterial
            gltf.scene.position.set(0,-4.5,0)
            gltf.scene.rotation.set(0,5.9,5.6)
            gltf.scene.scale.set(1.1,1.1,1.1)
            gltf.scene.traverse( function ( child )  {
                if ( child.isMesh &&  child.name[0]==="S" && child.name[3]==="è") {
                    spheres.push({
                        position:child.position,
                        scale:child.scale
                    })
                }
            });            
            console.log(spheres);
            scene.add( gltf.scene );
            model = gltf.scene

       /*      const material = new THREE.MeshBasicMaterial( { color: 0xAA1DED} );
            torusGeometry = new THREE.TorusGeometry( 3, 0.3, 15, 60 );
            for(let i=0;i<spheres.length;i++){
                torus = new THREE.Mesh( torusGeometry, material );
                torus.position.set(spheres[i].position.x,spheres[i].position.y,spheres[i].position.z)
                torus.scale.set(spheres[i].scale.x,spheres[i].scale.y,spheres[i].scale.z)
                scene.add( torus );
            }
          */

     
        }
    );
   
  

}

function initMeshes(alphaTexture){
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);

    boxMesh4 = new THREE.Mesh(boxGeometry, normalMaterial);
    boxMesh4.position.x = 0;
    scene.add(boxMesh4); 

    torusBackMaterial = new THREE.MeshPhongMaterial( { color: 0xAA1DED,transparent :true,opacity:0} );
    torusFrontMaterial = new THREE.MeshPhongMaterial( { color: 0xE2C5FF,transparent:true,opacity:0});
    const circleMaterial = new THREE.MeshBasicMaterial( { color: 0xAA1DED,alphaMap:alphaTexture} );

/*     const circleGeometry = new THREE.CircleGeometry( 1.5, 32 );
    circle = new THREE.Mesh( circleGeometry, material );
    circle.position.set(-0.3,10.7,5)
    circle.scale.set(1.02,1.02,1.02)
    //scene.add( circle ); 
    circle2 = new THREE.Mesh( circleGeometry, newMaterial );
    circle2.position.set(-0.3,10.7,-4)
    scene.add( circle2);  */

    torusGeometry = new THREE.TorusGeometry( 1.5, 0.2, 15, 60 );
    torus = new THREE.Mesh( torusGeometry, torusBackMaterial );
    torus.position.set(-0.3,10.7,-3.95)
    scene.add( torus );
    torus2 = new THREE.Mesh( torusGeometry, torusFrontMaterial );
    torus2.position.set(-0.3,10.7,-4)
    scene.add( torus2)

    createTonusAt(-2.5,11,1.4)
    //createCircleAt(-2.5,11,1.4)
    createTonusAt(-9,12,2.7)
    createTonusAt(-14.25,9,1.5) 
    createTonusAt(-17.75,10.5,1) 
    createTonusAt(-19.8,7,1.3) 
    document.addEventListener('click',()=> {
        transitionOpacityTorus(1,0)
    })

    /* const PlaneGeometry = new THREE.PlaneGeometry( 300, 300 );
    const material = new THREE.MeshStandardMaterial( {color: 0x000fff,metalness:1} );

    const planeMesh = new THREE.Mesh(PlaneGeometry, material);
    planeMesh.rotation.x = 200
    scene.add(planeMesh) */
}

function createTonusAt(posx,posy,scale)  {
    const torusCloneBack = torus.clone()
    const torusCloneFront = torus2.clone()
    torusCloneFront.position.set(posx,posy,-4)
    torusCloneFront.scale.set(scale,scale,scale)
    torusCloneBack.position.set(posx,posy,-3.95)
    torusCloneBack.scale.set(scale,scale,scale)
    scene.add(torusCloneFront)
    scene.add(torusCloneBack)
}

function createCircleAt(posx,posy,scale)  {
    const circleCloneBack = circle.clone()
    const circleCloneFront = circle2.clone()
    circleCloneFront.position.set(posx,posy,-4)
    circleCloneFront.scale.set(scale,scale,scale)
    circleCloneBack.position.set(posx,posy,-3.95)
    circleCloneBack.scale.set(scale,scale,scale)
    scene.add(circleCloneFront)
    scene.add(circleCloneBack)
}


function initTexturesAndMaterials() {
 
}

function initLights() {
    lights = {
        light1:new THREE.PointLight( 0xffffff,1,100),  // soft white light
        light2:new THREE.PointLight(0xffffff,1,100),
        light3:new THREE.PointLight(0xffffff,1,100),
        lightAmbient:new THREE.AmbientLight(0xffffff,2.5),
        lightDirectional:new THREE.DirectionalLight(0xffffff,2.1),
        lightRectArea:new THREE.RectAreaLight(0xffffff,6.1 ,20,20)
    }

    const PointLightHelper = new THREE.PointLightHelper(lights.light1,0.2)
    lights.light1.position.set(0,0,0)
    lights.light1.intensity =1
    lights.light1.add(PointLightHelper)

    lights.light2.position.set(0,0,0)
    lights.light2.intensity =1

    lights.light3.position.set(0,0,0)
    lights.light3.intensity =1 

    const directionalLightHelper = new THREE.DirectionalLightHelper( lights.lightDirectional, 50);
    lights.lightDirectional.add(directionalLightHelper)

    lights.lightRectArea.position.set(-2,16,16)
    lights.lightRectArea.rotation.set(-1,0,0)
  

    const reactAreaHelper = new RectAreaLightHelper( lights.lightRectArea );
    lights.lightRectArea.add(reactAreaHelper) 

     /*scene.add(lights.light1)
    scene.add(lights.light2)
    scene.add(lights.light3)  */
    scene.add(lights.lightDirectional)
    scene.add(lights.lightAmbient)
    scene.add(lights.lightRectArea)

}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.set(0.0, 0.0, 40.0);
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
    const controls = new OrbitControls( camera, renderer.domElement );

    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
}

function initEventListeners() {
    document.addEventListener('mousemove', (e) => {
        params.mouse = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
        newMouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	    newMouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
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
        radius: 100.0,
        outlineThickness: 4.0,
        outlineColor: 0x555555
    }


    gui = new dat.GUI();
    const lightFolder = gui.addFolder('light')
    lightFolder.add(lights.light1,'intensity',0,100)
    lightFolder.add(lights.light1.rotation,'x',0,Math.PI*2)
    lightFolder.add(lights.light1.rotation,'y',0,Math.PI*2)
    lightFolder.add(lights.light1.rotation,'z',0,Math.PI*2)
    lightFolder.add(lights.light1.position,'x',0,100)
    lightFolder.add(lights.light1.position,'y',0,100)
    lightFolder.add(lights.light1.position,'z',0,100)
    lightFolder.add(lights.light1.scale,'x',0,10)
    lightFolder.add(lights.light1.scale,'y',0,10)
    lightFolder.add(lights.light1.scale,'z',0,10)

    const lightAmbientFolder = gui.addFolder('lightAmbient')
    lightAmbientFolder.add(lights.lightAmbient,'intensity',0,4)

    const lightDirectionalFolder = gui.addFolder('lightDirectional')
    lightDirectionalFolder.add(lights.lightDirectional,'intensity',0,4)

    const lightRectAreaFolder = gui.addFolder('lightRectArea')
    lightRectAreaFolder.add(lights.lightRectArea,'intensity',0,10)
    lightRectAreaFolder.add(lights.lightRectArea,'width',1,10)
    lightRectAreaFolder.add(lights.lightRectArea,'height',1,10)
    const lightRectAreaPositionFolder = lightRectAreaFolder.addFolder('position-rect')
    lightRectAreaPositionFolder.add(lights.lightRectArea.position,'x',-10,10)
    lightRectAreaPositionFolder.add(lights.lightRectArea.position,'y',-10,20)
    lightRectAreaPositionFolder.add(lights.lightRectArea.position,'z',0,50)
    const lightRectAreaRotationFolder = lightRectAreaFolder.addFolder('rotation-rect')
    lightRectAreaRotationFolder.add(lights.lightRectArea.rotation,'x',-Math.PI,Math.PI)
    lightRectAreaRotationFolder.add(lights.lightRectArea.rotation,'y',0,Math.PI*2)
    lightRectAreaRotationFolder.add(lights.lightRectArea.rotation,'z',0,Math.PI*2)

    setTimeout(()=> {

        const moleculeFolder =  gui.addFolder('molecule')
        const moleculePositionFolder = moleculeFolder.addFolder('position') 
        moleculePositionFolder.add(model.position,'x',0,100)
        moleculePositionFolder.add(model.position,'y',-20,20)
        moleculePositionFolder.add(model.position,'z',0,100)
        const moleculeRotationFolder = moleculeFolder.addFolder('rotation') 
        moleculeRotationFolder.add(model.rotation,'x',0,Math.PI*2)
        moleculeRotationFolder.add(model.rotation,'y',0,Math.PI*2)
        moleculeRotationFolder.add(model.rotation,'z',0,Math.PI*2)
        moleculeFolder.add(model.children[6].material,'metalness',0,1)
        moleculeFolder.add(model.children[6].material,'roughness',0,1)
    },2000)
  
	const cameraFolder = gui.addFolder('Camera')
    const cameraPositionFolder = cameraFolder.addFolder('position') 
	cameraPositionFolder.add(camera.position,'x',0,30)
	cameraPositionFolder.add(camera.position,'y',-10,40)
	cameraPositionFolder.add(camera.position,'z',0,40)
    const cameraRotationFolder = cameraFolder.addFolder('rotation') 
	cameraRotationFolder.add(camera.rotation,'x',0,Math.PI)
	cameraRotationFolder.add(camera.rotation,'y',-Math.PI,Math.PI)
	cameraRotationFolder.add(camera.rotation,'z',0,Math.PI)
    
    const loupeFolder = gui.addFolder('loupeZoom')
    loupeFolder.add(params, 'radius', MIN_RADIUS, MAX_RADIUS);
    loupeFolder.add(params, 'zoom', MIN_ZOOM, MAX_ZOOM);
    loupeFolder.add(params, 'exp', MIN_EXP, MAX_EXP);
    loupeFolder.add(params, 'outlineThickness', MIN_OUTLINE_THICKNESS, MAX_OUTLINE_THICKNESS);
    loupeFolder.addColor(params, 'outlineColor');

    setTimeout(() => {
        const torusFolder = gui.addFolder('torus')
        console.log(torusGeometry.parameters.tube);
        torusFolder.add(torusGeometry.parameters,'radius',1,5).onChange(generateGeometry)
        torusFolder.add(torusGeometry.parameters,'tube',0.1,0.7).onChange(generateGeometry)
        torusFolder.add(torusGeometry.parameters,'radialSegments',5,50).onChange(generateGeometry)
        torusFolder.add(torusGeometry.parameters,'tubularSegments',10,100).onChange(generateGeometry)
        torusFolder.add(torus.position,'x',0,7)
        torusFolder.add(torus.position,'y',0,12)
        torusFolder.add(torus.position,'z',-5,7)
    }, 1000)

 
    gui.add(renderer,'physicallyCorrectLights')
}

function generateGeometry() {
   let newTorus =  new THREE.TorusBufferGeometry(
       torusGeometry.parameters.radius,
       torusGeometry.parameters.tube,
       torusGeometry.parameters.radialSegments,
       torusGeometry.parameters.tubularSegments
    )
    torus2.geometry.dispose()
    torus2.geometry = newTorus
}

function init() {
    loader = new GLTFLoader();

    initScene();
    initCamera();
    initRenderer();
    initEventListeners();
    initGUI();

    magnify3d = new Magnify3d();
    console.log(scene.children);
}

function transitionOpacityTorus(opacity,i) {
  /*   if(transitions[i]==true) {
        let tweenon = new TWEEN.Tween(camera.position).to({
            opacity
        }, 2000)
        .onUpdate((object)=> {
            console.log(object);
            torusBackMaterial.opacity+=object
           // console.log(torusFrontMaterial.opacity);
        })
        .onComplete(()=> {
            transitions[i]=true
        })
        console.log(transitions[i]);
        tweenon.start();
    } */
}
function renderSceneToTarget(tgt) {

    renderer.render(scene, camera, tgt);
}

function render() {
       // renderSceneToTarget(defaultTarget)
    
        raycaster.setFromCamera(newMouse, camera );

       // calculate objects intersecting the picking ray
        
        const intersects = raycaster.intersectObjects( scene.children.filter((children,i)  => children.name[1]==="S") );
        if(intersects.length===0) {
           /*  torusFrontMaterial.opacity-=time
            if(time<=0.0) time =0.0
            if(time>0.0) time -=0.001  */
        }
        
     
       for ( let i = 0; i < intersects.length; i ++ ) {
           /*   const transition = 1.5+(Math.sin(time)*0.5);
            intersects[i].object.scale.set(transition,transition,transition) 
             if(time>1.0) time =1.0

            if(torusFrontMaterial.opacity<=1) torusFrontMaterial.opacity+=time 
            if(torusFrontMaterial.opacity===0)  time =0.0

            time +=0.001  */
      
       } 
 

       renderer.render(scene, camera);
   /*     magnify3d.render({  
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
        }); */
        

      

}

function animate() {
    requestAnimationFrame(animate);
	TWEEN.update()
 
    render();
}
init();
animate();