import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferAttribute } from "three";
import * as dat from "dat.gui";

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
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

function updateColors() {
  const colors = [];

  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

function generatePlane() {
  updateCompleteMesh();
  updateZMesh();
  updateColors();
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

updateColors();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// replace the canvas in the body with renderer.domElement
document.getElementById("board").replaceWith(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

const mousePosition = {
  x: undefined,
  y: undefined,
};

const animate = () => {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;

  renderer.render(scene, camera);

  raycaster.setFromCamera(mousePosition, camera);

  const intersects = raycaster.intersectObject(planeMesh);

  if (intersects.length > 0) {
    const { color } = (intersects[0].object as THREE.Mesh).geometry.attributes;

    color.setX(intersects[0]?.face?.a, 0.1);
    color.setY(intersects[0]?.face?.a, 0.5);
    color.setZ(intersects[0]?.face?.a, 1);

    // color.setY(intersects[0]?.face?.a, 0);
    color.setX(intersects[0]?.face?.b, 0.1);
    color.setY(intersects[0]?.face?.b, 0.5);
    color.setZ(intersects[0]?.face?.b, 1);

    color.setX(intersects[0]?.face?.c, 0.1);
    color.setY(intersects[0]?.face?.c, 0.5);
    color.setZ(intersects[0]?.face?.c, 1);
    (intersects[0].object as THREE.Mesh).geometry.attributes.color.needsUpdate =
      true;
  }
};

animate();

addEventListener("mousemove", (event) => {
  mousePosition.x = (event.clientX / innerWidth) * 2 - 1;
  mousePosition.y = -(event.clientY / innerHeight) * 2 + 1;
});
