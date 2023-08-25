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
  lut: "Cubicle_99.CUBE",
  intensity: 0.75,
  use2DLut: false,
  scenario: 1,
};

const lutMap = {
  // "Bourbon_64.CUBE": null,
  // "Chemical_168.CUBE": null,
  // "Clayton_33.CUBE": null,
  // "Cubicle_99.CUBE": null,
  // "Remy_24.CUBE": null,
  // "globe_test_01.3DL": null,
  // "globe_test_01.CUBE": null,
  "s1_lut.3DL": null,
  "s3_lut.3DL": null,
  "s4_lut.3DL": null,
  // "Presetpro-Cinematic.3dl": null,
};

const scenarios = {
  1: null,
  2: null,
  3: null,
  4: null,
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

const landTexS1 = textureLoader.load("tex/land_tex_energy-transition.jpg");
const landTexS2 = textureLoader.load("tex/land_tex_tech-driven-transition.jpg");
const landTexS3 = textureLoader.load("tex/land_tex_regionalised-transition.jpg");
const landTexS4 = textureLoader.load("tex/land_tex_delayed-transition.jpg");
const oceanTexS1 = textureLoader.load("tex/ocean_tex_energy-transition.jpg");
const oceanTexS2 = textureLoader.load("tex/ocean_tex_tech-driven-transition.jpg");
const oceanTexS3 = textureLoader.load("tex/ocean_tex_regionalised-transition.jpg");
const oceanTexS4 = textureLoader.load("tex/ocean_tex_delayed-transition.jpg");
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
const droneTex = textureLoader.load("tex/drone_tex.jpg");
const whaleTex = textureLoader.load("tex/whale_tex.jpg");
const dorsalTex = textureLoader.load("tex/dorsal_tex.jpg");
const craneTex = textureLoader.load("tex/crane_tex.jpg");
const fish_farm_tex = textureLoader.load("tex/fish_farm_tex.jpg");
const gullTex = textureLoader.load("tex/gull_tex.jpg");
const highRiseText = textureLoader.load("tex/high_rise_tex.jpg");
const houseTex = textureLoader.load("tex/house_tex.jpg");
const lowRiseTex = textureLoader.load("tex/low_rise_tex.jpg");
const shipyardTex = textureLoader.load("tex/shipyard_tex.jpg");
const skyscraperTex = textureLoader.load("tex/skyscraper_tex.jpg");
const wifiTex = textureLoader.load("tex/wifi_tex.jpg");

const textures = [
  landTexS1,
  landTexS2,
  landTexS3,
  landTexS4,
  oceanTexS1,
  oceanTexS2,
  oceanTexS3,
  oceanTexS4,
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
  droneTex,
  whaleTex,
  dorsalTex,
  craneTex,
  fish_farm_tex,
  gullTex,
  highRiseText,
  houseTex,
  lowRiseTex,
  shipyardTex,
  skyscraperTex,
  wifiTex,
];
textures.forEach((texture) => {
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
});

/**
 * Materials
 */
// Baked material
const bakedLand = new THREE.MeshBasicMaterial();
const bakedOcean = new THREE.MeshBasicMaterial();
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
const bakedDrone = new THREE.MeshBasicMaterial({ map: droneTex });
const bakedWhale = new THREE.MeshBasicMaterial({ map: whaleTex });
const bakedDorsal = new THREE.MeshBasicMaterial({ map: dorsalTex });
const bakedCrane = new THREE.MeshBasicMaterial({ map: craneTex });
const bakedFishFarm = new THREE.MeshBasicMaterial({ map: fish_farm_tex });
const bakedGull = new THREE.MeshBasicMaterial({ map: gullTex });
const bakedHighRise = new THREE.MeshBasicMaterial({ map: highRiseText });
const bakedHouse = new THREE.MeshBasicMaterial({ map: houseTex });
const bakedLowRise = new THREE.MeshBasicMaterial({ map: lowRiseTex });
const bakedShipyard = new THREE.MeshBasicMaterial({ map: shipyardTex });
const bakedSkyscraper = new THREE.MeshBasicMaterial({ map: skyscraperTex });
const bakedWifi = new THREE.MeshBasicMaterial({ map: wifiTex });

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
  satelliteInstanced,
  droneEls,
  droneBladeEls,
  droneInstanced,
  whaleInstanced,
  dorsalInstanced,
  fishInstanced,
  fishFarmInstanced,
  gullInstanced,
  highRiseInstanced,
  houseInstanced,
  lowRiseInstanced,
  shipyardInstanced,
  shipyardEls,
  skyscraperInstanced,
  wifiInstanced,
  wifiEls;

const dummy = new THREE.Object3D();

gltfLoader.load("Globe_Geo.glb", (gltf) => {
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
  houseInstanced = createInstance("house_master", "houses", bakedHouse);
  highRiseInstanced = createInstance("high_rise_master", "high_rises", bakedHighRise);
  lowRiseInstanced = createInstance("low_rise_master", "low_rises", bakedLowRise);
  skyscraperInstanced = createInstance("skyscraper_master", "skyscrapers", bakedSkyscraper);
  whaleInstanced = createInstance("whale_master", "whales", bakedWhale);
  dorsalInstanced = createInstance("dorsal_fin_master", "sharks", bakedDorsal);
  fishInstanced = createInstance("whale_master", "fishes", bakedWhale);
  fishFarmInstanced = createInstance("fish_farm_master", "fish_farm", bakedFishFarm);

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
  const droneMaster = createMasterObj("drone_body_master", bakedDrone);
  const turbineBladeMaster = createMasterObj("turbine_blades_master", bakedTurbineBlade);
  const turbineBaseMaster = createMasterObj("turbine_base_master", bakedTurbineBase);

  /**
   * Placeholders
   */
  hydrogenEls = gltfScene.getObjectByName("hydrogen_plants").children;
  hydrogenEls.forEach((child) => (child.visible = false));

  droneEls = gltfScene.getObjectByName("drones").children;
  droneEls.forEach((child) => (child.visible = false));

  turbineEls = gltfScene.getObjectByName("turbines_onshore").children;
  turbineEls.push(...gltfScene.getObjectByName("turbines_offshore").children);
  turbineEls.forEach((child) => (child.visible = false));

  const hydrogenGeometry = hydrogenMaster.geometry.clone();
  const turbineBladeGeometry = turbineBladeMaster.geometry.clone();
  const turbineBaseGeometry = turbineBaseMaster.geometry.clone();
  const droneGeometry = droneMaster.geometry.clone();

  /**
   * Instancing
   */

  const numTurbines = turbineEls.length + hydrogenEls.length * 2;

  hydrogenInstanced = new THREE.InstancedMesh(hydrogenGeometry, bakedHydrogen, hydrogenEls.length);
  droneInstanced = new THREE.InstancedMesh(droneGeometry, bakedDrone, droneEls.length);
  turbineBaseInstanced = new THREE.InstancedMesh(turbineBaseGeometry, bakedTurbineBase, numTurbines);
  turbineBladeInstanced = new THREE.InstancedMesh(
    turbineBladeGeometry,
    bakedTurbineBlade,
    numTurbines + droneEls.length * 4
  );

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

  droneBladeEls = [];
  droneEls.forEach((mesh, i) => {
    dummy.position.copy(mesh.position);
    dummy.rotation.copy(mesh.rotation);
    dummy.scale.copy(mesh.scale);
    dummy.updateMatrix();
    droneInstanced.setMatrixAt(i, dummy.matrix);
    // x4 blades per drone

    // dummy.updateMatrix();
    for (let j = 0; j < 4; j++) {
      dummy.position.copy(mesh.position);
      dummy.rotation.copy(mesh.rotation);
      dummy.scale.copy(mesh.scale);
      dummy.updateMatrix();
      dummy.scale.set(0.12, 0.12, 0.12);
      if (j == 0) {
        dummy.translateZ(-0.07);
        dummy.translateX(-0.07);
      } else if (j == 1) {
        dummy.translateZ(-0.07);
        dummy.translateX(0.07);
      } else if (j == 2) {
        dummy.translateZ(0.07);
        dummy.translateX(-0.07);
      } else {
        dummy.translateZ(0.07);
        dummy.translateX(0.07);
      }
      dummy.rotateX(90);
      dummy.updateMatrix();
      droneBladeEls.push(dummy.clone());
    }
  });

  droneBladeEls.forEach((dummy, i) => {
    console.log(i, dummy);
    turbineBladeInstanced.setMatrixAt(i + turbineEls.length + hydrogenTurbineEls.length, dummy.matrix);
  });
  console.log(turbineBladeInstanced);
  scene.add(hydrogenInstanced, turbineBaseInstanced, turbineBladeInstanced, droneInstanced);
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

// gui.add(params, "enabled");
// gui.add(params, "lut", Object.keys(lutMap));
// gui.add(params, "intensity").min(0).max(10);
gui.add(params, "scenario", Object.keys(scenarios));

/* if (renderer.capabilities.isWebGL2) {
  gui.add(params, "use2DLut");
} else {
  params.use2DLut = true;
}
 */
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
  for (let i = 0; i < turbineBladeInstanced.count; i++) {
    turbineBladeInstanced.getMatrixAt(i, mat4);
    mat4.decompose(dummy.position, dummy.quaternion, dummy.scale);
    if (i >= turbineEls.length + hydrogenTurbineEls.length) {
      dummy.rotation.z += t * 15;
    } else {
      dummy.rotation.z += t;
    }
    dummy.updateMatrix();

    turbineBladeInstanced.setMatrixAt(i, dummy.matrix);
    turbineBladeInstanced.instanceMatrix.needsUpdate = true;
  }

  satelliteInstanced.rotation.x += 0.001;
  // scamera.rotation.z += 0.01;

  // lutPass.enabled = params.enabled && Boolean(lutMap[params.lut]);
  lutPass.intensity = 0.75;
  /*   if (lutMap[params.lut]) {
    const lut = lutMap[params.lut];
    lutPass.lut = lut.texture3D;
  } */
  if (params.scenario == 1) {
    bakedLand.map = landTexS1;
    bakedOcean.map = oceanTexS1;
    const lut = lutMap["s1_lut.3DL"];
    lutPass.lut = lut.texture3D;
    lutPass.enabled = true;
  }
  if (params.scenario == 2) {
    bakedLand.map = landTexS2;
    bakedOcean.map = oceanTexS2;
    lutPass.enabled = false;
  }
  if (params.scenario == 3) {
    bakedLand.map = landTexS3;
    bakedOcean.map = oceanTexS3;
    const lut = lutMap["s3_lut.3DL"];
    lutPass.lut = lut.texture3D;
    lutPass.enabled = true;
  }
  if (params.scenario == 4) {
    bakedLand.map = landTexS4;
    bakedOcean.map = oceanTexS4;
    const lut = lutMap["s4_lut.3DL"];
    lutPass.lut = lut.texture3D;
    lutPass.enabled = true;
  }

  // Render
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
