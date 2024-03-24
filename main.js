import * as THREE from "three";
import { gsap } from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  100,
  innerWidth / innerHeight,
  1,
  1000
);
// Khởi tạo OrbitControls
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  depth: true,
  premultipliedAlpha: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// scene.add(new THREE.GridHelper(5, 5));
// Default scene scale
const zoomScale = 2.2;
scene.scale.set(zoomScale, zoomScale, zoomScale);

camera.position.set(0, 39.5, 70);
function handleCameraZoom(value, duration) {
  const startZoom = camera.zoom;
  const targetZoom = value;
  const startTime = Date.now();

  function animateZoom() {
    const now = Date.now();
    const elapsedTime = now - startTime;
    const t = Math.min(1, elapsedTime / duration); // Đảm bảo t không vượt quá 1
    const zoom = startZoom + (targetZoom - startZoom) * t;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    if (t < 1) {
      requestAnimationFrame(animateZoom);
    }
  }

  animateZoom();
}
// Default Camera
camera.zoom = 12;
camera.updateProjectionMatrix();
const boxWidth = 5.53;
const boxHeight = boxWidth / (16 / 9);
const loader = new THREE.TextureLoader();
function createCube(x, y, z, rotationY) {
  return new Promise((resolve) => {
    loader.load("./img/placehoder.jpg", (texture) => {
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 0.05);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, y, z);
      cube.rotation.y = rotationY;
      scene.add(cube);
      resolve(cube);
    });
  });
}
var objPerTurn = 15; // Số lượng mỗi tầng
var angleStep = (Math.PI * 2) / objPerTurn;
var heightStep = 6;
var radius = 1.3; // Thay đổi bán kính cho phù hợp với Spiral

const spiralRadius = radius * 10;
// Tạo các cube với vị trí đối xứng
function renderCube() {
  let promises = [];
  for (let i = 1; i <= 5; i++) {
    for (let j = 0; j < 15; j++) {
      let spiralHeight = i * heightStep;
      promises.push(
        createCube(
          Math.cos(angleStep * j) * spiralRadius,
          spiralHeight,
          Math.sin(angleStep * j) * spiralRadius,
          -angleStep * j + Math.PI / 2
        )
      );
    }
  }
  return Promise.all(promises);
}

// // Get the button element
const btnOnStart = document.getElementById("onStart");
// const btnOnLoadTexture = document.getElementById("onLoadTexture");
// const btnOnApplyTexture = document.getElementById("onApplyTexture");
// // Add click event listener
btnOnStart?.addEventListener("click", function (event) {
  onStart();
});
// btnOnLoadTexture?.addEventListener("click", async () => {
//   onLoadTexture();
// });
// btnOnApplyTexture?.addEventListener("click", async () => {
//   onApplyTexture();
// });

let cubeList = [];
const texturePaths = []; // Khởi tạo mảng đường dẫn textures
// Tạo mảng đường dẫn textures
for (let i = 1; i <= 17; i++) {
  texturePaths.push(`./img/img_${i}.jpg`);
}
const textures = [];

function onStart() {
  return renderCube().then((cubes) => {
    cubeList = cubes;
    startRendering();
  });
}
async function onLoadTexture() {
  const promises = texturePaths.map(
    (path) =>
      new Promise((resolve) => {
        loader.load(path, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          textures.push(texture);
          resolve();
        });
      })
  );
  return Promise.all(promises);
}
function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
async function onApplyTexture() {
  console.log("onApplyTexture");
  // Xáo trộn ngẫu nhiên các index của cubeList
  const shuffledIndices = [...Array(cubeList.length).keys()].sort(
    () => Math.random() - 0.5
  );

  // Xử lý từng chunk của 4 cube một lần
  for (let i = 0; i < shuffledIndices.length; i += 4) {
    for (let j = i; j < i + 4 && j < shuffledIndices.length; j++) {
      const randomIndex = shuffledIndices[j];
      const textureIndex = randomIndex % textures.length;
      const texture = textures[textureIndex];
      applyTextureWithEffect(cubeList[randomIndex], texture);
    }
    // Nếu không phải là chunk cuối cùng (nhỏ hơn 4 cubes), chờ đợi 50ms
    if (i + 4 < shuffledIndices.length) {
      await delay(50);
    }
  }
}

function applyTextureWithEffect(cube, texture) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, // Cho phép material có độ trong suốt
    opacity: 0, // Bắt đầu với độ trong suốt là 0
    side: THREE.DoubleSide,
  });
  cube.material = material;
  // Tạo hiệu ứng fade-in cho texture
  gsap.to(material, {
    opacity: 1, // Đưa độ trong suốt về 1
    duration: 0.5, // Thời gian chuyển đổi là 0.5 giây
    ease: "power2.out", // Loại easing cho hiệu ứng
  });
}

