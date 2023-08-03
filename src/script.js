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

const landTex = textureLoader.load("tex/land_tex.jpg");
const oceanTex = textureLoader.load("tex/ocean_tex.jpg");
const hydrogenTex = textureLoader.load("tex/hydrogen_tex.jpg");
const coniferTex = textureLoader.load("tex/conifer_tex.jpg");
const palmTreeTex = textureLoader.load("tex/palmtree_tex.jpg");
const turbineBladeTex = textureLoader.load("tex/turbine_blade_tex.jpg");
const turbineBaseTex = textureLoader.load("tex/turbine_base_tex.jpg");
const tankerTex = textureLoader.load("tex/tanker_tex.jpg");
const containerShipTex = textureLoader.load("tex/container_ship_tex.jpg");
const lpgTex = textureLoader.load("tex/lpg_tex.jpg");
// const trawlerTex = textureLoader.load("tex/trawler_tex.jpg");
const portLrgTex = textureLoader.load("tex/port_lrg_tex.jpg");
const portSimpleTex = textureLoader.load("tex/port_simple_tex.jpg");
const cruiseShipTex = textureLoader.load("tex/cruise_ship_tex.jpg");
const satelliteTex = textureLoader.load("tex/satellite_tex.jpg");
const solarTex = textureLoader.load("tex/solar_panel_tex.jpg");
const bulkTex = textureLoader.load("tex/bulk_tex.jpg");

const textures = [
  landTex,
  oceanTex,
  hydrogenTex,
  coniferTex,
  turbineBladeTex,
  turbineBaseTex,
  tankerTex,
  containerShipTex,
  lpgTex,
  // trawlerTex,
  portLrgTex,
  portSimpleTex,
  cruiseShipTex,
  satelliteTex,
  solarTex,
  bulkTex,
  palmTreeTex,
];
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
const bakedPalmTree = new THREE.MeshBasicMaterial({ map: palmTreeTex });
const bakedTurbineBlade = new THREE.MeshBasicMaterial({ map: turbineBladeTex });
const bakedTurbineBase = new THREE.MeshBasicMaterial({ map: turbineBaseTex });
const bakedContainerShip = new THREE.MeshBasicMaterial({ map: containerShipTex });
const bakedPortLrg = new THREE.MeshBasicMaterial({ map: portLrgTex });
const bakedPortSimple = new THREE.MeshBasicMaterial({ map: portSimpleTex });
const bakedSolar = new THREE.MeshBasicMaterial({ map: solarTex });

/**
 * Model
 */

let landMesh,
  oceanMesh,
  hydrogenEls,
  hydrogenTurbineEls,
  hydrogenInstanced,
  coniferEls,
  coniferInstanced,
  palmTreeEls,
  palmTreeInstanced,
  turbineEls,
  turbineBaseInstanced,
  turbineBladeInstanced,
  solarEls,
  solarInstanced,
  shipEls,
  containerShipEls,
  containerShipInstanced,
  trawlerEls,
  trawlerInstanced,
  bulkEls,
  bulkInstanced,
  cruiseEls,
  cruiseInstanced,
  lpgEls,
  lpgInstanced,
  tankerEls,
  tankerInstanced,
  portLrgEls,
  portLrgInstanced,
  portSimpleEls,
  portSimpleInstanced;

let dummy = new THREE.Object3D();

