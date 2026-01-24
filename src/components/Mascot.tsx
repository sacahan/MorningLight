import React from 'react';
import { motion } from 'framer-motion';

export type MascotExpression = 'happy' | 'neutral' | 'sad' | 'excited' | 'sleepy';

interface MascotProps {
  expression?: MascotExpression;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ expression = 'happy', className = '' }) => {
  // Pixar-style Cat "Light"
  // Features: Soft gradients, large eyes, expressive eyebrows

  const getEyeHeight = () => {
    switch (expression) {
      case 'sleepy': return 2;
      case 'sad': return 8;
      default: return 12;
    }
  };

  const getMouthPath = () => {
    switch (expression) {
      case 'happy': return 'M 40 65 Q 50 75 60 65';
      case 'excited': return 'M 35 65 Q 50 85 65 65 Z';
      case 'sad': return 'M 40 70 Q 50 60 60 70';
      case 'sleepy': return 'M 45 68 L 55 68';
      default: return 'M 42 68 Q 50 70 58 68';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Body - Soft Cream Gradient */}
        <defs>
          <linearGradient id="bodyGradient" x1="50" y1="20" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF9F0" />
            <stop offset="1" stopColor="#FFE0B3" />
          </linearGradient>
          <radialGradient id="eyeHighlight" cx="0.3" cy="0.3" r="0.1">
            <stop offset="0" stopColor="white" stopOpacity="0.8" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ears */}
        <motion.path
          d="M 20 30 L 35 10 L 45 25 Z"
          fill="#FFE0B3"
          stroke="#F43F5E"
          strokeWidth="1"
          animate={{ rotate: expression === 'sad' ? -10 : 0 }}
        />
        <motion.path
          d="M 80 30 L 65 10 L 55 25 Z"
          fill="#FFE0B3"
          stroke="#F43F5E"
          strokeWidth="1"
          animate={{ rotate: expression === 'sad' ? 10 : 0 }}
        />

        {/* Head/Body */}
        <circle cx="50" cy="50" r="40" fill="url(#bodyGradient)" stroke="#FB7185" strokeWidth="0.5" />

        {/* Eyes */}
        <g className="eyes">
          {/* Left Eye */}
          <motion.ellipse
            cx="35" cy="45" rx="8" ry={getEyeHeight()}
            fill="#334155"
            initial={false}
            animate={{ ry: getEyeHeight() }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
          <circle cx="33" cy="42" r="2" fill="white" opacity="0.6" />
          
          {/* Right Eye */}
          <motion.ellipse
            cx="65" cy="45" rx="8" ry={getEyeHeight()}
            fill="#334155"
            initial={false}
            animate={{ ry: getEyeHeight() }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
          <circle cx="63" cy="42" r="2" fill="white" opacity="0.6" />
        </g>

        {/* Nose */}
        <path d="M 48 58 L 52 58 L 50 61 Z" fill="#F43F5E" />

        {/* Mouth */}
        <motion.path
          d={getMouthPath()}
          stroke="#F43F5E"
          strokeWidth="2"
          strokeLinecap="round"
          fill={expression === 'excited' ? '#F43F5E' : 'none'}
          animate={{ d: getMouthPath() }}
        />

        {/* Whiskers */}
        <g stroke="#FDA4AF" strokeWidth="0.5" strokeLinecap="round">
          <line x1="20" y1="55" x2="10" y2="52" />
          <line x1="20" y1="60" x2="10" y2="60" />
          <line x1="80" y1="55" x2="90" y2="52" />
          <line x1="80" y1="60" x2="90" y2="60" />
        </g>
      </svg>
    </div>
  );
};
