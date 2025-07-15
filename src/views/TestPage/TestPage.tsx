import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// StartRoom 组件及依赖提取到单独文件
// const MODEL_PATH = '/startroom/su7_startroom.raw.glb';
// const TEXTURE_PATHS = [
//   '/startroom/t_startroom_light.raw.jpg',   // lightMap
//   '/startroom/t_startroom_ao.raw.jpg',      // aoMap
//   '/startroom/t_floor_roughness.webp',      // roughnessMap
//   '/startroom/t_floor_normal.webp',         // normalMap
// ];
// function flatModel(scene) {
//   const arr = [];
//   scene.traverse(child => {
//     if (child.isMesh) arr.push(child);
//   });
//   return arr;
// }
// function StartRoom() { ... }

import StartRoom from '../ModelViewer/components/StartRoom';

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
