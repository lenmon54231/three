import React, { Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { TextureLoader, MeshStandardMaterial, Mesh, Object3D, Texture, Color } from 'three';

const AO_TEXTURE_PATH = '/su7_car/t_car_body_AO.raw.jpg';
const MAP1_TEXTURE_PATH = '/su7_car/t_cat_car_body_bc.webp';
const MAP2_TEXTURE_PATH = '/su7_car/t_gm_car_body_bc.webp';

const SimpleModel: React.FC = () => {
  const gltf = useLoader(
    GLTFLoader,
    '/su7_car/sm_car.gltf',
    (loader) => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  );
  const [aoMap, map1, map2] = useLoader(TextureLoader, [AO_TEXTURE_PATH, MAP1_TEXTURE_PATH, MAP2_TEXTURE_PATH]);
  useEffect(() => {
    [aoMap, map1, map2].forEach((tex) => {
      tex.flipY = false;
      if ('colorSpace' in tex) {
        (tex as Texture).colorSpace = 'srgb';
      }
      tex.needsUpdate = true;
    });
    gltf.scene.traverse((obj: Object3D) => {
      if ((obj as Mesh).isMesh && (obj as Mesh).material) {
        const mesh = obj as Mesh;
        if (!mesh.geometry.attributes.uv2 && mesh.geometry.attributes.uv) {
          mesh.geometry.setAttribute('uv2', mesh.geometry.attributes.uv);
        }
        const mats: MeshStandardMaterial[] = Array.isArray(mesh.material)
          ? mesh.material as MeshStandardMaterial[]
          : [mesh.material as MeshStandardMaterial];
        mats.forEach((mat) => {
          mat.aoMap = aoMap;
          if (mat.name === 'Car_body') {
            mat.map = map1;
            mat.color = new Color('#26d6e9');
            mat.envMapIntensity = 4;
          }
          (['map', 'aoMap', 'normalMap', 'roughnessMap', 'metalnessMap'] as const).forEach((key) => {
            if (mat[key]) {
              mat[key]!.flipY = false;
              (mat[key] as Texture).needsUpdate = true;
            }
          });
        });
      }
    });
  }, [gltf, aoMap, map1, map2]);
  return <primitive object={gltf.scene} scale={1} />;
};

const TestPage: React.FC = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }} shadows>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 7]} intensity={2.5} castShadow />
      <directionalLight position={[-5, 5, -7]} intensity={1.2} />
      <Suspense fallback={null}>
        <SimpleModel />
      </Suspense>
    </Canvas>
  </div>
);

export default TestPage;
