import React, { useRef, useEffect } from 'react';
import { useLoader, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three-stdlib';

extend({ Water });

export const Water2Circle: React.FC<{ radius?: number; waterNormals: THREE.Texture; [key: string]: any }> = ({ radius = 3.2, waterNormals, ...props }) => {
  const ref = useRef<THREE.Mesh>(null);

  // 创建 Water 实例时直接用 props.waterNormals
  const water = React.useMemo(() => {
    return new (Water as unknown as typeof THREE.Mesh)(
      new THREE.CircleGeometry(radius, 128),
      {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals,
        sunDirection: new THREE.Vector3(1, 1, 1),
        sunColor: 0xffffff,
        waterColor: 0xbbeeff,
        distortionScale: 2.5,
        fog: false,
        format: 3001,
      }
    );
  }, [radius, waterNormals]);

  useEffect(() => {
    if (water && (water as any).material && (water as any).material.uniforms.size) {
      (water as any).material.uniforms.size.value = 1.0;
    }
  }, [water]);

  return (
    <primitive
      object={water}
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
    />
  );
}; 