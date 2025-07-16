import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// @ts-expect-error Vite/webpack 需要 raw-loader 支持 glsl 导入
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
  const materialRef = useRef<any>(null);
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
    }
  });
  // 圆柱体参数，可根据需要调整
  const radius = 3; // 半径
  const height = 12; // 高度
  const radialSegments = 128; // 圆周分段数，越大越圆滑
  const heightSegments = 1;
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry
        args={[radius, radius, height, radialSegments, heightSegments, true]} // true: openEnded
      />
      <speedupMaterial
        ref={materialRef}
        uSpeedFactor={1.0}
        side={THREE.DoubleSide} // 让材质渲染在内壁
        transparent
      />
    </mesh>
  );
};

export default Speedup; 