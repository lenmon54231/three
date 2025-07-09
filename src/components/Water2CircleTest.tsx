import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Water2Circle } from './Water2Circle';

const Water2CircleTest: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222' }}>
      <Suspense fallback={<div style={{color:'#fff',position:'absolute',left:20,top:20}}>Loading...</div>}>
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }} shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 7]} intensity={1} />
          <Water2Circle radius={3.2} position={[0, 0, 0]} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Water2CircleTest; 