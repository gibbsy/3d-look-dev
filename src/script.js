import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

// /**
//  * Spector JS
//  */
// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */

const landTex = textureLoader.load("tex/land_beauty.jpg");
const oceanTex = textureLoader.load("tex/ocean_beauty.jpg");
const hydrogenTex = textureLoader.load("tex/hydrogen_tex.jpg");
const coniferTex = textureLoader.load("tex/conifer_tex.png");
const turbineBladeTex = textureLoader.load("tex/turbine_blade_tex.jpg");
const turbineBaseTex = textureLoader.load("tex/turbine_base_tex.jpg");

const textures = [landTex, oceanTex, hydrogenTex, turbineBladeTex, turbineBaseTex];
textures.forEach((texture) => {
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
});

/**
 * Materials
 */
// Baked material
const bakedLand = new THREE.MeshBasicMaterial({ map: landTex });
const bakedOcean = new THREE.MeshBasicMaterial({ map: oceanTex });
const bakedHydrogen = new THREE.MeshBasicMaterial({ map: hydrogenTex });
const bakedConifer = new THREE.MeshBasicMaterial({ map: coniferTex });
const bakedTurbineBlade = new THREE.MeshBasicMaterial({ map: turbineBladeTex });
const bakedTurbineBase = new THREE.MeshBasicMaterial({ map: turbineBaseTex });

// Portal light material
// const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Pole light material
// const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

/**
 * Model
 */
gltfLoader.load("globe_objects_bake_test_geo.glb", (gltf) => {
  console.log(gltf.scene);

  /**
   * Globe
   */
  const globe = gltf.scene.getObjectByName("Globe");
  const landMesh = globe.getObjectByName("globe_land");
  const oceanMesh = globe.getObjectByName("globe_ocean");

  landMesh.material = bakedLand;
  oceanMesh.material = bakedOcean;

  /**
   * Master objects
   */
  const hydrogenMaster = gltf.scene.getObjectByName("Hydrogen_master").children[0];
  hydrogenMaster.visible = false;
  hydrogenMaster.material = bakedHydrogen;

  const coniferMaster = gltf.scene.getObjectByName("conifer_master").children[0];
  // coniferMaster.visible = false;
  coniferMaster.material = bakedConifer;

  /**
   * Cloners
   */
  const hydrogenEls = gltf.scene.getObjectByName("hydrogen_storage").children[0];
  hydrogenEls.children.forEach((child) => (child.visible = false));

  const coniferEls = gltf.scene.getObjectByName("conifer_trees").children[0];
  coniferEls.children.forEach((child) => (child.visible = false));

  console.log(coniferEls);

  const hydrogenGeometry = hydrogenMaster.geometry.clone();
  const coniferGeometry = coniferMaster.geometry.clone();

  const defaultTransform = new THREE.Matrix4();

  hydrogenGeometry.applyMatrix4(defaultTransform);
  coniferGeometry.applyMatrix4(defaultTransform);

  const hydrogenInstanced = new THREE.InstancedMesh(hydrogenGeometry, bakedHydrogen, hydrogenEls.children.length);
  const coniferInstanced = new THREE.InstancedMesh(coniferGeometry, bakedConifer, coniferEls.children.length);

  // hydrogenInstanced.instanceMatrix.needsUpdate = true;

  hydrogenEls.children.forEach((mesh, i) => {
    let dummy = new THREE.Object3D();
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    hydrogenInstanced.setMatrixAt(i, dummy.matrix);
  });
  coniferEls.children.forEach((mesh, i) => {
    let dummy = new THREE.Object3D();
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    coniferInstanced.setMatrixAt(i, dummy.matrix);
  });

  // console.log(hydrogenInstanced);

  scene.add(gltf.scene);
  scene.add(hydrogenInstanced, coniferInstanced);
});
//turbines
// gltfLoader.load();
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 20;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

gui.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const stats = new Stats();
document.body.appendChild(stats.dom);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Update stats
  stats.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
