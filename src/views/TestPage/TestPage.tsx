import React, { useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/startroom/su7_startroom.raw.glb';
const TEXTURE_PATHS = [
  '/startroom/t_startroom_light.raw.jpg',   // lightMap
  '/startroom/t_startroom_ao.raw.jpg',      // aoMap
  '/startroom/t_floor_roughness.webp',      // roughnessMap
  '/startroom/t_floor_normal.webp',         // normalMap
];

function flatModel(scene) {
  const arr = [];
  scene.traverse(child => {
    if (child.isMesh) arr.push(child);
  });
  return arr;
}

function StartRoom() {
  // 加载模型（支持 Draco）
  const gltf = useLoader(
    GLTFLoader,
    MODEL_PATH,
    (loader) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);
    }
  );
  // 加载4个纹理贴图
  const textures = useLoader(THREE.TextureLoader, TEXTURE_PATHS);

  useEffect(() => {
    // 参考 vue 逻辑，设置 light mesh 材质属性
    const meshes = flatModel(gltf.scene);
    // 不显示 light 相关 mesh
    meshes.forEach(mesh => {
      if (mesh.name === 'lightTop' || mesh.name.includes('light')) {
        mesh.visible = false;
      }
    });
    // 地板 mesh，按名称查找
    const floor = meshes.find(mesh => mesh.name === 'ReflecFloor');
    if (floor && floor.material) {
      const floorMat = floor.material;
      // 贴图赋值
      floorMat.roughnessMap = textures[2];
      floorMat.normalMap = textures[3];
      floorMat.aoMap = textures[1];
      floorMat.lightMap = textures[0];
      // 常见物理属性设置
      floorMat.roughness = 1;
      floorMat.metalness = 0.1;
      floorMat.normalScale = new THREE.Vector2(1, 1);
      floorMat.aoMapIntensity = 1;
      floorMat.lightMapIntensity = 1;
      floorMat.needsUpdate = true;
    }
    console.log('floor', floor);

    // 同步 startroom.vue 的贴图属性设置
    if (textures[2]) {
      textures[2].colorSpace = THREE.LinearSRGBColorSpace;
      textures[2].wrapS = textures[2].wrapT = THREE.RepeatWrapping;
    }
    if (textures[3]) {
      textures[3].colorSpace = THREE.LinearSRGBColorSpace;
      textures[3].wrapS = textures[3].wrapT = THREE.RepeatWrapping;
    }
    if (textures[1]) {
      textures[1].flipY = false;
      textures[1].channel = 1;
      textures[1].colorSpace = THREE.LinearSRGBColorSpace;
    }
    if (textures[0]) {
      textures[0].channel = 1;
      textures[0].flipY = false;
      textures[0].colorSpace = THREE.SRGBColorSpace;
    }
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

const TestPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 2, 16], fov: 50 }}
        style={{ background: '#000', width: '100vw', height: '100vh' }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color('#000');
        }}
      >
        <StartRoom />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default TestPage;
