import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  100,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
// renderer.physicallyCorregLights = true;
renderer.outputEncoding = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);

document.body.appendChild(renderer.domElement);
const boxWidth = 5.53;
const boxHeight = boxWidth / (16 / 9);
const loader = new THREE.TextureLoader();

const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 1, 10, 10, 10);
loader.load(`./img/img_12_thumb.jpeg`, (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  var newMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const cube = new THREE.Mesh(geometry, newMaterial);
  scene.add(cube);
});

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
