import type { Vector } from '../types/game';

const MAX_RETRIES = 10;

export const generateSpawnPoint = (
  center: Vector,
  radius: number,
  gameArea: { width: number; height: number }
): Vector => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const spawnRadius = radius + 50;
    const x = center.x + spawnRadius * Math.cos(angle);
    const y = center.y + spawnRadius * Math.sin(angle);

    if (x >= 0 && x <= gameArea.width && y >= 0 && y <= gameArea.height) {
      return { x, y };
    }
  }

  // Fallback: generate a random point on the edge of the game area
  const perimeter = 2 * (gameArea.width + gameArea.height);
  let randomPerimeterPoint = Math.random() * perimeter;

  if (randomPerimeterPoint < gameArea.width) {
    return { x: randomPerimeterPoint, y: 0 };
  }
  randomPerimeterPoint -= gameArea.width;

  if (randomPerimeterPoint < gameArea.height) {
    return { x: gameArea.width, y: randomPerimeterPoint };
  }
  randomPerimeterPoint -= gameArea.height;

  if (randomPerimeterPoint < gameArea.width) {
    return { x: gameArea.width - randomPerimeterPoint, y: gameArea.height };
  }
  randomPerimeterPoint -= gameArea.width;

  return { x: 0, y: gameArea.height - randomPerimeterPoint };
};