import React from 'react';
import type { Player as PlayerType } from '../types/game';

interface PlayerProps {
  player: PlayerType;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  return (
    <g transform={`translate(${player.position.x}, ${player.position.y})`}>
      <circle r={player.radius} fill="blue" />
    </g>
  );
};

export default Player;
