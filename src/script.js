import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

// /**
//  * Spector JS
//  */
/* const SPECTOR = require("spectorjs");
const spector = new SPECTOR.Spector();
spector.displayUI();
 */
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

const textures = [landTex, oceanTex, hydrogenTex, coniferTex, turbineBladeTex, turbineBaseTex];
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

/**
 * Model
 */

let landMesh,
  oceanMesh,
  hydrogenEls,
  coniferEls,
  turbineEls,
  hydrogenInstanced,
  coniferInstanced,
  turbineBaseInstanced,
  turbineBladeInstanced;

gltfLoader.load("globe_objects_bake_test_geo.glb", (gltf) => {
  console.log(gltf.scene);

  /**
   * Globe
   */
  landMesh = gltf.scene.getObjectByName("globe_land");
  oceanMesh = gltf.scene.getObjectByName("globe_ocean");

  landMesh.material = bakedLand;
  oceanMesh.material = bakedOcean;

  /**
   * Master objects
   */
  const hydrogenMaster = gltf.scene.getObjectByName("hydrogen_mesh_master");
  hydrogenMaster.visible = false;
  hydrogenMaster.material = bakedHydrogen;

  const coniferMaster = gltf.scene.getObjectByName("conifer_mesh_master");
  coniferMaster.visible = false;
  coniferMaster.material = bakedConifer;

  // const turbineMaster = gltf.scene.getObjectByName("turbine_master").children[0];
  const turbineBladeMaster = gltf.scene.getObjectByName("turbine_blades");
  turbineBladeMaster.material = bakedTurbineBlade;
  // turbineBladeMaster.visible = false;

  const turbineBaseMaster = gltf.scene.getObjectByName("turbine_base");
  turbineBaseMaster.material = bakedTurbineBase;
  // turbineBaseMaster.visible = false;

  /**
   * Cloners
   */
  hydrogenEls = gltf.scene.getObjectByName("hydrogen_storage").children[0];
  hydrogenEls.children.forEach((child) => (child.visible = false));

  coniferEls = gltf.scene.getObjectByName("conifer_trees").children[0];
  coniferEls.children.forEach((child) => (child.visible = false));

  turbineEls = gltf.scene.getObjectByName("turbines_land").children[0];
  // turbineEls.children.forEach((child) => (child.visible = false));

  console.log(coniferEls);

  const hydrogenGeometry = hydrogenMaster.geometry.clone();
  const coniferGeometry = coniferMaster.geometry.clone();
  const turbineBladeGeometry = turbineBladeMaster.geometry.clone();
  const turbineBaseGeometry = turbineBaseMaster.geometry.clone();

  const defaultTransform = new THREE.Matrix4();

  hydrogenGeometry.applyMatrix4(defaultTransform);
  coniferGeometry.applyMatrix4(defaultTransform);
  turbineBladeGeometry.applyMatrix4(defaultTransform);
  turbineBaseGeometry.applyMatrix4(defaultTransform);

  hydrogenInstanced = new THREE.InstancedMesh(hydrogenGeometry, bakedHydrogen, hydrogenEls.children.length);
  coniferInstanced = new THREE.InstancedMesh(coniferGeometry, bakedConifer, coniferEls.children.length);
  turbineBaseInstanced = new THREE.InstancedMesh(turbineBaseGeometry, bakedTurbineBase, turbineEls.children.length);
  turbineBladeInstanced = new THREE.InstancedMesh(turbineBladeGeometry, bakedTurbineBlade, turbineEls.children.length);

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

  turbineEls.children.forEach((mesh, i) => {
    let mat = new THREE.MeshBasicMaterial({ color: 0xff0099 });
    mesh.material = mat;
    let dummy = new THREE.Object3D();
    // mesh.translateY(0.2);
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    turbineBaseInstanced.setMatrixAt(i, dummy.matrix);
    // position the blades relative to base and ranomize starting rotation
    dummy.translateY(0.45);
    dummy.translateZ(0.04);
    dummy.rotateZ(Math.random() * 90);
    dummy.updateMatrix();
    turbineBladeInstanced.setMatrixAt(i, dummy.matrix);
  });

  scene.add(gltf.scene);
  scene.add(hydrogenInstanced, coniferInstanced, turbineBaseInstanced, turbineBladeInstanced);
  tick();
});

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
renderer.toneMapping = THREE.ACESFilmicToneMapping;

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
  const t = clock.getDelta();

  // Update controls
  controls.update();

  // Update stats
  stats.update();

  let dummy = new THREE.Object3D();
  let mat4 = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) {
    turbineBladeInstanced.getMatrixAt(i, mat4);
    mat4.decompose(dummy.position, dummy.quaternion, dummy.scale);

    dummy.rotation.z += t;
    dummy.updateMatrix();

    turbineBladeInstanced.setMatrixAt(i, dummy.matrix);
    turbineBladeInstanced.instanceMatrix.needsUpdate = true;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
