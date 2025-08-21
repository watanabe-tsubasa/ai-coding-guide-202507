import { describe, it, expect } from 'vitest';
import { generateSpawnPoint } from './spawner';
import type { Vector } from '../types/game';
import { distance } from './physics';

describe('spawner utils', () => {
  it('should generate a spawn point outside the given radius', () => {
    const center: Vector = { x: 100, y: 100 };
    const radius = 500;
    const spawnPoint = generateSpawnPoint(center, radius);

    // Check if the spawn point is actually outside the radius
    const dist = distance(center, spawnPoint);
    expect(dist).toBeGreaterThan(radius);
  });

  it('should generate different spawn points on subsequent calls', () => {
    const center: Vector = { x: 100, y: 100 };
    const radius = 500;
    const spawnPoint1 = generateSpawnPoint(center, radius);
    const spawnPoint2 = generateSpawnPoint(center, radius);

    expect(spawnPoint1).not.toEqual(spawnPoint2);
  });
});
