import BackButton from '@/components/BackButton/BackButton';
import Loading from '@/components/Loading/Loading';
import { MeshReflectorMaterial, OrbitControls, Stats } from '@react-three/drei';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import ExhibitionLights from './components/ExhibitionLights';
import Lightformer from '@/components/Lightformer/Lightformer';
import ColorButtons from './components/ColorButtons';
import hdr from '@/assets/hdr/studio_small_08_1k.hdr';
import modal from '@/assets/modal/su7_z.glb';
import CustomStats from '@/components/CustomStats/CustomStats';

const SetEnvironment: React.FC = () => {
  const envMap = useLoader(RGBELoader, hdr);
  const { scene } = useThree();
  React.useEffect(() => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envMap;
    // scene.background = envMap;
  }, [envMap, scene]);
  return null;
};

const ModelContent: React.FC<{
  onMaterialsReady?: (mats: THREE.MeshStandardMaterial[]) => void;
}> = ({ onMaterialsReady }) => {
  const gltf = useLoader(GLTFLoader, modal);
  const groupRef = React.useRef<THREE.Group>(null);
  const colorMaterials = React.useRef<THREE.MeshStandardMaterial[]>([]);

  // 设置所有支持 envMapIntensity 的材质，并收集可变色材质
  React.useEffect(() => {
    const { scene } = gltf;
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    colorMaterials.current = [];
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh && (obj as THREE.Mesh).material) {
        const material = (obj as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((mat) => {
            if (typeof mat.name === 'string' && mat.name.startsWith('Car_')) {
              colorMaterials.current.push(mat as THREE.MeshStandardMaterial);
            }
          });
        } else {
          if (typeof material.name === 'string' && material.name.startsWith('Car_')) {
            colorMaterials.current.push(material as THREE.MeshStandardMaterial);
          }
        }
      }
    });
    if (onMaterialsReady) {
      onMaterialsReady(colorMaterials.current);
    }
  }, [gltf, onMaterialsReady]);

  return (
    <>
      <group ref={groupRef}>
        <primitive object={gltf.scene} scale={[1, 1, 1]} />
      </group>
      {/* 镜面反射圆形底座 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 64]} />
        <MeshReflectorMaterial
           blur={[8, 2]}
           resolution={512}
           mixBlur={0.2}
           mixStrength={0.5}
           roughness={0.2}
           depthScale={0.5}
           minDepthThreshold={0.9}
           maxDepthThreshold={1.1}
           color="#fff"
           metalness={0.1}
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
  const [materials, setMaterials] = React.useState<
    THREE.MeshStandardMaterial[]
  >([]);

  // 换色函数
  const handleChangeColor = (color: string) => {
    materials.forEach((mat) => {
      mat.color.set(color);
      mat.needsUpdate = true;
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BackButton />
      {/* 换色按钮 */}
      <ColorButtons onChange={handleChangeColor} />
      <Suspense fallback={<Loading />}>
        <Canvas
          camera={{ position: [3, 3, 3], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
        >
          <ExhibitionLights />
          {/* 顶部光照 Lightformer，模拟 su7.vue 效果 */}
          <Lightformer
            intensity={6}
            from="rect"
            position={[0, 2.4, 0]}
            scale={[4, 2, 2]}
            color="#fff"
            rotation={[Math.PI / 2, 0, 0]}
          />
          <ModelContent onMaterialsReady={setMaterials} />
          <OrbitControls
            target={[0, 0, 0]}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </Suspense>
      <div className="fixed left-2 bottom-2 z-[10000] opacity-90">
        <CustomStats />
      </div>
    </div>
  );
};

export default ModelViewer;
