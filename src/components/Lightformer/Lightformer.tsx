import React, { useMemo } from 'react';
import { DoubleSide, Color as ThreeColor, MeshBasicMaterial, Texture } from 'three';
import { PlaneGeometry, RingGeometry } from 'three';
import type { ThreeElements } from '@react-three/fiber';

export type LightformerProps = {
  from?: 'circle' | 'ring' | 'rect';
  intensity?: number;
  color?: string | number | ThreeColor;
  map?: Texture;
  toneMapped?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
} & ThreeElements['mesh'];

/**
 * Lightformer: 顶部光照组件，支持 rect/circle/ring 三种形状
 */
const Lightformer: React.FC<LightformerProps> = ({
  from = 'rect',
  intensity = 1,
  color = 0xffffff,
  map,
  toneMapped = false,
  position,
  rotation,
  scale,
  ...meshProps
}) => {
  // 计算材质
  const material = useMemo(() => {
    const mat = new MeshBasicMaterial({
      color: typeof color === 'string' || typeof color === 'number' ? new ThreeColor(color) : color,
      side: DoubleSide,
      map: map,
      toneMapped: toneMapped,
    });
    mat.color.multiplyScalar(intensity);
    return mat;
  }, [color, intensity, map, toneMapped]);

  // 选择几何体
  const geometry = useMemo(() => {
    if (from === 'circle') {
      return new RingGeometry(0, 1, 64);
    } else if (from === 'ring') {
      return new RingGeometry(0.5, 1, 64);
    } else {
      // rect
      return new PlaneGeometry();
    }
  }, [from]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      {...meshProps}
    />
  );
};

export default Lightformer; 