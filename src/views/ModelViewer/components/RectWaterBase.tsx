import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Water } from 'three-stdlib';
import * as TWEEN from '@tweenjs/tween.js';
import { useFrame } from '@react-three/fiber';

interface RectWaterBaseProps {
  waterNormals: THREE.Texture;
  color: string;
  showSpeedup?: boolean;
}

function createRectGradientTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size * 2, size);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const RectWaterBase: React.FC<RectWaterBaseProps> = ({ waterNormals, color, showSpeedup = false }) => {
  // 水面对象
  const planeWater: any = useMemo(() => {
    const gradTex = createRectGradientTexture(512);
    return new (Water as any)(
      new THREE.PlaneGeometry(50, 2, 128, 128),
      {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals,
        sunDirection: new THREE.Vector3(0, 0, 0),
        sunColor: 0x000000,
        // waterColor: 0x000000,
        distortionScale: 0, // 降低反射
        fog: false,
        format: 3001,
        map: gradTex,
        alpha: 1, // 进一步降低透明度
      } as any
    );
  }, [waterNormals]);

  // TWEEN group 实例
  const tweenGroup = React.useRef(new TWEEN.Group()).current;

  // 颜色渐变动画（TWEEN）
  const colorRef = React.useRef(new THREE.Color(color));
  const prevColorRef = React.useRef(color);
  React.useEffect(() => {
    if (prevColorRef.current !== color) {
      const from = { r: colorRef.current.r, g: colorRef.current.g, b: colorRef.current.b };
      const toColor = new THREE.Color(color);
      const to = { r: toColor.r, g: toColor.g, b: toColor.b };
      new TWEEN.Tween(from, tweenGroup)
        .to(to, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          colorRef.current.setRGB(from.r, from.g, from.b);
        })
        .start();
      prevColorRef.current = color;
    }
  }, [color, tweenGroup]);

  // 入场缩放动画（TWEEN）
  const [scale, setScale] = React.useState(0);
  const hasAnimated = React.useRef(false);
  React.useEffect(() => {
    if (showSpeedup && !hasAnimated.current) {
      const from = { s: 1 };
      const to = { s: 10 };
      new TWEEN.Tween(from, tweenGroup)
        .to(to, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .delay(200)
        .onUpdate(() => setScale(from.s))
        .start();
      hasAnimated.current = true;
    }
  }, [showSpeedup, tweenGroup]);

  // TWEEN 更新
  useFrame(() => {
    tweenGroup.update();
    // 同步 tween color 到 planeWater 的 waterColor
    if (
      planeWater &&
      planeWater.material &&
      planeWater.material.uniforms &&
      planeWater.material.uniforms.waterColor
    ) {
      planeWater.material.uniforms.waterColor.value.copy(colorRef.current);
    }
  });

  return (
    <group scale={[scale, scale, scale]}>
      <primitive
        object={planeWater}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      />
    </group>
  );
};

export default RectWaterBase; 