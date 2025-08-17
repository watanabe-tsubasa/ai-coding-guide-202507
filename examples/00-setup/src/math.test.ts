import { describe, it, expect } from 'vitest';
import { add, distance } from './math';

describe('add', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should add a positive and a negative number', () => {
    expect(add(5, -3)).toBe(2);
  });

  it('should add with zero', () => {
    expect(add(0, 5)).toBe(5);
  });
});

describe('distance', () => {
  it('should calculate the distance from the origin', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });

  it('should return 0 for the same point', () => {
    expect(distance(5, 5, 5, 5)).toBe(0);
  });

  it('should calculate the distance between two points', () => {
    expect(distance(1, 1, 4, 5)).toBe(5);
  });
});
