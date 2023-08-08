import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { LUTPass } from "three/addons/postprocessing/LUTPass.js";
import { LUTCubeLoader } from "three/addons/loaders/LUTCubeLoader.js";
import { LUT3dlLoader } from "three/addons/loaders/LUT3dlLoader.js";
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
const params = {
  enabled: true,
  lut: "Bourbon 64.CUBE",
  intensity: 1,
  use2DLut: false,
};

const lutMap = {
  "Bourbon_64.CUBE": null,
  "Chemical_168.CUBE": null,
  "Clayton_33.CUBE": null,
  "Cubicle_99.CUBE": null,
  "Remy_24.CUBE": null,
  "globe_test_01.CUBE": null,
  "globe_test_01.3DL": null,
  // "Presetpro-Cinematic.3dl": null,
};

Object.keys(lutMap).forEach((name) => {
  if (/\.CUBE$/i.test(name)) {
    new LUTCubeLoader().load("luts/" + name, function (result) {
      lutMap[name] = result;
    });
  } else {
    new LUT3dlLoader().load("luts/" + name, function (result) {
      lutMap[name] = result;
    });
  }
});
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
const trawlerTex = textureLoader.load("tex/trawler_tex.jpg");
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
  trawlerTex,
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
const bakedBulkShip = new THREE.MeshBasicMaterial({ map: bulkTex });
const bakedTrawler = new THREE.MeshBasicMaterial({ map: trawlerTex });
const bakedTanker = new THREE.MeshBasicMaterial({ map: tankerTex });
const bakedLpg = new THREE.MeshBasicMaterial({ map: lpgTex });
const bakedCruiseShip = new THREE.MeshBasicMaterial({ map: cruiseShipTex });
const bakedPortLrg = new THREE.MeshBasicMaterial({ map: portLrgTex });
const bakedPortSimple = new THREE.MeshBasicMaterial({ map: portSimpleTex });
const bakedSolar = new THREE.MeshBasicMaterial({ map: solarTex });
const bakedSatellite = new THREE.MeshBasicMaterial({ map: satelliteTex });

/**
 * Model
 */

let gltfScene,
  landMesh,
  oceanMesh,
  hydrogenEls,
  hydrogenTurbineEls,
  hydrogenInstanced,
  coniferInstanced,
  palmTreeInstanced,
  turbineEls,
  turbineBaseInstanced,
  turbineBladeInstanced,
  solarInstanced,
  shipEls,
  containerShipInstanced,
  trawlerInstanced,
  cruiseShipInstanced,
  bulkShipInstanced,
  lpgInstanced,
  tankerInstanced,
  portLrgInstanced,
  portSimpleInstanced,
  satelliteInstanced;

const dummy = new THREE.Object3D();

gltfLoader.load("globe_geo.glb", (gltf) => {
  console.log(gltf.scene);
  gltfScene = gltf.scene;

  /**
   * Globe
   */
  landMesh = gltf.scene.getObjectByName("globe_land");
  oceanMesh = gltf.scene.getObjectByName("globe_ocean");

  landMesh.material = bakedLand;
  oceanMesh.material = bakedOcean;

  scene.add(gltf.scene);

  initObjects();
});

function createMasterObj(key, mat) {
  let obj = gltfScene.getObjectByName(key);
  obj.visible = false;
  obj.material = mat;
  return obj;
}
const defaultTransform = new THREE.Matrix4();

