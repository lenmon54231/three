import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// @ts-expect-error Vite/webpack 需要 raw-loader 支持 glsl 导入
import vertexShader from '@/assets/shaders/speedup.vert';
 // import fragmentShader from '@/assets/shaders/speedup.frag';
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
  return (
    <mesh position={[0, 1, 0]}>
      <planeGeometry args={[4, 2]} />
      <speedupMaterial ref={materialRef} uSpeedFactor={1.0} />
    </mesh>
  );
};

export default Speedup; 