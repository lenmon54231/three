import { useThree, useFrame } from '@react-three/fiber';
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const CameraShake: React.FC = () => {
  const { camera } = useThree();
  const basePos = useRef<THREE.Vector3>(camera.position.clone());
  const tRef = useRef(0);

  useEffect(() => {
    // 记录初始位置
    basePos.current.copy(camera.position);
    return () => {
      // 卸载时恢复
      camera.position.copy(basePos.current);
    };
  }, [camera]);

  useFrame((_, delta) => {
    tRef.current += delta;
    // 抖动参数
    const freq = 1; // 频率
    const amp = 0.07; // 幅度
    camera.position.x = basePos.current.x + Math.sin(tRef.current * 2 * Math.PI * freq) * amp;
    camera.position.y = basePos.current.y + Math.cos(tRef.current * 2 * Math.PI * freq) * amp * 0.5;
    camera.position.z = basePos.current.z + Math.sin(tRef.current * 2 * Math.PI * freq * 0.7) * amp * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraShake; 