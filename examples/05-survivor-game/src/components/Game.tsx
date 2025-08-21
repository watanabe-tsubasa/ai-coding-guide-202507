import React, { useState, useCallback } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameLoop } from '../hooks/useGameLoop';
import type { GameState } from '../types/game';
import Player from './Player';

const initialGameState: GameState = {
  player: {
    id: 'player',
    position: { x: 400, y: 300 },
    radius: 15,
    health: 100,
    level: 1,
    experience: 0,
  },
  enemies: [],
  bullets: [],
  experienceOrbs: [],
  camera: { x: 0, y: 0 },
  gameTime: 0,
};

const GAME_AREA_WIDTH = 1600;
const GAME_AREA_HEIGHT = 1200;

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const pressedKeys = useKeyboard();

  const update = useCallback((deltaTime: number) => {
    const playerSpeed = 300; // pixels per second

    setGameState((prev) => {
      const newPlayerPos = { ...prev.player.position };
      const moveDistance = playerSpeed * (deltaTime / 1000);

      if (pressedKeys.has('ArrowUp')) newPlayerPos.y -= moveDistance;
      if (pressedKeys.has('ArrowDown')) newPlayerPos.y += moveDistance;
      if (pressedKeys.has('ArrowLeft')) newPlayerPos.x -= moveDistance;
      if (pressedKeys.has('ArrowRight')) newPlayerPos.x += moveDistance;

      return {
        ...prev,
        player: {
          ...prev.player,
          position: newPlayerPos,
        },
      };
    });
  }, [pressedKeys]);

  useGameLoop(update);

  const { player } = gameState;

  // Center the camera on the player
  const cameraX = player.position.x - 400;
  const cameraY = player.position.y - 300;

  return (
    <svg
      width="800"
      height="600"
      viewBox={`${cameraX} ${cameraY} 800 600`}
      style={{ border: '1px solid black', backgroundColor: '#f0f0f0' }}
    >
      {/* Game Area Background */}
      <rect x="0" y="0" width={GAME_AREA_WIDTH} height={GAME_AREA_HEIGHT} fill="#e0e0e0" />
      
      <Player player={player} />

    </svg>
  );
};

export default Game;
