import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Water } from 'three-stdlib';
import { animated, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';

interface RectWaterBaseProps {
  waterNormals: THREE.Texture;
  color: string;
  startAnim?: boolean;
}

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

const RectWaterBase: React.FC<RectWaterBaseProps> = ({ waterNormals, color, startAnim = false }) => {
  // 水面对象
  const planeWater: any = useMemo(() => {
    const gradTex = createRectGradientTexture(512);
    return new (Water as any)(
      new THREE.PlaneGeometry(50, 2, 128, 128),
      {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals,
        sunDirection: new THREE.Vector3(1, 1, 1),
        sunColor: 0x222233,
        waterColor: 0x181a22,
        distortionScale: 0.1, // 降低反射
        fog: false,
        format: 3001,
        map: gradTex,
        alpha: 0.9, // 进一步降低透明度
      } as any
    );
  }, [waterNormals]);

  // 颜色渐变动画
  const { color: waterColorSpring } = useSpring({
    color,
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

  // 入场缩放动画
  const rectBaseSpring = useSpring({
    scale: startAnim ? 5 : 0,
    config: { tension: 120, friction: 30 },
    delay: 200,
  });

  return (
    <animated.group scale={rectBaseSpring.scale}>
      <primitive
        object={planeWater}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      />
    </animated.group>
  );
};

export default RectWaterBase; 