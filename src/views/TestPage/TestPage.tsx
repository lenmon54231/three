import { MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import React, { Suspense } from 'react';
import { GLTFLoader } from 'three-stdlib';

const OilCanModel: React.FC = () => {
  // const gltf = useLoader(GLTFLoader, '/oil_can.glb');
  const gltf = useLoader(GLTFLoader, '/su7_z.glb');
  return <primitive object={gltf.scene} scale={1} />;
};

const ReflectiveFloor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <circleGeometry args={[4, 64]} />
    <MeshReflectorMaterial
      blur={[40, 8]}
      resolution={1024}
      mixBlur={0.7}
      mixStrength={1.2}
      roughness={0.05}
      depthScale={1.2}
      minDepthThreshold={0.8}
      maxDepthThreshold={1.2}
      color="#fff"
      metalness={0.3}
    />
  </mesh>
);

const TestPage: React.FC = () => (
  <div className="w-full h-screen flex items-center justify-center bg-gray-50">
    <div className="w-[70vw] h-[70vh] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <OilCanModel />
          <ReflectiveFloor />
        </Suspense>
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  </div>
);

export default TestPage;
