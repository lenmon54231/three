import React from 'react';
import icon1 from '@/assets/image/carColor/su7_6_icon_1_a.png';
import icon2 from '@/assets/image/carColor/su7_6_icon_2_a.png';
import icon5 from '@/assets/image/carColor/su7_6_icon_5_a.png';
import icon9 from '@/assets/image/carColor/su7_6_icon_9_a.png';
import iconCui from '@/assets/image/carColor/su7_6_icon_cuicanyanghong_a.png';

interface ColorButtonsProps {
  onChange: (color: string) => void;
}

// 图片与颜色的映射
const colorImages = [
  { color: '#2B95AB', img: icon1 },
  { color: '#5C664B', img: icon2 },
  { color: '#455469', img: icon5 },
  { color: '#30373F', img: icon9 },
  { color: '#C82974', img: iconCui },
];

const ColorButtons: React.FC<ColorButtonsProps> = ({ onChange }) => (
  <div className="absolute top-6 right-6 z-10 flex gap-2">
    {colorImages.map(({ color, img }) => (
      <button
        key={color}
        className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent p-0 flex items-center justify-center"
        onClick={() => onChange(color)}
        style={{ boxShadow: '0 0 2px #888' }}
      >
        <img src={img} alt="car color" className="w-8 h-8 rounded-full object-cover" />
      </button>
    ))}
  </div>
);

export default ColorButtons; 