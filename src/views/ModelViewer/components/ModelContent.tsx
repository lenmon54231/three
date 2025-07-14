import React from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import hdr from '@/assets/hdr/studio_small_08_1k.hdr';
import { TextureLoader } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { Water } from 'three-stdlib';
import { extend } from '@react-three/fiber';

extend({ Water });

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

interface ModelContentProps {
  isTopView?: boolean;
  waterNormals: THREE.Texture;
  carColor: string;
  startAnim?: boolean;
  animDone?: boolean;
}

const ModelContent: React.FC<ModelContentProps> = ({ waterNormals, carColor, startAnim = false }) => {
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

  // 入场运镜动画
  const { rotY } = useSpring({
    rotY: startAnim ? -Math.PI * 8 / 13 : -Math.PI * 3 / 4,
    from: { rotY: -Math.PI * 3 / 4 },
    config: { mass: 1.5, tension: 40, friction: 40 },
    delay: 0,
  });

  // 长方形底座渐变贴图
  function createRectGradientTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    // 横向渐变，中心亮，边缘暗
    const gradient = ctx.createLinearGradient(0, size / 2, size * 2, size / 2);
    gradient.addColorStop(0, '#181a22');
    gradient.addColorStop(0.5, '#3a4a6a');
    gradient.addColorStop(1, '#181a22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size * 2, size);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
 
  // 长方形水面对象，始终 useMemo
  const planeWater: any = React.useMemo(() => {
    const gradTex = createRectGradientTexture(512);
    return new (Water as any)(
      new THREE.PlaneGeometry(5, 2, 128, 128),
      {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals,
        sunDirection: new THREE.Vector3(1, 1, 1),
        sunColor: 0x222233, // 更暗
        waterColor: 0x181a22, // 更暗
        distortionScale: 2.2,
        fog: false,
        format: 3001,
        map: gradTex, // 叠加暗色渐变贴图
        alpha: 0.98,
      } as any
    );
  }, [waterNormals]);

  // 长方形底座颜色渐变动画
  const { color: waterColorSpring } = useSpring({
    color: startAnim ? '#2B95AB' : '#181a22', // 可自定义目标色
    config: { duration: 1000 },
  });

  // 同步 spring color 到 planeWater 的 waterColor
  useFrame(() => {
    if (
      planeWater &&
      planeWater.material &&
      planeWater.material.uniforms &&
      planeWater.material.uniforms.waterColor
    ) {
      planeWater.material.uniforms.waterColor.value.set(waterColorSpring.get());
    }
  });

  // 长方形底座入场缩放动画
  const rectBaseSpring = useSpring({
    scale: startAnim ? 10 : 0,
    config: { tension: 120, friction: 30 },
    delay: 200, // 可选，延迟动画
  });

  return (
    <>
      <animated.group rotation-y={rotY}>
        <animated.primitive object={gltf.scene} scale={[1, 1, 1]} />
        {/* 只保留长方形底座，入场缩放动画 */}
        <animated.group scale={rectBaseSpring.scale}>
          <primitive
            object={planeWater}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
          />
        </animated.group>
      </animated.group>
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