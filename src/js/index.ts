import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferAttribute } from "three";
import * as dat from "dat.gui";
import gsap from "gsap";

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    heightSegments: 50,
    widthSegments: 50,
  },
};

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);

const planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

let randomValues = [];

function updateZMesh(args: { generateRandomValues?: boolean }) {
  const { array } = planeMesh.geometry.attributes.position as any;

  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + Math.random() * 3;
    }
    if (args?.generateRandomValues) {
      randomValues.push(Math.random() * Math.PI * 2);
    }
  }
}

// create original position array equal to position array
(planeMesh.geometry.attributes.position as any).originalPosition =
  planeMesh.geometry.attributes.position.array;

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
  updateZMesh({});
  updateColors();
}

gui.add(world.plane, "width", 1, 600).onChange(generatePlane);

gui.add(world.plane, "height", 1, 600).onChange(generatePlane);

gui.add(world.plane, "heightSegments", 1, 100).onChange(generatePlane);

gui.add(world.plane, "widthSegments", 1, 100).onChange(generatePlane);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 40);
scene.add(light);

camera.position.z = 50;

updateZMesh({ generateRandomValues: true });

// append the generated random values to planeMesh
(planeMesh.geometry.attributes.position as any).randomValues = randomValues;

console.log(planeMesh.geometry.attributes.position);

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

let frame = 0;

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  frame += 0.01;

  const { array, originalPosition, randomValues } = planeMesh.geometry
    .attributes.position as any;

  for (let i = 0; i < array.length; i += 3) {
    // x coordinate
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
    // y coordinate
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  // raycaster add hover color and remove on hoverend
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

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        color.setX(intersects[0]?.face?.a, hoverColor.r);
        color.setY(intersects[0]?.face?.a, hoverColor.g);
        color.setZ(intersects[0]?.face?.a, hoverColor.b);

        // color.setY(intersects[0]?.face?.a, 0);
        color.setX(intersects[0]?.face?.b, hoverColor.r);
        color.setY(intersects[0]?.face?.b, hoverColor.g);
        color.setZ(intersects[0]?.face?.b, hoverColor.b);

        color.setX(intersects[0]?.face?.c, hoverColor.r);
        color.setY(intersects[0]?.face?.c, hoverColor.g);
        color.setZ(intersects[0]?.face?.c, hoverColor.b);
      },
    });
  }
};

animate();

addEventListener("mousemove", (event) => {
  mousePosition.x = (event.clientX / innerWidth) * 2 - 1;
  mousePosition.y = -(event.clientY / innerHeight) * 2 + 1;
});

addEventListener("resize", (event) => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.innerWidth / window.innerHeight);
  renderer.autoClear = true;
});