gltfLoader.load("globe_geo.glb", (gltf) => {
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
  const hydrogenMaster = gltf.scene.getObjectByName("hydrogen_plant_base_geo");
  hydrogenMaster.visible = false;
  hydrogenMaster.material = bakedHydrogen;

  const coniferMaster = gltf.scene.getObjectByName("conifer_mesh_master");
  coniferMaster.visible = false;
  coniferMaster.material = bakedConifer;

  const palmTreeMaster = gltf.scene.getObjectByName("palmtree_master");
  palmTreeMaster.visible = false;
  palmTreeMaster.material = bakedPalmTree;

  // const turbineMaster = gltf.scene.getObjectByName("turbine_master").children[0];
  const turbineBladeMaster = gltf.scene.getObjectByName("turbine_blades_master");
  turbineBladeMaster.material = bakedTurbineBlade;
  turbineBladeMaster.visible = false;

  const turbineBaseMaster = gltf.scene.getObjectByName("turbine_base_master");
  turbineBaseMaster.material = bakedTurbineBase;
  turbineBaseMaster.visible = false;

  const solarMaster = gltf.scene.getObjectByName("solar_panel_master");
  solarMaster.material = bakedSolar;
  solarMaster.visible = false;

  const containerShipMaster = gltf.scene.getObjectByName("container_ship_master");
  containerShipMaster.material = bakedContainerShip;
  containerShipMaster.visible = false;

  const portLrgMaster = gltf.scene.getObjectByName("Port_large_master");
  portLrgMaster.material = bakedPortLrg;
  portLrgMaster.visible = false;

  const portSimpleMaster = gltf.scene.getObjectByName("Port_simple_master");
  portSimpleMaster.material = bakedPortSimple;
  portSimpleMaster.visible = false;

  /**
   * Cloners
   */
  hydrogenEls = gltf.scene.getObjectByName("hydrogen_plants").children;
  hydrogenEls.forEach((child) => (child.visible = false));

  solarEls = gltf.scene.getObjectByName("solar_panels").children;
  solarEls.forEach((child) => (child.visible = false));

  coniferEls = gltf.scene.getObjectByName("conifer_trees").children;
  coniferEls.forEach((child) => (child.visible = false));

  palmTreeEls = gltf.scene.getObjectByName("palm_trees").children;
  palmTreeEls.forEach((child) => (child.visible = false));

  turbineEls = gltf.scene.getObjectByName("turbines_onshore").children;
  turbineEls.push(...gltf.scene.getObjectByName("turbines_offshore").children);
  turbineEls.forEach((child) => (child.visible = false));

  shipEls = gltf.scene.getObjectByName("Ships").children;
  shipEls.forEach((child) => (child.visible = false));

  containerShipEls = shipEls.filter((el) => el.name.includes("container"));

  portLrgEls = gltf.scene.getObjectByName("ports_large").children;
  portLrgEls.forEach((child) => (child.visible = false));

  portSimpleEls = gltf.scene.getObjectByName("ports_simple").children;
  portSimpleEls.forEach((child) => (child.visible = false));

  const hydrogenGeometry = hydrogenMaster.geometry.clone();
  const solarGeometry = solarMaster.geometry.clone();
  const coniferGeometry = coniferMaster.geometry.clone();
  const palmTreeGeometry = palmTreeMaster.geometry.clone();
  const turbineBladeGeometry = turbineBladeMaster.geometry.clone();
  const turbineBaseGeometry = turbineBaseMaster.geometry.clone();
  const containerShipGeometry = containerShipMaster.geometry.clone();
  const portLrgGeometry = portLrgMaster.geometry.clone();
  const portSimpleGeometry = portSimpleMaster.geometry.clone();

  const defaultTransform = new THREE.Matrix4();

  hydrogenGeometry.applyMatrix4(defaultTransform);
  solarGeometry.applyMatrix4(defaultTransform);
  coniferGeometry.applyMatrix4(defaultTransform);
  palmTreeGeometry.applyMatrix4(defaultTransform);
  turbineBladeGeometry.applyMatrix4(defaultTransform);
  turbineBaseGeometry.applyMatrix4(defaultTransform);
  containerShipGeometry.applyMatrix4(defaultTransform);
  portLrgGeometry.applyMatrix4(defaultTransform);
  portSimpleGeometry.applyMatrix4(defaultTransform);

  /**
   * Instancing
   */

  hydrogenInstanced = new THREE.InstancedMesh(hydrogenGeometry, bakedHydrogen, hydrogenEls.length);
  solarInstanced = new THREE.InstancedMesh(solarGeometry, bakedSolar, solarEls.length);
  coniferInstanced = new THREE.InstancedMesh(coniferGeometry, bakedConifer, coniferEls.length);
  palmTreeInstanced = new THREE.InstancedMesh(palmTreeGeometry, bakedPalmTree, palmTreeEls.length);
  turbineBaseInstanced = new THREE.InstancedMesh(
    turbineBaseGeometry,
    bakedTurbineBase,
    turbineEls.length + hydrogenEls.length * 2
  );
  turbineBladeInstanced = new THREE.InstancedMesh(
    turbineBladeGeometry,
    bakedTurbineBlade,
    turbineEls.length + hydrogenEls.length * 2
  );
  containerShipInstanced = new THREE.InstancedMesh(containerShipGeometry, bakedContainerShip, containerShipEls.length);
  portLrgInstanced = new THREE.InstancedMesh(portLrgGeometry, bakedPortLrg, portLrgEls.length);
  portSimpleInstanced = new THREE.InstancedMesh(portSimpleGeometry, bakedPortSimple, portSimpleEls.length);

  turbineEls.forEach((mesh, i) => {
    // mesh.translateY(-0.1);
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    turbineBaseInstanced.setMatrixAt(i, dummy.matrix);
    // position the blades relative to base and ranomize starting rotation
    dummy.translateY(0.375);
    dummy.translateZ(0.03);
    dummy.rotateZ(Math.random() * 90);
    dummy.updateMatrix();
    turbineBladeInstanced.setMatrixAt(i, dummy.matrix);
  });

  hydrogenTurbineEls = [];
  hydrogenEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    hydrogenInstanced.setMatrixAt(i, dummy.matrix);
    // x2 turbines per hydrogen plant
    hydrogenTurbineEls.push([mesh, mesh]);
  });

  solarEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    solarInstanced.setMatrixAt(i, dummy.matrix);
  });

  hydrogenTurbineEls.forEach((arr, i) => {
    arr.forEach((mesh, j) => {
      dummy.position.copy(mesh.position);
      dummy.rotation.copy(mesh.rotation);
      dummy.scale.copy(mesh.scale);
      dummy.updateMatrix();
      dummy.scale.set(0.25, 0.25, 0.25);
      dummy.translateZ(-0.25);
      dummy.translateY(0.05);
      dummy.translateX(-0.05 - 0.175 * j);
      dummy.rotateY(-90);
      dummy.updateMatrix();
      turbineBaseInstanced.setMatrixAt(i + j + turbineEls.length, dummy.matrix);
      dummy.translateY(0.19);
      dummy.translateZ(0.015);
      dummy.updateMatrix();
      turbineBladeInstanced.setMatrixAt(i + j + turbineEls.length, dummy.matrix);
    });
  });

  coniferEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    coniferInstanced.setMatrixAt(i, dummy.matrix);
  });

  palmTreeEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    palmTreeInstanced.setMatrixAt(i, dummy.matrix);
  });

  containerShipEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    containerShipInstanced.setMatrixAt(i, dummy.matrix);
  });

  portLrgEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    portLrgInstanced.setMatrixAt(i, dummy.matrix);
  });

  portSimpleEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    portSimpleInstanced.setMatrixAt(i, dummy.matrix);
  });

  scene.add(gltf.scene);
  scene.add(
    hydrogenInstanced,
    solarInstanced,
    coniferInstanced,
    palmTreeInstanced,
    turbineBaseInstanced,
    turbineBladeInstanced,
    containerShipInstanced,
    portLrgInstanced,
    portSimpleInstanced
  );
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
renderer.toneMapping = THREE.NoToneMapping;

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

  let mat4 = new THREE.Matrix4();
  for (let i = 0; i < turbineEls.length + hydrogenEls.length * 2; i++) {
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
