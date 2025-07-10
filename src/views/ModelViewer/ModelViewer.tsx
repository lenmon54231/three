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
import { useSpring } from '@react-spring/three';
import { useThree, useFrame } from '@react-three/fiber';

// 用于将 spring 的 camPos 同步到 three-fiber 默认相机
const CameraSpringSync: React.FC<{ camPos: any; startAnim: boolean }> = ({ camPos, startAnim }) => {
  const { camera } = useThree();
  useFrame(() => {
    if (startAnim && camPos.get) {
      const [x, y, z] = camPos.get();
      camera.position.set(x, y, z);
    } else {
      camera.position.set(6, 3, 6);
    }
    camera.lookAt(0, 0.5, 0); // 保证朝向和 OrbitControls 的 target 一致
    camera.updateProjectionMatrix();
  });
  return null;
};

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
  const [animDone, setAnimDone] = React.useState(false);

  // 相机运镜动画
  const { camPos } = useSpring({
    camPos: startAnim ? [3, 2, 3] : [6, 3, 6],
    config: { mass: 1, tension: 80, friction: 20 },
  });

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
          camera={{ position: [6, 3, 6], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
        >
          {!animDone && <CameraSpringSync camPos={camPos} startAnim={startAnim} />}
          <TopViewDetector onChange={setIsTopView} />
          <ExhibitionLights />
          <SpotLightWithCone
            position={[0, 2.8, 0]}
            target={[0, 0.5, 0]}
            angle={Math.PI / 6}
            color="#fff"
            coneHeight={5.5}
            coneOpacity={0.1}
          />
          <ModelContent isTopView={isTopView} waterNormals={waterNormals} carColor={carColor} startAnim={startAnim} />
          <OrbitControls
            target={[0, 0.5, 0]}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={Math.PI / 9}
            maxPolarAngle={Math.PI * 5 / 12}
            enabled={animDone}
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
