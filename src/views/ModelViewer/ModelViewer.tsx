import BackButton from '@/components/BackButton/BackButton';
import Loading from '@/components/Loading/Loading';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import ExhibitionLights from './components/ExhibitionLights';
import CustomStats from '@/components/CustomStats/CustomStats';
import { TopViewDetector } from '@/components/TopViewDetector';
import waterNormalsImg from '@/assets/image/water/waternormals.jpg';
import ColorButtons from './components/ColorButtons';
import Meteors from './components/Meteors';
import ModelContent from './components/ModelContent';

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
          {isTopView && <Meteors count={16} show={isTopView} />}
        </Canvas>
      </Suspense>
      <div className="fixed left-2 bottom-2 z-[10000] opacity-90">
        <CustomStats />
      </div>
    </div>
  );
};

export default ModelViewer;
