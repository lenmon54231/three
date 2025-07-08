import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface MeteorProps {
  start: [number, number, number];
  end: [number, number, number];
  duration?: number; // 单位：秒
  color?: string; // 头部颜色
  tailColor?: string; // 拖尾颜色
  width?: number;
}

const Meteor: React.FC<MeteorProps> = ({
  start,
  end,
  duration = 2,
  color = '#fff',
  tailColor = '#00cfff',
  width = 0.08,
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const startTime = useRef<number>(performance.now());

  useFrame(() => {
    const elapsed = ((performance.now() - startTime.current) / 1000) % duration;
    const t = elapsed / duration;
    // 计算当前流星头部位置
    const head = [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t,
    ];
    // 拖尾长度
    const tailT = Math.max(0, t - 0.2);
    const tail = [
      start[0] + (end[0] - start[0]) * tailT,
      start[1] + (end[1] - start[1]) * tailT,
      start[2] + (end[2] - start[2]) * tailT,
    ];
    // 更新几何体
    if (lineRef.current) {
      (lineRef.current.geometry as THREE.BufferGeometry).setFromPoints([
        new THREE.Vector3(...head),
        new THREE.Vector3(...tail),
      ]);
      // 设置顶点颜色：头部半透明，尾部更透明
      const colors = new Float32Array([
        ...new THREE.Color(color).toArray(), 0.4, // 头部半透明
        ...new THREE.Color(tailColor).toArray(), 0.1, // 尾部更透明
      ]);
      (lineRef.current.geometry as THREE.BufferGeometry).setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 4)
      );
    }
  });

  useEffect(() => {
    startTime.current = performance.now();
  }, [start, end, duration]);

  return (
    <line ref={lineRef as any}>
      <bufferGeometry />
      <lineBasicMaterial
        ref={matRef as any}
        attach="material"
        vertexColors
        linewidth={width}
        transparent
        opacity={1}
      />
    </line>
  );
};

export default Meteor; 