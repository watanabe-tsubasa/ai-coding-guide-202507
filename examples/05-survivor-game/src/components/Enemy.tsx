import React from 'react';
import type { Enemy as EnemyType } from '../types/game';

interface EnemyProps {
  enemy: EnemyType;
}

export const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const healthPercentage = (enemy.health / enemy.maxHealth) * 100;
  
  return (
    <g transform={`translate(${enemy.x}, ${enemy.y})`}>
      {/* 敵本体 */}
      <circle
        r={enemy.radius}
        fill="#ef4444"
        stroke="#7f1d1d"
        strokeWidth="2"
      />
      
      {/* 体力バー */}
      <rect
        x={-15}
        y={-enemy.radius - 10}
        width={30}
        height={3}
        fill="#dc2626"
        stroke="#7f1d1d"
        strokeWidth="0.5"
      />
      <rect
        x={-15}
        y={-enemy.radius - 10}
        width={30 * (healthPercentage / 100)}
        height={3}
        fill="#fbbf24"
      />
    </g>
  );
};