import React, { useRef, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
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

interface SpeedupModelProps {
  gltf: any;
}

const SpeedupModel: React.FC<SpeedupModelProps> = ({ gltf }) => {
  const materialRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      materialRef.current.uSpeedFactor = 1.0;
    }
  });

  useEffect(() => {
    if (!gltf) return;
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = materialRef.current;
      }
    });
  }, [gltf]);

  if (!gltf) return null;

  return (
    <group position={[0, -3, 0]} rotation={[0, Math.PI, 0]}>
      <primitive object={gltf.scene} />
      <speedupMaterial ref={materialRef} uSpeedFactor={1.0} side={THREE.DoubleSide} transparent />
    </group>
  );
};

export default SpeedupModel; 