// window?.addEventListener("resize", onWindowResize, false);
var autoRotateSpeed = 0.001; // Tốc độ tự xoay
var isAutoRotate = true;
function autoRotate() {
  // Tự xoay scene mỗi frame
  if (isAutoRotate) {
    if (scene.rotation.y + autoRotateSpeed > Math.PI * 2) {
      scene.rotation.y = 0;
    } else {
      scene.rotation.y += autoRotateSpeed;
    }
  }
}
// Hàm render sẽ tự động gọi autoRotate mỗi frame
function render() {
  autoRotate();
  //   handleScenePositionChange();
  renderer.render(scene, camera);
}
// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   const zoomValue = (window.innerWidth / 1680) * 4;
//   camera.zoom = zoomValue;
//   camera.updateProjectionMatrix();
//   innerWidth = window.innerWidth;
//   innerHeight = window.innerHeight;
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   render();
// }

function startRendering() {
  renderer.setAnimationLoop(render);
  const zoomValue = (window.innerWidth / 1680) * 4;
  animateMaterialOpacity(1);
  gsap.to(camera, {
    zoom: zoomValue, // Giá trị zoom mục tiêu
    duration: 2.5, // Thời lượng hiệu ứng
    onUpdate: () => camera.updateProjectionMatrix(), // Cập nhật ma trận chiếu sau mỗi bước cập nhật
    ease: "elastic.out(1,0.5)", // Loại easing cho hiệu ứng
    delay: 0.2,
  });
}
// START
// const videoIntro = document.getElementById("videoIntro");
// videoIntro.addEventListener("ended", function () {
//   console.log("Video Intro Ended");
// });
// setTimeout(() => {
//   videoIntro.hidden = true;
//   onStart().then(() => {
//     // onStart đã hoàn thành, tiếp theo gọi onLoadTexture
//     setTimeout(() => {
//       onLoadTexture().then(() => {
//         // Tất cả texture đã được load, tiếp theo gọi onApplyTexture
//         setTimeout(() => {
//           onApplyTexture();
//         }, 500);
//       });
//     }, 1000);
//   });
// }, 3700);
onStart().then(() => {
  // onStart đã hoàn thành, tiếp theo gọi onLoadTexture
  setTimeout(() => {
    onLoadTexture().then(() => {
      // Tất cả texture đã được load, tiếp theo gọi onApplyTexture
      setTimeout(() => {
        onApplyTexture();
      }, 500);
    });
  }, 1000);
});
function animateMaterialOpacity(duration) {
  scene.traverse(function (object) {
    if (object.material) {
      // Đảm bảo material là transparent và bắt đầu từ độ trong suốt là 0
      object.material.needsUpdate = true;
      // Tạo hiệu ứng fade in từ 0 đến 1
      gsap.to(object.material, {
        opacity: 1,
        duration: duration,
        ease: "power1.inOut",
      });
    }
  });
}
const btnOnTestFunction = document.getElementById("onTestFunction");
btnOnTestFunction?.addEventListener("click", function (event) {
  console.log("onTestFunction");
  animateMaterialOpacity(2);
});

// ================================================================================================
// ===================================== THÊM CÁC EVENT MOUSE =====================================
// ================================================================================================

let isDragging = false;
let previousMousePosition = {
  x: 0,
  y: 0,
};

const onMouseDown = (event) => {
  isDragging = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
};
let totalRotation = scene.rotation.y;

const onMouseMove = (event) => {
  if (isDragging) {
    gsap.killTweensOf(scene.rotation);
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 5) {
      const oldRotationY = scene.rotation.y;
      let valueRotationY = deltaX * 0.2;
      if (oldRotationY + valueRotationY > Math.PI * 2) {
        valueRotationY = Math.PI * 2 - oldRotationY;
        gsap.to(scene.rotation, {
          duration: 2,
          y: `+=${valueRotationY}`,
          ease: "power2.out",
        });
      } else {
        gsap.to(scene.rotation, {
          duration: 2,
          y: `+=${valueRotationY}`,
          ease: "power2.out",
        });
      }
      gsap.to(scene.position, {
        duration: 2,
        y: `-=${deltaY * 0.5}`,
        ease: "power2.out",
      });
    }
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }
};

const onMouseUp = () => {
  isDragging = false;
};

// Thêm sự kiện vào renderer.domElement
document.addEventListener("mousedown", onMouseDown, false);
document.addEventListener("mousemove", onMouseMove, false);
document.addEventListener("mouseup", onMouseUp, false);
document.addEventListener("mouseleave", onMouseUp, false);
