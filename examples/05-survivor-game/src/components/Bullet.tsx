import React from 'react';
import { type Vector } from '../types/game';

interface BulletProps {
  position: Vector;
}

const Bullet: React.FC<BulletProps> = ({ position }) => {
  return (
    <circle cx={position.x} cy={position.y} r="5" fill="yellow" />
  );
};

export default Bullet;
