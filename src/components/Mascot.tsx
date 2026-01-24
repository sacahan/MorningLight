import React from 'react';
import { motion } from 'framer-motion';
import mascotImage from '../assets/images/mascot.png';

export type MascotExpression = 'happy' | 'neutral' | 'sad' | 'excited' | 'sleepy';

interface MascotProps {
  expression?: MascotExpression;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ className = '' }) => {
  // Pixar-style Cat "Light"
  // Using generated 3D image asset

  return (
    <div className={`relative ${className}`}>
      <motion.img
        src={mascotImage}
        alt="Mascot"
        className="w-full h-full object-contain drop-shadow-xl"
        initial={{ y: 0 }}
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};
