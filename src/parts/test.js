import * as THREE from 'three';
import * as dat from 'dat.gui';
import Magnify3d from 'magnify-3d-new';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {  OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js'
import {getDatas,getScaleMolecule} from './datas.js'
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'

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
let moleculeYellow=[],moleculeBrown=[],moleculePurple=[]
let positionYellow,positionBrown,positionPurple
for(let i =0;i<50;i++){
    transitions[i]=true
}
const MIN_ZOOM = 1;
const MAX_ZOOM = 15;
const MIN_EXP = 1;
const MAX_EXP = 100;
const MIN_RADIUS = 100;
const MAX_RADIUS = 3000;
const MIN_OUTLINE_THICKNESS = 0;
const MAX_OUTLINE_THICKNESS = 50;

function initScene() {
    scene = new THREE.Scene();

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

        './newMolecule3.gltf',
        // called when the resource is loadedx
        function ( gltf ) {


            addGeometryFont2('CO2',0,12,0,1.2,gltf.scene.children[25].material)
            addGeometryFont2('NO2',0,0,0,1.2,gltf.scene.children[0].material)
            addGeometryFont2('NO',0,-10,0,1.2,gltf.scene.children[40].material)
            addGeometryFont2('CHATELET',-22,0,-10,4,gltf.scene.children[0].material)
            addGeometryFont2('14/11/2021',12,15,-10,2,gltf.scene.children[0].material)
 
            gltf.scene.traverse( function ( child )  {
                if ( child.isMesh ) {
                    child.scale.set(0.7,0.7,0.7)
                    child.geometry.center(); 
                   
                    
                   /*  const color = child.material.color
                    child.material = materialReplace.clone()
                    child.material.color =  color */
                    if(child.name[1]==="S") {
                        scaleWithDatas(child)
                    } 

                    if(child.name[2]==="B") {
                        moleculeBrown.push(child)
                    } else if(child.name[2]==="Y") {
                        moleculeYellow.push(child)
                    }else if(child.name[2]==="P") {
                        moleculePurple.push(child)
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
            scene.background =new THREE.Color(0x010112)
            //scene.background =new THREE.Color(0x0a0114)
            scene.add( gltf.scene );
            model = gltf.scene

        }
    );
   
  

}

function scaleWithDatas(child) {
    const SCALEFACTOR = 1.25
    const SCALEFACTORNO =1.8
    const scaleSphere = getScaleMolecule(child.name[child.name.length-1])
    if(child.name[2]==="P") {
        child.scale.set(SCALEFACTOR*child.scale.x*scaleSphere.CO2,SCALEFACTOR*child.scale.y*scaleSphere.CO2,SCALEFACTOR*child.scale.z*scaleSphere.CO2)
        createTonusAt2('P',child,0x000fff,0x000fff)
       // createGroupeTonus('P',-7,0,10)

    } else if(child.name[2]==="Y") {
        child.scale.set(SCALEFACTOR*child.scale.x*scaleSphere.NO2,SCALEFACTOR*child.scale.y*scaleSphere.NO2,SCALEFACTOR*child.scale.z*scaleSphere.NO2)
        createTonusAt2('Y',child,0x000fff,0x000fff)
      //  createGroupeTonus('Y',-7,-22,10)

    } else if(child.name[2]==="B") {
        child.scale.set(SCALEFACTORNO*child.scale.x*scaleSphere.NO,SCALEFACTORNO*child.scale.y*scaleSphere.NO,SCALEFACTORNO*child.scale.z*scaleSphere.NO)
       createTonusAt2('B',child,0x000fff,0x000fff)
       //createGroupeTonus('B',20,-10,10)
    }
}

function addGeometryFont(group,numberForTextTorus,torus,word) {
    let fontLoader = new FontLoader();
    const textTorus = group==='B' ? datas[numberForTextTorus].NO2 : group==='Y'  ? datas[numberForTextTorus].NO : datas[numberForTextTorus].CO2 
    fontLoader.load(
        '/fonts/teko-regular.typeface.json', font => {

            const textGeometry = new TextGeometry(
                word ? word:textTorus.toString(),
                {
                    font: font,
                    size: 1,
                    height: 1,
                    curveSegments: 12
                }
            )
        

            const textMaterial = torus.material.clone()
            const text = new THREE.Mesh(textGeometry, textMaterial)
            text.position.set(torus.position.x,torus.position.y,torus.position.z)
            text.scale.set(torus.scale.x,torus.scale.y,torus.scale.z)
            textGeometry.center()
            document.dispatchEvent(new Event('mousemove'));

            scene.add(text)

            

        }

    )


}
function addGeometryFont2(word,x,y,z,scale,material) {
    let fontLoader = new FontLoader();
    let isChateletOrDate = word==='CHATELET' || word === '14/11/2021'
    let isDate = word==='14/11/2021' 
    fontLoader.load(
        '/fonts/phosphate-pro.typeface.json', font => {
            const textGeometry = new TextGeometry(
                word,
                {
                    font: font,
                    size: 1,
                    height: isChateletOrDate ? 0.3 : 1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.03,
                    bevelOffset: 0,
                    bevelSegments: 5
                }
            )
            const textMaterial = material.clone()
            const text = new THREE.Mesh(textGeometry, textMaterial)
            text.position.set(x,y,z)
            text.scale.set(scale,scale,scale)
            if(isChateletOrDate) text.rotation.y = 2* Math.PI *0.10
            if(isDate) text.rotation.y = 2* Math.PI *1.95
            textGeometry.center()

            scene.add(text)

            if(!isChateletOrDate){
                createTonusAt(x,y,z,scale*1.2,textMaterial,textMaterial.color)
            }            
            


        }
        
    )
}

function initMeshes(alphaTexture){
  /*   const boxGeometry = new THREE.BoxGeometry(2, 2, 2);

    boxMesh4 = new THREE.Mesh(boxGeometry, normalMaterial);
    boxMesh4.position.x = 0;
    scene.add(boxMesh4);  */
    
    torusBackMaterial = new THREE.MeshPhongMaterial( { color: 0xAA1DED,transparent :true,opacity:1} );
    torusFrontMaterial = new THREE.MeshStandardMaterial( { color: 0x5E2B7E,transparent:true,opacity:1});
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
    torus2 = new THREE.Mesh( torusGeometry, torusFrontMaterial );
    torus2.position.set(-0.3,10.7,-4)

  
  //  createTonusAt(-19.8,7,1.3,0x000fff,0x000fff) 
   

    /* const PlaneGeometry = new THREE.PlaneGeometry( 300, 300 );
    const material = new THREE.MeshStandardMaterial( {color: 0x000fff,metalness:1} );

    const planeMesh = new THREE.Mesh(PlaneGeometry, material);
    planeMesh.rotation.x = 200
    scene.add(planeMesh) */
}
function createTonusAt2(group,child,colorFront,colorBack)  {
    const torusCloneFront = torus2.clone()
    torusCloneFront.material = torus2.material.clone()
    const positionGroupX = group==="B" ? child.position.x +15 : group==="Y" ? child.position.x - 15 : child.position.x -10
    const positionGroupY = group==="B" ? child.position.y -3 : group==="Y" ? child.position.y - 5 : child.position.y
    const torusCloneBack = torus.clone()
    const numberForTextTorus = parseInt(child.name[child.name.length-1]) -1

    torusCloneBack.material = torus.material.clone()
    torusCloneFront.position.set(positionGroupX,positionGroupY, - 1)
    torusCloneFront.scale.set(child.scale.x,child.scale.y,child.scale.z)
    torusCloneFront.material = child.material
    torusCloneFront.material.metalness = 0.2
    torusCloneFront.geometry.center()
    torusCloneFront.roughness = 0
    torusCloneBack.position.set(positionGroupX,positionGroupY, -1.05)
    torusCloneBack.scale.set(child.scale.x,child.scale.y,child.scale.z)
    addGeometryFont(group,numberForTextTorus,torusCloneFront,null)
    scene.add(torusCloneFront)
    scene.add(torusCloneBack)
}


function createTonusAt(posx,posy,posz,scale,material,colorBack)  {

    const torusCloneFront = torus2.clone()
    const torusCloneBack = torus.clone()
    torusCloneFront.position.set(posx,posy,posz)
    torusCloneFront.scale.set(scale,scale,scale)
    torusCloneFront.material = material
    torusCloneBack.position.set(posx,posy,posz-0.1)
    torusCloneBack.scale.set(scale,scale,scale)

    scene.add(torusCloneFront)
    scene.add(torusCloneBack)
}



 
function initLights() {
    lights = {
        light1:new THREE.PointLight( 0x5E2B7E,1,100),  // soft white light
        light2:new THREE.PointLight(0x865F33,1,100),
        light3:new THREE.PointLight(0xF8CE46,1,100),
        lightAmbient:new THREE.AmbientLight(0xffffff,3.9),
        lightDirectional:new THREE.DirectionalLight(0xffffff,0.4),
        lightRectArea:new THREE.RectAreaLight(0xffffff,5 ,20,20)
    }

    lights.light1.position.set(0,12,0)
    lights.light1.intensity =5

    lights.light2.position.set(0,0,0)
    lights.light2.intensity =5

    lights.light3.position.set(0,-10,0)
    lights.light3.intensity =0

    lights.lightRectArea.position.set(-2,16,16)
    lights.lightRectArea.rotation.set(-1,0,0)
  


     scene.add(lights.light1)
    scene.add(lights.light2)
    scene.add(lights.light3)  
    scene.add(lights.lightDirectional)
    scene.add(lights.lightAmbient)
    scene.add(lights.lightRectArea)

}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.set(0.0, 0.0, 44.0);
    camera.lookAt(0.0, 0.0, 0.0);
}

function initRenderer() {
    const pixelRatio = window.devicePixelRatio;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

    renderer.setPixelRatio( pixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.createElement('div');
    renderer.domElement.classList.add('webgl')
    
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);

    defaultTarget = new THREE.WebGLRenderTarget(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio); 

    renderer.physicallyCorrectLights = false
    renderer.outputEncoding = THREE.sRGBEncoding

    const orbitControls = new OrbitControls(camera, renderer.domElement)
}

function initEventListeners() {
    document.addEventListener('mousemove', (e) => {
        params.mouse = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
        newMouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	    newMouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

        camera.position.x = newMouse.x * 10
        camera.position.y = newMouse.y * 10
        camera.lookAt(0.0, 0.0, 0.0);

       // console.log(camera.position.x);
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

}

function initGUI() {
    params = {
        zoom: 2.0,
        exp: 1.0,
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
    lightFolder.add(lights.light1.position,'x',0,10)
    lightFolder.add(lights.light1.position,'y',0,10)
    lightFolder.add(lights.light1.position,'z',0,10)
    lightFolder.add(lights.light1.scale,'x',0,10)
    lightFolder.add(lights.light1.scale,'y',0,10)
    lightFolder.add(lights.light1.scale,'z',-10,10)

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
 
    gui.add(renderer,'physicallyCorrectLights')
}

function generateText(text) {
    let newText =  new THREE.TextGeometry(
        text,
        {
            font: font,
            size: 200,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        }
     )
     torus2.geometry.dispose()
     torus2.geometry = newTorus
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
}

function renderSceneToTarget(tgt) {

    renderer.render(scene, camera, tgt);
}

function render() {
       // renderSceneToTarget(defaultTarget)
    
        raycaster.setFromCamera(newMouse, camera );
     /*    for (const [key, value] of Object.entries(lights)) {
            value.position.y = Math.sin(time) +2
        } */

        time+=0.001

       // calculate objects intersecting the picking ray
        
        /* const intersects = raycaster.intersectObjects( scene.children.filter((children,i)  => {

            //children.name[1]==="S"
         } ))
        if(intersects.length===0) {

            console.log(torusFrontMaterial.opacity);
            torusFrontMaterial.opacity-=time
            if(time<=0.0) time =0.0
            if(time>0.0) time -=0.001 
        }
        
     
       for ( let i = 0; i < intersects.length; i ++ ) {
              const transition = 1.5+(Math.sin(time)*0.5);
            intersects[i].object.scale.set(transition,transition,transition)  
             if(time>1.0) time =1.0

            if(torusFrontMaterial.opacity<=1) torusFrontMaterial.opacity+=time 
            if(torusFrontMaterial.opacity===0)  time =0.0

            time +=0.001  
      
       }  */
 
      // renderer.setRenderTarget(defaultTarget)
        magnify3d.render({  
                renderer,
                renderSceneCB: (target) => {
                    if (target) {
                        renderer.setRenderTarget(target);
                    } else {
                        renderer.setRenderTarget(defaultTarget  );
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

function animate() {
    requestAnimationFrame(animate);
	TWEEN.update()
 
    render();
}
init();
animate();