import BackButton from '@/components/BackButton/BackButton';
import Loading from '@/components/Loading/Loading';
import { MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const SetEnvironment: React.FC = () => {
  const envMap = useLoader(
    RGBELoader,
    // 'https://limengtupian.oss-cn-beijing.aliyuncs.com/a-hdr/golden_gate_hills_1k.hdr'
    '/studio_small_09_2k.hdr'
  );
  const { scene } = useThree();
  React.useEffect(() => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    // scene.environment = envMap;
    // scene.background = envMap;
  }, [envMap, scene]);
  return null;
};

const ModelContent: React.FC = () => {
  const gltf = useLoader(GLTFLoader, '/su7_z.glb');
  // const gltf = useLoader(GLTFLoader, '/oil_can.glb');

  // 设置所有支持 envMapIntensity 的材质
  React.useEffect(() => {
    const { scene } = gltf;
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh && (obj as THREE.Mesh).material) {
        const material = (obj as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((mat) => {
            if ('envMapIntensity' in mat) {
              (mat as THREE.MeshStandardMaterial).envMapIntensity = 2;
              mat.needsUpdate = true;
            }
          });
        } else {
          if ('envMapIntensity' in material) {
            (material as THREE.MeshStandardMaterial).envMapIntensity = 2;
            material.needsUpdate = true;
          }
        }
      }
    });
  }, [gltf]);

  return (
    <>
      <primitive object={gltf.scene} scale={[1, 1, 1]} />
      {/* 镜面反射圆形底座 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <MeshReflectorMaterial
          blur={[12, 4]}
          resolution={512}
          mixBlur={0.5}
          mixStrength={0.8}
          roughness={0.1}
          depthScale={1.2}
          minDepthThreshold={0.8}
          maxDepthThreshold={1.2}
          color="#fff"
          metalness={0.2}
        />
      </mesh>
      <SetEnvironment />
      {/* 球型展厅空间：大球体，内表面为黑色 */}
      <mesh>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial color="black" side={THREE.BackSide} />
      </mesh>
    </>
  );
};

const ModelViewer: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BackButton />
      <Suspense fallback={<Loading />}>
        <Canvas
          camera={{ position: [3, 3, 3], fov: 50 }}
          dpr={[1, 1.5]}
          shadows
        >
          {/* 环境光，柔和整体氛围 */}
          <ambientLight intensity={0.5} />
          {/* 平行光，模拟展厅主灯，带阴影 */}
          <directionalLight
            position={[5, 10, 7]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
          />
          {/* 顶部点光源，模拟聚光灯效果 */}
          <pointLight
            position={[0, 6, 0]}
            intensity={1.5}
            distance={20}
            decay={2}
          />
          {/* 辅助点光源，从不同角度补光 */}
          <pointLight
            position={[5, 2, 5]}
            intensity={0.8}
            distance={15}
            decay={2}
          />
          <pointLight
            position={[-5, 2, 5]}
            intensity={0.8}
            distance={15}
            decay={2}
          />
          <pointLight
            position={[0, 2, -6]}
            intensity={0.7}
            distance={15}
            decay={2}
          />
          {/* 顶部大面积矩形光源，模拟展厅大灯 */}
          <rectAreaLight
            position={[0, 5.5, 0]}
            rotation={[-Math.PI / 2, 0, 0]} // 让光源朝下
            intensity={2}
            width={6}
            height={3}
            color={'#ffffff'}
            castShadow={false}
          />
          <ModelContent />
          <OrbitControls
            target={[0, 0, 0]}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ModelViewer;
