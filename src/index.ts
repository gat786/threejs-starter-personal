import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferAttribute } from "three";
import * as dat from "dat.gui";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

const gui = new dat.GUI();
const world = {
  plane: {
    width: 10,
    height: 10,
    heightSegments: 10,
    widthSegments: 10,
  },
};

function updateZMesh() {
  const { array } = planeMesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    planeMesh.geometry.attributes.position.setZ(i + 2, z + Math.random());
  }
}

function updateCompleteMesh() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );
}

function generatePlane() {
  updateCompleteMesh();
  updateZMesh();
}

gui.add(world.plane, "width", 1, 20).onChange(generatePlane);

gui.add(world.plane, "height", 1, 20).onChange(generatePlane);

gui.add(world.plane, "heightSegments", 1, 50).onChange(generatePlane);

gui.add(world.plane, "widthSegments", 1, 50).onChange(generatePlane);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 10);
scene.add(light);

camera.position.z = 10;

updateZMesh();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// replace the canvas in the body with renderer.domElement
document.getElementById("board").replaceWith(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

const animate = () => {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;

  renderer.render(scene, camera);
};

animate();
