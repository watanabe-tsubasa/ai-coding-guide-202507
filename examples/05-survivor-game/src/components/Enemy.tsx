import React from 'react';
import { type Vector } from '../types/game';

interface EnemyProps {
  position: Vector;
}

const Enemy: React.FC<EnemyProps> = ({ position }) => {
  return (
    <circle cx={position.x} cy={position.y} r="10" fill="red" />
  );
};

export default Enemy;
