import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame, extend } from '@react-three/fiber';
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

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      materialRef.current.uSpeedFactor = 1.0;
    }
  });

  useEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = materialRef.current;
      }
    });
  }, [gltf]);

  return (
    <>
      <group position={[0, -3, 0]} rotation={[0, Math.PI , 0]}>
        <primitive object={gltf.scene} />
        <speedupMaterial ref={materialRef} uSpeedFactor={1.0} side={THREE.DoubleSide} transparent />
      </group>
    </>
  );
};

export default SpeedupModel; 