import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { shaderMaterial } from '@react-three/drei';

// @ts-expect-error: raw-loader glsl import for shader
import vertexShader from '@/assets/shaders/speedup.vert';
import speedupFrag from '@/assets/shaders/speedup.frag.ts';

const SpeedupMaterial = shaderMaterial(
  { uTime: 0, uSpeedFactor: 1.0 },
  vertexShader,
  speedupFrag
);
extend({ SpeedupMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      speedupMaterial: any;
    }
  }
}

const SpeedupModel: React.FC = () => {
  const gltf = useLoader(
    GLTFLoader,
    '/su7_car/sm_speedup.gltf',
    loader => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  );
  const materialRef = useRef<any>(null);

  // 动画驱动 uTime
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      materialRef.current.uSpeedFactor = 1.0;
    }
  });

  // 替换所有 mesh 的材质
  useEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = materialRef.current;
      }
    });
  }, [gltf]);

  return (
    <>
      <primitive object={gltf.scene} />
      <speedupMaterial ref={materialRef} uSpeedFactor={1.0} side={THREE.DoubleSide} transparent />
    </>
  );
};

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
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <SpeedupModel />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default TestPage;
