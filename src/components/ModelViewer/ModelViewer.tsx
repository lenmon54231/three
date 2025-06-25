import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelViewer: React.FC = () => {
  const gltf = useLoader(GLTFLoader, '/su7.glb'); // 替换为你的 GLB 模型路径
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive object={gltf.scene} scale={[0.5, 0.5, 0.5]} />
      <OrbitControls />
    </Canvas>
  );
};

export default ModelViewer;
