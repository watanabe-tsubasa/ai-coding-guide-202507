import React from 'react';
import type { Player as PlayerType } from '../types/game';

interface PlayerProps {
  player: PlayerType;
}

export const Player: React.FC<PlayerProps> = ({ player }) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;
  
  return (
    <g transform={`translate(${player.x}, ${player.y})`}>
      {/* プレイヤー本体 */}
      <circle
        r={player.radius}
        fill="#4ade80"
        stroke="#166534"
        strokeWidth="2"
      />
      
      {/* 体力バー */}
      <rect
        x={-20}
        y={-player.radius - 15}
        width={40}
        height={4}
        fill="#dc2626"
        stroke="#7f1d1d"
        strokeWidth="1"
      />
      <rect
        x={-20}
        y={-player.radius - 15}
        width={40 * (healthPercentage / 100)}
        height={4}
        fill="#22c55e"
      />
      
      {/* レベル表示 */}
      <text
        y={5}
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="bold"
      >
        {player.level}
      </text>
    </g>
  );
};