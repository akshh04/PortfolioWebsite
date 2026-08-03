import React from 'react';
import { motion } from 'framer-motion';

export default function GradientOrb({ 
  size = 400, 
  color = 'var(--orb-1)', 
  top, bottom, left, right, 
  opacity = 1,
  animate = true,
  delay = 0
}) {
  const style = {
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color}, transparent 70%)`,
    filter: `blur(${size * 0.2}px)`,
    top, bottom, left, right,
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    opacity,
  };

  if (!animate) return <div style={style} />;

  return (
    <motion.div
      style={style}
      animate={{
        scale: [1, 1.08, 1],
        opacity: [opacity * 0.8, opacity, opacity * 0.8],
        x: [0, 15, 0],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
