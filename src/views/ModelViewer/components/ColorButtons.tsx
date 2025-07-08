import React from 'react';

interface ColorButtonsProps {
  onChange: (color: string) => void;
}

const colors = [
  { color: '#ff0000', className: 'bg-[#ff0000] border-none' },
  { color: '#0051ff', className: 'bg-[#0051ff] border-none' },
  { color: '#00c853', className: 'bg-[#00c853] border-none' },
  { color: '#ffffff', className: 'bg-white border border-gray-300' },
  { color: '#222222', className: 'bg-[#222] border border-gray-300' },
];

const ColorButtons: React.FC<ColorButtonsProps> = ({ onChange }) => (
  <div className="absolute top-6 right-6 z-10 flex gap-2">
    {colors.map(({ color, className }) => (
      <button
        key={color}
        className={`w-8 h-8 rounded-full cursor-pointer ${className}`}
        onClick={() => onChange(color)}
      />
    ))}
  </div>
);

export default ColorButtons; 