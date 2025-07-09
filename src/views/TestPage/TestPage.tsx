import React, { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const CarModel: React.FC = () => {
  const gltf = useLoader(
    GLTFLoader,
    '/su7_car/sm_car.gltf',
    (loader) => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  );
  // 只加载 gltf，不做任何材质或贴图干预
  return <primitive object={gltf.scene} />;
};

const TestPage: React.FC = () => {
  const [run, setRun] = useState(false);
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', zIndex: 10, left: 20, top: 20, background: '#fff', padding: 12, borderRadius: 8 }}>
        <button onClick={() => setRun((r) => !r)} style={{ marginRight: 12 }}>{run ? '停止轮胎动画' : '启动轮胎动画'}</button>
      </div>
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }} shadows>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 7]} intensity={2.5} castShadow />
        <directionalLight position={[-5, 5, -7]} intensity={1.2} />
        <Suspense fallback={null}>
          <CarModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default TestPage;
