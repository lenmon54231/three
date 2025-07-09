import React from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { MeshReflectorMaterial } from '@react-three/drei';
import { Water2Circle } from '@/components/Water2Circle';
import hdr from '@/assets/hdr/studio_small_08_1k.hdr';
import { TextureLoader } from 'three';

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

const AO_TEXTURE_PATH = '/su7_car/t_car_body_AO.raw.jpg';

function flatModel(scene: THREE.Object3D): THREE.Mesh[] {
  const modelArr: THREE.Mesh[] = [];
  scene.traverse((child) => {
    modelArr.push(child as THREE.Mesh);
  });
  return modelArr;
}

const ModelContent: React.FC<{
  isTopView?: boolean;
  waterNormals: THREE.Texture;
  carColor: string;
}> = ({ isTopView, waterNormals, carColor }) => {
  const gltf = useLoader(
    GLTFLoader,
    '/su7_car/sm_car.gltf',
    (loader) => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  );
  const aoMap = useLoader(TextureLoader, AO_TEXTURE_PATH);
  aoMap.channel = 1;
  aoMap.flipY = false;
  React.useEffect(() => {
    const meshes = flatModel(gltf.scene);
    const body = meshes[2] as THREE.Mesh;
    const bodyMat = body.material as THREE.MeshStandardMaterial;
    bodyMat.envMapIntensity = 4;
    bodyMat.color = new THREE.Color(carColor);
    meshes.forEach((mesh) => {
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.aoMap = aoMap;
      }
    });
  }, [gltf, aoMap, carColor]);
  return (
    <>
      <group>
        <primitive object={gltf.scene} scale={[1, 1, 1]} />
      </group>
      {/* 镜面反射圆形底座/水波纹底座（条件渲染，避免 geometry 冲突） */}
      {isTopView ? (
        <Water2Circle radius={3.2} waterNormals={waterNormals} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[3.2, 64]} />
          <MeshReflectorMaterial
            blur={[2, 1]}
            resolution={512}
            mixBlur={0.2}
            mixStrength={0.5}
            roughness={0.5}
            depthScale={0.5}
            minDepthThreshold={0.9}
            maxDepthThreshold={1.1}
            color="#fff"
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <SetEnvironment />
      {/* 球型展厅空间：大球体，内表面为黑色 */}
      <mesh>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial color="black" side={THREE.BackSide} />
      </mesh>
    </>
  );
};

export default ModelContent; 