import React from 'react';
import { type Vector } from '../types/game';

interface ExperienceOrbProps {
  position: Vector;
}

const ExperienceOrb: React.FC<ExperienceOrbProps> = ({ position }) => {
  return (
    <circle cx={position.x} cy={position.y} r="7" fill="green" />
  );
};

export default ExperienceOrb;
