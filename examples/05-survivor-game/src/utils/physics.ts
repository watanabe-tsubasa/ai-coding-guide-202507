import type { Position, GameObject } from '../types/game';

export const distance = (a: Position, b: Position): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const normalize = (vector: Position): Position => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};

export const checkCircleCollision = (a: GameObject, b: GameObject): boolean => {
  const dist = distance(a, b);
  return dist < a.radius + b.radius;
};

export const moveTowards = (
  from: Position,
  to: Position,
  speed: number
): Position => {
  const direction = {
    x: to.x - from.x,
    y: to.y - from.y,
  };
  const normalized = normalize(direction);
  return {
    x: from.x + normalized.x * speed,
    y: from.y + normalized.y * speed,
  };
};

export const findNearestEnemy = (
  position: Position,
  enemies: { x: number; y: number }[]
): { x: number; y: number } | null => {
  if (enemies.length === 0) return null;
  
  let nearest = enemies[0];
  let minDistance = distance(position, nearest);
  
  for (let i = 1; i < enemies.length; i++) {
    const dist = distance(position, enemies[i]);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = enemies[i];
    }
  }
  
  return nearest;
};

export const randomPositionOnCircle = (
  center: Position,
  radius: number
): Position => {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
};