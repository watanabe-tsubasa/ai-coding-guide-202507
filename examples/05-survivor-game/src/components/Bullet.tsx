import React from 'react';
import type { Bullet as BulletType } from '../types/game';

interface BulletProps {
  bullet: BulletType;
}

export const Bullet: React.FC<BulletProps> = ({ bullet }) => {
  return (
    <circle
      cx={bullet.x}
      cy={bullet.y}
      r={bullet.radius}
      fill="#fbbf24"
      stroke="#f59e0b"
      strokeWidth="1"
    />
  );
};