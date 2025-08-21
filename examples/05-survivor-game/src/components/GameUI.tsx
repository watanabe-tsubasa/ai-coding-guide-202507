import React from 'react';
import { type Player } from '../types/game';

interface GameUIProps {
  player: Player;
}

const GameUI: React.FC<GameUIProps> = ({ player }) => {
  const experienceToNextLevel = player.level * 100;

  const uiStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10px',
    borderRadius: '5px',
    fontFamily: 'sans-serif',
    zIndex: 10,
  };

  const barStyle: React.CSSProperties = {
    width: '200px',
    height: '20px',
    backgroundColor: '#555',
    borderRadius: '3px',
    overflow: 'hidden',
    border: '1px solid #333',
  };

  const fillStyle = (percentage: number, color: string): React.CSSProperties => ({
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.2s',
  });

  return (
    <div style={uiStyle}>
      <div>
        <strong>HP</strong>
        <div style={barStyle}>
          <div style={fillStyle((player.health / 100) * 100, '#ff4136')} />
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Level: {player.level}</strong>
      </div>
      <div style={{ marginTop: '5px' }}>
        <strong>XP</strong>
        <div style={barStyle}>
          <div style={fillStyle((player.experience / experienceToNextLevel) * 100, '#0074d9')} />
        </div>
        <span>{player.experience} / {experienceToNextLevel}</span>
      </div>
    </div>
  );
};

export default GameUI;
