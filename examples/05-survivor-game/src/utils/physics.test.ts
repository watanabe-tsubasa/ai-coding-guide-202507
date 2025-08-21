import { describe, it, expect } from 'vitest';
import { add, subtract, distance, normalize } from './physics';
import type { Vector } from '../types/game';

describe('physics utils', () => {
  it('should add two vectors', () => {
    const v1: Vector = { x: 1, y: 2 };
    const v2: Vector = { x: 3, y: 4 };
    const result = add(v1, v2);
    expect(result).toEqual({ x: 4, y: 6 });
  });

  it('should subtract two vectors', () => {
    const v1: Vector = { x: 3, y: 4 };
    const v2: Vector = { x: 1, y: 2 };
    const result = subtract(v1, v2);
    expect(result).toEqual({ x: 2, y: 2 });
  });

  it('should calculate the distance between two vectors', () => {
    const v1: Vector = { x: 0, y: 0 };
    const v2: Vector = { x: 3, y: 4 };
    const result = distance(v1, v2);
    expect(result).toBe(5);
  });

  it('should normalize a vector', () => {
    const v1: Vector = { x: 3, y: 4 };
    const result = normalize(v1);
    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
  });
});
