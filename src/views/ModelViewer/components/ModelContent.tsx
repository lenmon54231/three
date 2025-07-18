import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import hdr from '@/assets/hdr/evening_museum_courtyard_1k.hdr';
import { TextureLoader } from 'three';
import waterNormalsImg from '@/assets/image/water/waternormals.jpg';
import { Water } from 'three-stdlib';
import { extend } from '@react-three/fiber';
import StartRoom from './StartRoom';
import RectWaterBase from './RectWaterBase';
import Speedup from './Speedup';
import * as TWEEN from '@tweenjs/tween.js';
import CameraShake from './CameraShake';

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
  const speedupGltf = useLoader(
    GLTFLoader,
    '/su7_car/sm_speedup.gltf',
    loader => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  );
  const { camera } = useThree();
  const wheelMeshesRef = useRef<THREE.Mesh[]>([]);
  const [isWheelsRotating, setIsWheelsRotating] = useState(false);
  const [showSpeedup, setShowSpeedup] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const waterNormals = useLoader(TextureLoader, waterNormalsImg);

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
  // 新建 wheelsTweenGroup 实例
  const wheelsTweenGroup = useRef(new TWEEN.Group()).current;

  useEffect(() => {
    if (isWheelsRotating) {
      const from = { camPos: [camera.position.x, camera.position.y, camera.position.z] };
      const to = { camPos: [4, 2, 4] };
      new TWEEN.Tween(from, wheelsTweenGroup)
        .to(to, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          camera.position.set(from.camPos[0], from.camPos[1], from.camPos[2]);
          camera.lookAt(0, 0, 0);
        })
        .onComplete(() => {
          setShowSpeedup(true);
          camera.up.set(0, 1, 0);
        })
        .start();
 
    }
  }, [isWheelsRotating, camera, wheelsTweenGroup]);

  useFrame(() => {
    wheelsTweenGroup.update();
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
        mesh.rotation.z -= 2 * Math.PI * delta * 2.5;
      });
    }
  });

  // 新建 tweenGroup 实例
  const tweenGroup = useRef(new TWEEN.Group()).current;

  // rotY 动画逻辑
  const tweenRef = useRef<TWEEN.Tween<any> | null>(null);

  useEffect(() => {
    if (startAnim) {
      const from = { rotY: groupRef.current?.rotation.y ?? -Math.PI * 3 / 4 };
      const to = { rotY: -Math.PI * 8 / 13 };
      tweenRef.current = new TWEEN.Tween(from, tweenGroup)
        .to(to, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          if (groupRef.current) {
            groupRef.current.rotation.y = from.rotY;
          }
        })
        .start();
    }
  }, [startAnim, tweenGroup]);

  useFrame(() => {
    tweenGroup.update();
  });

  // camera tween 动画逻辑
  const cameraTweenGroup = useRef(new TWEEN.Group()).current;

  useEffect(() => {
    if (startAnim) {
      const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      const to = { x: 3.6, y: 2.4, z: 3.6 };
      new TWEEN.Tween(from, cameraTweenGroup)
        .to(to, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          camera.position.set(from.x, from.y, from.z);
        })
        .start();
    }
  }, [startAnim, camera, cameraTweenGroup]);

  useFrame(() => {
    cameraTweenGroup.update();
  });

  return (
    <>
      <group ref={groupRef}>
        <primitive object={gltf.scene} scale={[1, 1, 1]} />
        {!showSpeedup && <StartRoom />}
        {showSpeedup && <RectWaterBase waterNormals={waterNormals} color={carColor} showSpeedup={showSpeedup} />}
        {showSpeedup && <CameraShake />}
        {showSpeedup && <Speedup gltf={speedupGltf} />}
      </group>
      <SetEnvironment envMap={envMap} gltfScene={gltf.scene} />
    </>
  );
};

export default ModelContent; 