import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React from 'react';
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
    scene.environment = envMap;
    // scene.background = envMap;
  }, [envMap, scene]);
  return null;
};

const ModelViewer: React.FC = () => {
  const gltf = useLoader(GLTFLoader, '/su7.glb');

  // 设置所有支持 envMapIntensity 的材质
  React.useEffect(() => {
    const { scene } = gltf;
    scene.position.set(0, 0, 0);
    scene.rotation.set(0.2, -2.4, 0);
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
    <Canvas camera={{ position: [0, 0, 4] }}>
      <primitive object={gltf.scene} scale={[1, 1, 1]} />
      <SetEnvironment />
      <OrbitControls />
    </Canvas>
  );
};

export default ModelViewer;
