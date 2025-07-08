import React, { useEffect, useRef } from 'react';
import Stats from 'stats.js';

const CustomStats: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    if (statsRef.current) {
      statsRef.current.appendChild(stats.dom);
      // 覆盖样式
      Object.assign(stats.dom.style, {
        position: 'static', // 让外层div控制定位
        margin: 0,
        padding: 0,
        opacity: 0.9,
      });
    }

    let animationId: number;
    const animate = () => {
      stats.update();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (statsRef.current) {
        statsRef.current.removeChild(stats.dom);
      }
    };
  }, []);

  return <div ref={statsRef} />;
};

export default CustomStats;