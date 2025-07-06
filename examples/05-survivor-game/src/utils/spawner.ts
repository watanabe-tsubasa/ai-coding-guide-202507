import type { Enemy, Position } from '../types/game';
import { randomPositionOnCircle } from './physics';

let enemyIdCounter = 0;

export const spawnEnemy = (playerPosition: Position, spawnRadius: number): Enemy => {
  const position = randomPositionOnCircle(playerPosition, spawnRadius);
  
  return {
    id: `enemy-${enemyIdCounter++}`,
    x: position.x,
    y: position.y,
    radius: 15,
    health: 30,
    maxHealth: 30,
    speed: 1.5,
    damage: 10,
  };
};

export const shouldSpawnEnemy = (
  gameTime: number,
  lastSpawnTime: number,
  baseSpawnInterval: number
): boolean => {
  // 時間経過とともに出現間隔を短くする
  const spawnInterval = Math.max(
    200, // 最小間隔 0.2秒
    baseSpawnInterval - Math.floor(gameTime / 10000) * 100
  );
  
  return gameTime - lastSpawnTime > spawnInterval;
};