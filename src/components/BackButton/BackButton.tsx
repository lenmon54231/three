import Button from '@/components/Button';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate(-1)}
      className={`fixed top-10 left-10 z-50 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow p-2 transition-colors border border-gray-200 backdrop-blur ${className}`}
      aria-label="返回"
    >
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </Button>
  );
};

export default BackButton;
