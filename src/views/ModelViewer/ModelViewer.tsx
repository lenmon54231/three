import BackButton from '@/components/BackButton/BackButton';
import Loading from '@/components/Loading/Loading';
import { MeshReflectorMaterial, OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import ExhibitionLights from './components/ExhibitionLights';
import ColorButtons from './components/ColorButtons';
import hdr from '@/assets/hdr/studio_small_08_1k.hdr';
import modal from '@/assets/modal/su7_z.glb';
import CustomStats from '@/components/CustomStats/CustomStats';
import Meteor from '@/components/Meteor';
import { TopViewDetector } from '@/components/TopViewDetector';

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

// 随机颜色生成函数
function randomColor() {
  const colors = ['#fff', '#00cfff', '#ffb300', '#ff4d4f', '#52c41a', '#1890ff', '#a259ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 生成同色系渐变色（仅RGB，不带透明度）
function getTailColor(color: string) {
  // 支持 #RRGGBB 或 #RGB
  let c = color;
  if (c.length === 4) {
    c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  // 返回rgb字符串
  return `rgb(${r},${g},${b})`;
}

// 判断相机是否靠近顶部视角的hook
function useIsTopView(thresholdY = 2.5, thresholdAngle = 0.7) {
  const { camera } = useThree();
  const [isTop, setIsTop] = React.useState(false);
  React.useEffect(() => {
    function check() {
      // y越大越靠近顶部
      // 俯视角度：相机朝向与y轴夹角小于阈值
      const up = new THREE.Vector3(0, -1, 0);
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      const angle = camDir.angleTo(up); // 0为正下，PI为正上
      setIsTop(camera.position.y > thresholdY && angle < thresholdAngle);
    }
    check();
    camera.addEventListener('change', check);
    return () => camera.removeEventListener('change', check);
  }, [camera, thresholdY, thresholdAngle]);
  return isTop;
}

// 生成一条从左上到右上的流星参数（更广可视范围）
function randomMeteorParams() {
  // 起点在顶部更广区域左侧
  const xStart = -5 + Math.random() * 2.5; // -5 ~ -2.5
  const yStart = 2.2 + Math.random() * 2.2; // 2.2 ~ 4.4
  const zStart = -4 + Math.random() * 8;    // -4 ~ 4
  // 终点在顶部更广区域右侧
  const xEnd = 2.5 + Math.random() * 2.5;   // 2.5 ~ 5
  const yEnd = yStart + (Math.random() - 0.5) * 0.5; // y基本不变，微小扰动
  const zEnd = zStart + (Math.random() - 0.5) * 1.2;  // z更大扰动
  return {
    start: [xStart, yStart, zStart] as [number, number, number],
    end: [xEnd, yEnd, zEnd] as [number, number, number],
  };
}

const ModelViewer: React.FC = () => {
  const [materials, setMaterials] = React.useState<
    THREE.MeshStandardMaterial[]
  >([]);

  // 只在顶部视角显示流星
  const [isTopView, setIsTopView] = React.useState(false);

  // 换色函数
  const handleChangeColor = (color: string) => {
    materials.forEach((mat) => {
      mat.color.set(color);
      mat.needsUpdate = true;
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', cursor: 'pointer' }}>
      <BackButton />
      {/* 换色按钮 */}
      <ColorButtons onChange={handleChangeColor} />
      <Suspense fallback={<Loading />}>
        <Canvas
          camera={{ position: [3, 3, 3], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
        >
          <TopViewDetector onChange={setIsTopView} />
          <ExhibitionLights />
          <ModelContent onMaterialsReady={setMaterials} />
          <OrbitControls
            target={[0, 0, 0]}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 3}
          />
          <Sparkles
            count={60}
            speed={1.5}
            size={2}
            color="#fff"
            opacity={0.8}
            scale={[10, 4, 10]}
            position={[0, 2, 0]}
          />
          {isTopView && (
            <>
              {Array.from({ length: 16 }).map((_, i) => {
                const { start, end } = randomMeteorParams();
                const color = randomColor();
                const tailColor = getTailColor(color);
                return (
                  <Meteor
                    key={i}
                    start={start}
                    end={end}
                    duration={0.6 + Math.random() * 1.2}
                    color={color}
                    tailColor={tailColor}
                    width={0.1 + Math.random() * 0.15}
                  />
                );
              })}
            </>
          )}
        </Canvas>
      </Suspense>
      <div className="fixed left-2 bottom-2 z-[10000] opacity-90">
        <CustomStats />
      </div>
    </div>
  );
};

export default ModelViewer;
