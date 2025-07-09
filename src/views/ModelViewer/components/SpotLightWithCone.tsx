import React from 'react';

interface SpotLightWithConeProps {
  position?: [number, number, number];
  target?: [number, number, number];
  angle?: number;
  intensity?: number;
  penumbra?: number;
  color?: string;
  coneHeight?: number;
  coneOpacity?: number;
}

const SpotLightWithCone: React.FC<SpotLightWithConeProps> = ({
  position = [0, 8, 0],
  target = [0, 0, 0],
  angle = Math.PI / 6,
  intensity = 2,
  penumbra = 0.4,
  color = '#fff',
  coneHeight = 8,
  coneOpacity = 0.1,
}) => {
  // 底面半径与 angle 匹配
  const radius = coneHeight * Math.tan(angle);
  return (
    <>
      <spotLight
        position={position}
        angle={angle}
        intensity={intensity}
        penumbra={penumbra}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color={color}
        target-position={target}
      />
      {/* 聚光灯光线路径可视化锥体 */}
      <mesh position={[position[0], position[1], position[2]]} rotation={[0, 0, 0]}>
        <coneGeometry args={[radius, coneHeight, 64]} />
        <meshBasicMaterial color={color} transparent opacity={coneOpacity} depthWrite={false} />
      </mesh>
    </>
  );
};

export default SpotLightWithCone; 