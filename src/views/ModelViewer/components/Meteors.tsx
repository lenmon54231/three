import React from 'react';
import Meteor from '@/components/Meteor';

// 随机颜色生成函数
function randomColor() {
  const colors = ['#fff', '#00cfff', '#ffb300', '#ff4d4f', '#52c41a', '#1890ff', '#a259ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 生成同色系渐变色（仅RGB，不带透明度）
function getTailColor(color: string) {
  // 支持 #RRGGBB 或 #RGB
  let c = color;
  if (c.length === 4) {
    c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  // 返回rgb字符串
  return `rgb(${r},${g},${b})`;
}

// 生成一条从右上到左上的流星参数（更广可视范围）
function randomMeteorParams() {
  // 起点在顶部更集中区域右侧
  const xStart = 2 + Math.random() * 2;      // 2 ~ 4
  const yStart = 1.0 + Math.random() * 1.2;  // 1.0 ~ 2.2
  const zStart = -3 + Math.random() * 6;     // -3 ~ 3
  // 终点在顶部更集中区域左侧
  const xEnd = -4 + Math.random() * 2;       // -4 ~ -2
  const yEnd = yStart + (Math.random() - 0.5) * 0.5; // y基本不变，微小扰动
  const zEnd = zStart + (Math.random() - 0.5) * 1.2;  // z更大扰动
  return {
    start: [xStart, yStart, zStart] as [number, number, number],
    end: [xEnd, yEnd, zEnd] as [number, number, number],
  };
}

interface MeteorsProps {
  count?: number;
  show?: boolean;
}

const Meteors: React.FC<MeteorsProps> = ({ count = 16, show = true }) => {
  if (!show) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const { start, end } = randomMeteorParams();
        const color = randomColor();
        const tailColor = getTailColor(color);
        return (
          <Meteor
            key={i}
            start={start}
            end={end}
            duration={0.6 + Math.random() * 1.2}
            color={color}
            tailColor={tailColor}
            width={0.22 + Math.random() * 0.18}
          />
        );
      })}
    </>
  );
};

export default Meteors; 