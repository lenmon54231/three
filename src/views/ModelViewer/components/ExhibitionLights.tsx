import React from 'react';

const ExhibitionLights: React.FC = () => (
  <>
    {/* 环境光，柔和整体氛围 */}
    <ambientLight intensity={0.05} />
    {/* 平行光，模拟展厅主灯，带阴影 */}
    <directionalLight
      position={[5, 10, 7]}
      intensity={1}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.0005}
    />
    {/* 顶部大面积矩形光源，模拟展厅大灯 */}
    <rectAreaLight
      position={[0, 5.5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      intensity={1}
      width={6}
      height={3}
      color={'#ffffff'}
      castShadow={false}
    />
    {/* 顶部点光源，模拟聚光灯效果 */}
    <pointLight position={[0, 6, 0]} intensity={0.4} distance={20} decay={2} />
    {/* 辅助点光源，从不同角度补光 */}
    <pointLight position={[5, 2, 5]} intensity={0.13} distance={15} decay={2} />
    <pointLight
      position={[-5, 2, 5]}
      intensity={0.13}
      distance={15}
      decay={2}
    />
    <pointLight
      position={[0, 2, -6]}
      intensity={0.09}
      distance={15}
      decay={2}
    />
  </>
);

export default ExhibitionLights;
