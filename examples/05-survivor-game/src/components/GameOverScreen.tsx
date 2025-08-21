import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart }) => {
  const screenStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    zIndex: 20,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '1.2em',
    cursor: 'pointer',
    marginTop: '20px',
  };

  return (
    <div style={screenStyle}>
      <h1>Game Over</h1>
      <button style={buttonStyle} onClick={onRestart}>
        Restart
      </button>
    </div>
  );
};

export default GameOverScreen;
