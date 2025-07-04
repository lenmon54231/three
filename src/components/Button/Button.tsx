import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      className={`px-4 py-2 rounded text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 shadow hover:from-pink-500 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
