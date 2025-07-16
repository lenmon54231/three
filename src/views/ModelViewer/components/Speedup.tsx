import React, { useRef, useEffect } from 'react';
import { useLoader, extend } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
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

const Speedup: React.FC = () => {
  const gltf = useLoader(GLTFLoader, '/su7_car/sm_speedup.gltf');
  const materialRef = useRef<any>(null);

  // 动画驱动 uTime
  useEffect(() => {
    let frameId: number;
    const animate = (time: number) => {
      if (materialRef.current) {
        materialRef.current.uTime = time * 0.001;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 替换目标 mesh 的材质
  useEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 'red' });
      }
    });
  }, [gltf]);

  return <primitive object={gltf.scene} />;
};

export default Speedup; 