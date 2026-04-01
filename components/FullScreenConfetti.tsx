import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FullScreenConfettiProps {
  duration?: number; // in milliseconds
}

export const FullScreenConfetti: React.FC<FullScreenConfettiProps> = ({ duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[2000] overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <ConfettiStrip key={i} index={i} />
      ))}
    </div>
  );
};

const ConfettiStrip: React.FC<{ index: number }> = ({ index }) => {
  const colors = [
    '#6366f1', // indigo
    '#a855f7', // purple
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4'  // cyan
  ];
  
  const color = colors[index % colors.length];
  const left = `${Math.random() * 100}%`;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;
  const size = 6 + Math.random() * 8;
  const aspectRatio = 0.2 + Math.random() * 0.4; // Long thin strips

  return (
    <motion.div
      initial={{ 
        top: -100, 
        left: left,
        rotate: Math.random() * 360,
        opacity: 0,
        scale: 0
      }}
      animate={{ 
        top: '110%', 
        left: `${parseFloat(left) + (Math.random() * 20 - 10)}%`,
        rotate: 720 + Math.random() * 1000,
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5]
      }}
      transition={{ 
        duration: duration,
        ease: [0.4, 0, 0.2, 1],
        delay: delay,
      }}
      className="absolute rounded-sm"
      style={{ 
        backgroundColor: color,
        width: `${size}px`,
        height: `${size / aspectRatio}px`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    />
  );
};
