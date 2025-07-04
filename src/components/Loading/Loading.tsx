import React from 'react';

interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen py-10">
      <div className="relative mb-4">
        <div className="absolute inset-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-50 animate-ping" />
        <div className="w-12 h-12 border-4 border-t-transparent border-white border-solid rounded-full animate-spin relative" />
      </div>
      <span className="text-white text-lg opacity-80 animate-pulse">
        {text}
      </span>
    </div>
  );
};

export default Loading;
