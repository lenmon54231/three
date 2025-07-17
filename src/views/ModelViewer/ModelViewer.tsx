import BackButton from '@/components/BackButton/BackButton';
import Loading from '@/components/Loading/Loading';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import CustomStats from '@/components/CustomStats/CustomStats';
import { TopViewDetector } from '@/components/TopViewDetector';
import ColorButtons from './components/ColorButtons';
import Meteors from './components/Meteors';
import ModelContent from './components/ModelContent';

const ModelViewer: React.FC = () => {
  // 只在顶部视角显示流星
  const [isTopView, setIsTopView] = React.useState(false);

  // 车身颜色
  const [carColor, setCarColor] = React.useState('#2B95AB');

  // 父组件提前加载 waterNormals 贴图
  // 删除未用 waterNormals
  // const waterNormals = useLoader(
  //   THREE.TextureLoader,
  //   waterNormalsImg
  // );

  const [startAnim, setStartAnim] = React.useState(false);
  const [loadingDone, setLoadingDone] = React.useState(false);
  const [animDone, setAnimDone] = React.useState(false);

  // 监听 Suspense 加载完成，800ms 后触发动画
  React.useEffect(() => {
    if (loadingDone) {
      const timer = setTimeout(() => setStartAnim(true), 800);
      return () => clearTimeout(timer);
    }
  }, [loadingDone]);

  // 动画完成后允许交互（假设动画时长 1s，与 spring config 匹配）
  React.useEffect(() => {
    if (startAnim) {
      const timer = setTimeout(() => setAnimDone(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setAnimDone(false);
    }
  }, [startAnim]);

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
          camera={{ position: [6, 3, 6], fov: 50, near: 0.1, far: 2000 }}
          dpr={[1, 1.5]}
          shadows
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <TopViewDetector onChange={setIsTopView} />
          {/* <ExhibitionLights /> */}
           <ModelContent isTopView={isTopView} carColor={carColor} startAnim={startAnim}  />
          <OrbitControls
            target={[0, 0, 0]}
            maxPolarAngle={1.214}
            enableZoom={false}
            enableRotate={animDone}
            enablePan={animDone}
          />
          {/* <Sparkles
            count={60}
            speed={1.5}
            size={2}
            color="#fff"
            opacity={0.8}
            scale={[10, 4, 10]}
            position={[0, 2, 0]}
          /> */}
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
