import { describe, it, expect } from 'vitest';
import { generateSpawnPoint } from './spawner';
import type { Vector } from '../types/game';
import { distance } from './physics';

describe('spawner utils', () => {
  it('should generate a spawn point outside the given radius', () => {
    const center: Vector = { x: 100, y: 100 };
    const radius = 500;
    const spawnPoint = generateSpawnPoint(center, radius, { width: 1600, height: 1200 });

    // Check if the spawn point is actually outside the radius
    const dist = distance(center, spawnPoint);
    expect(dist).toBeGreaterThan(radius);
  });

  it('should generate a spawn point within the game boundaries', () => {
    const center: Vector = { x: 800, y: 600 };
    const radius = 400;
    const gameArea = { width: 1600, height: 1200 };

    for (let i = 0; i < 100; i++) {
      const spawnPoint = generateSpawnPoint(center, radius, gameArea);
      expect(spawnPoint.x).toBeGreaterThanOrEqual(0);
      expect(spawnPoint.x).toBeLessThanOrEqual(gameArea.width);
      expect(spawnPoint.y).toBeGreaterThanOrEqual(0);
      expect(spawnPoint.y).toBeLessThanOrEqual(gameArea.height);
    }
  });

  it('should generate different spawn points on subsequent calls', () => {
    const center: Vector = { x: 100, y: 100 };
    const radius = 500;
    const spawnPoint1 = generateSpawnPoint(center, radius, { width: 1600, height: 1200 });
    const spawnPoint2 = generateSpawnPoint(center, radius, { width: 1600, height: 1200 });

    expect(spawnPoint1).not.toEqual(spawnPoint2);
  });
});
