import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import hdr from '@/assets/hdr/evening_museum_courtyard_1k.hdr';
import { TextureLoader } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { Water } from 'three-stdlib';
import { extend } from '@react-three/fiber';
import StartRoom from './StartRoom';
// import RectWaterBase from './RectWaterBase';
import Speedup from './Speedup';

extend({ Water });

const SetEnvironment: React.FC<{ envMap: THREE.Texture, gltfScene: THREE.Object3D }> = ({ envMap, gltfScene }) => {
  React.useEffect(() => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    gltfScene.traverse((child: any) => {
      if (child.isMesh && child.material && 'envMap' in child.material) {
        // 只给 mesh 设置环境贴图，不替换材质类型
        child.material.envMap = envMap;
        child.material.envMapIntensity = 1.5;
        child.material.needsUpdate = true;
      }
    });
  }, [envMap, gltfScene]);
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
  // waterNormals: THREE.Texture; // 已不再使用
  carColor: string;
  startAnim?: boolean;
  animDone?: boolean;
}

const ModelContent: React.FC<ModelContentProps> = ({ carColor, startAnim = false }) => {
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
  // 加载环境贴图
  const envMap = useLoader(RGBELoader, hdr);
  const { camera } = useThree();
  const wheelMeshesRef = useRef<THREE.Mesh[]>([]);
  const [isWheelsRotating, setIsWheelsRotating] = useState(false);
  const [showSpeedup, setShowSpeedup] = useState(false);

  // 相机动画 spring
  const [cameraSpring, api] = useSpring(() => ({
    camPos: [camera.position.x, camera.position.y, camera.position.z],
    config: { mass: 1, tension: 120, friction: 32 },
  }));

  // 监听鼠标滚轮下滑事件
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        setIsWheelsRotating(true);
      }
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // 监听 isWheelsRotating 变化，触发相机动画
  useEffect(() => {
    if (isWheelsRotating) {
      api.start({
        camPos: [0, 2, -6],
        from: { camPos: [camera.position.x, camera.position.y, camera.position.z] },
      });
    }
  }, [isWheelsRotating, api, camera]);

  // 在 useFrame 中同步 spring 到 camera
  useFrame(() => {
    if (isWheelsRotating) {
      const pos = cameraSpring.camPos.get();
      camera.position.set(pos[0], pos[1], pos[2]);
      camera.lookAt(0, 0, 0);
    }
  });

  React.useEffect(() => {
    const meshes = flatModel(gltf.scene);
    const body = meshes[2] as THREE.Mesh;
    if (body && body.material) {
      (body.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(carColor);
      (body.material as THREE.MeshPhysicalMaterial).needsUpdate = true;
    }
    meshes.forEach((mesh) => {
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.aoMap = aoMap;
      }
    });
    // 只选中名称为 'Wheel001' 和 'Wheel002' 的 mesh
    wheelMeshesRef.current = meshes.filter(mesh => mesh.name === 'Wheel001' || mesh.name === 'Wheel002');
  }, [gltf, aoMap, carColor]);

  // 让 Wheel001 和 Wheel002 绕自身旋转（仅在 isWheelsRotating 为 true 时）
  useFrame((_, delta) => {
    if (isWheelsRotating) {
      wheelMeshesRef.current.forEach(mesh => {
        mesh.rotation.z -= 2 * Math.PI * delta * 1.5;
      });
    }
  });

  // 入场运镜动画
  const { rotY } = useSpring({
    rotY: startAnim ? -Math.PI * 8 / 13 : -Math.PI * 3 / 4,
    from: { rotY: -Math.PI * 3 / 4 },
    config: { mass: 1.5, tension: 40, friction: 40 },
    delay: 0,
  });

  return (
    <>
      <animated.group rotation-y={rotY}>
        <primitive object={gltf.scene} scale={[1, 1, 1]} />
        <StartRoom />
        <Speedup />

        {/* <RectWaterBase waterNormals={waterNormals} color={carColor} startAnim={startAnim} /> */}
      </animated.group>
      <SetEnvironment envMap={envMap} gltfScene={gltf.scene} />
      <mesh>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial color="black" side={THREE.BackSide} />
      </mesh>
      {/* {showSpeedup && <Speedup />} */}
    </>
  );
};

export default ModelContent; 