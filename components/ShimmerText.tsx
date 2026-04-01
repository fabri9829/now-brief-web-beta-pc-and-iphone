import React from 'react';

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  isLarge?: boolean;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ children, className = "", isLarge = false }) => {
  return (
    <div className={`shimmer-effect ${isLarge ? 'font-bold' : ''} ${className}`}>
      {children}
    </div>
  );
};