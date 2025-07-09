import BackButton from '@/components/BackButton/BackButton';
import Loading from '@/components/Loading/Loading';
import { MeshReflectorMaterial, OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import ExhibitionLights from './components/ExhibitionLights';
import hdr from '@/assets/hdr/studio_small_08_1k.hdr';
import CustomStats from '@/components/CustomStats/CustomStats';
import Meteor from '@/components/Meteor';
import { TopViewDetector } from '@/components/TopViewDetector';
import { Water2Circle } from '@/components/Water2Circle';
import waterNormalsImg from '@/assets/image/water/waternormals.jpg';
import { TextureLoader } from 'three';
import ColorButtons from './components/ColorButtons';

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
  carColor: string; // 新增
}> = ({ isTopView, waterNormals, carColor }) => {
  const gltf = useLoader(
    GLTFLoader,
    '/su7_car/sm_car.gltf',
    (loader) => {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  );
  const aoMap = useLoader(TextureLoader, AO_TEXTURE_PATH);
  aoMap.channel = 1
  aoMap.flipY = false
  React.useEffect(() => {
    const meshes = flatModel(gltf.scene);

    const body = meshes[2] as THREE.Mesh
    const bodyMat = body.material as THREE.MeshStandardMaterial
    bodyMat.envMapIntensity = 4
    bodyMat.color = new THREE.Color(carColor) // 这里用 props 传入的 carColor

    meshes.forEach((mesh) => {
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.aoMap = aoMap;
      }
    });
  }, [gltf, aoMap, carColor]); // 依赖 carColor
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

// 生成一条从右上到左上的流星参数（更广可视范围）
function randomMeteorParams() {
  // 起点在顶部更集中区域右侧
  const xStart = 2 + Math.random() * 2;      // 2 ~ 4
  const yStart = 1.0 + Math.random() * 1.2;  // 1.0 ~ 2.2
  const zStart = -3 + Math.random() * 6;     // -3 ~ 3
  // 终点在顶部更集中区域左侧
  const xEnd = -4 + Math.random() * 2;       // -4 ~ -2
  const yEnd = yStart + (Math.random() - 0.5) * 0.5; // y基本不变，微小扰动
  const zEnd = zStart + (Math.random() - 0.5) * 1.2;  // z更大扰动
  return {
    start: [xStart, yStart, zStart] as [number, number, number],
    end: [xEnd, yEnd, zEnd] as [number, number, number],
  };
}

const ModelViewer: React.FC = () => {
  // 只在顶部视角显示流星
  const [isTopView, setIsTopView] = React.useState(false);

  // 车身颜色
  const [carColor, setCarColor] = React.useState('#2B95AB');

  // 父组件提前加载 waterNormals 贴图
  const waterNormals = useLoader(
    THREE.TextureLoader,
    waterNormalsImg
    // 'https://threejs.org/examples/textures/waternormals.jpg'
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', cursor: 'pointer' }}>
      <BackButton />
      {/* 使用 ColorButtons 组件 */}
      <ColorButtons onChange={setCarColor} />
      <Suspense fallback={<Loading />}>
        <Canvas
          camera={{ position: [3, 3, 3], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
        >
          <TopViewDetector onChange={setIsTopView} />
          <ExhibitionLights />
          <ModelContent isTopView={isTopView} waterNormals={waterNormals} carColor={carColor} />
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
                    width={0.22 + Math.random() * 0.18}
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
