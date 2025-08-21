import type { Vector } from '../types/game';

export const generateSpawnPoint = (center: Vector, radius: number): Vector => {
  const angle = Math.random() * 2 * Math.PI;
  // Add a small buffer to ensure the point is outside the radius
  const spawnRadius = radius + 50; 
  const x = center.x + spawnRadius * Math.cos(angle);
  const y = center.y + spawnRadius * Math.sin(angle);
  return { x, y };
};