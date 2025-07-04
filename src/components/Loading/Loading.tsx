import React from 'react';

interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-t-transparent border-white border-solid rounded-full animate-spin mb-4" />
      <span className="text-white text-lg opacity-80">{text}</span>
    </div>
  );
};

export default Loading;
