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
import SpotLightWithCone from './components/SpotLightWithCone';

const ModelViewer: React.FC = () => {
  // 只在顶部视角显示流星
  const [isTopView, setIsTopView] = React.useState(false);

  // 车身颜色
  const [carColor, setCarColor] = React.useState('#2B95AB');

  // 父组件提前加载 waterNormals 贴图
  const waterNormals = useLoader(
    THREE.TextureLoader,
    waterNormalsImg
  );

  const [startAnim, setStartAnim] = React.useState(false);
  const [loadingDone, setLoadingDone] = React.useState(false);

  // 监听 Suspense 加载完成，500ms 后触发动画
  React.useEffect(() => {
    if (loadingDone) {
      const timer = setTimeout(() => setStartAnim(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [loadingDone]);

  // 利用 Suspense 的 onLoad 机制（此处简化为首次渲染后触发）
  React.useEffect(() => {
    setLoadingDone(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', cursor: 'pointer' }}>
      <BackButton />
      <ColorButtons onChange={setCarColor} />
      <Suspense fallback={<Loading />}>
        <Canvas
          camera={{ position: [6, 2, 6], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
        >
          <TopViewDetector onChange={setIsTopView} />
          <ExhibitionLights />
          <SpotLightWithCone
            position={[0, 2.8, 0]}
            target={[0, 0, 0]}
            angle={Math.PI / 6}
            color="#fff"
            coneHeight={5.5}
            coneOpacity={0.1}
          />
          <ModelContent isTopView={isTopView} waterNormals={waterNormals} carColor={carColor} startAnim={startAnim} />
          <OrbitControls
            target={[0, 0, 0]}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={Math.PI / 9}
            maxPolarAngle={Math.PI * 5 / 12}
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