function createInstance(masterKey, elsKey, mat, isShip = false) {
  let obj, els, geo, instance;
  // Create the master object to instance
  obj = createMasterObj(masterKey, mat);
  // Store the position placeholders and turn off their visibility
  if (isShip) {
    els = shipEls.filter((el) => el.name.includes(elsKey));
  } else {
    els = gltfScene.getObjectByName(elsKey).children;
  }
  els.forEach((child) => (child.visible = false));
  // clone the mesh geometry
  geo = obj.geometry.clone();
  // create the instance
  instance = new THREE.InstancedMesh(geo, mat, els.length);
  // position the instanced meshes
  els.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    instance.setMatrixAt(i, dummy.matrix);
  });
  scene.add(instance);
  return instance;
}
function initObjects() {
  /**
   * Standard instances
   */
  coniferInstanced = createInstance("conifer_mesh_master", "conifer_trees", bakedConifer);
  palmTreeInstanced = createInstance("palmtree_master", "palm_trees", bakedPalmTree);
  solarInstanced = createInstance("solar_panel_master", "solar_panels", bakedSolar);
  portLrgInstanced = createInstance("port_large_master", "ports_large", bakedPortLrg);
  portSimpleInstanced = createInstance("port_simple_master", "ports_simple", bakedPortSimple);
  satelliteInstanced = createInstance("satellite_master", "satellites", bakedSatellite);

  /**
   * Ships
   */
  shipEls = gltfScene.getObjectByName("ships").children;
  containerShipInstanced = createInstance("container_ship_master", "container", bakedContainerShip, true);
  cruiseShipInstanced = createInstance("cruise_ship_master", "cruise", bakedCruiseShip, true);
  lpgInstanced = createInstance("lpg_master", "LPG", bakedLpg, true);
  tankerInstanced = createInstance("tanker_master", "tanker", bakedTanker, true);
  bulkShipInstanced = createInstance("bulk_carrier_master", "bulk", bakedBulkShip, true);
  trawlerInstanced = createInstance("trawler_master", "trawler", bakedTrawler, true);

  /**
   * Special objects
   */

  const hydrogenMaster = createMasterObj("hydrogen_plant_base_geo", bakedHydrogen);
  const turbineBladeMaster = createMasterObj("turbine_blades_master", bakedTurbineBlade);
  const turbineBaseMaster = createMasterObj("turbine_base_master", bakedTurbineBase);

  /**
   * Placeholders
   */
  hydrogenEls = gltfScene.getObjectByName("hydrogen_plants").children;
  hydrogenEls.forEach((child) => (child.visible = false));

  turbineEls = gltfScene.getObjectByName("turbines_onshore").children;
  turbineEls.push(...gltfScene.getObjectByName("turbines_offshore").children);
  turbineEls.forEach((child) => (child.visible = false));

  const hydrogenGeometry = hydrogenMaster.geometry.clone();
  const turbineBladeGeometry = turbineBladeMaster.geometry.clone();
  const turbineBaseGeometry = turbineBaseMaster.geometry.clone();

  /**
   * Instancing
   */

  const numTurbines = turbineEls.length + hydrogenEls.length * 2;

  hydrogenInstanced = new THREE.InstancedMesh(hydrogenGeometry, bakedHydrogen, hydrogenEls.length);
  turbineBaseInstanced = new THREE.InstancedMesh(turbineBaseGeometry, bakedTurbineBase, numTurbines);
  turbineBladeInstanced = new THREE.InstancedMesh(turbineBladeGeometry, bakedTurbineBlade, numTurbines);

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
    hydrogenTurbineEls.push(mesh, mesh);
  });

  hydrogenTurbineEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    dummy.scale.set(0.25, 0.25, 0.25);
    dummy.translateZ(-0.25);
    dummy.translateY(0.05);
    dummy.translateX(-0.05 - 0.175 * (i % 2));
    dummy.rotateY(-90);
    dummy.updateMatrix();
    turbineBaseInstanced.setMatrixAt(i + turbineEls.length, dummy.matrix);
    dummy.translateY(0.19);
    dummy.translateZ(0.015);
    dummy.updateMatrix();
    turbineBladeInstanced.setMatrixAt(i + turbineEls.length, dummy.matrix);
  });

  scene.add(hydrogenInstanced, turbineBaseInstanced, turbineBladeInstanced);
  tick();
}

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
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;

/* gui.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
}); */

const composer = new EffectComposer(renderer);
composer.setPixelRatio(window.devicePixelRatio);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());

const lutPass = new LUTPass();
composer.addPass(lutPass);

gui.add(params, "enabled");
gui.add(params, "lut", Object.keys(lutMap));
gui.add(params, "intensity").min(0).max(1);

if (renderer.capabilities.isWebGL2) {
  gui.add(params, "use2DLut");
} else {
  params.use2DLut = true;
}

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

  satelliteInstanced.rotation.x += 0.001;

  lutPass.enabled = params.enabled && Boolean(lutMap[params.lut]);
  lutPass.intensity = params.intensity;
  if (lutMap[params.lut]) {
    const lut = lutMap[params.lut];
    lutPass.lut = params.use2DLut ? lut.texture : lut.texture3D;
  }

  // Render
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
