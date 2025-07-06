import React from 'react';
import type { ExperienceOrb } from '../types/game';

interface ExperienceProps {
  orb: ExperienceOrb;
}

export const Experience: React.FC<ExperienceProps> = ({ orb }) => {
  return (
    <g transform={`translate(${orb.x}, ${orb.y})`}>
      <circle
        r={orb.radius}
        fill="#3b82f6"
        stroke="#1e40af"
        strokeWidth="1"
        opacity="0.8"
      />
      <circle
        r={orb.radius * 0.6}
        fill="#60a5fa"
        opacity="0.6"
      />
    </g>
  );
};