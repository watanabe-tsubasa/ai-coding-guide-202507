import { describe, it, expect } from 'vitest';
import { add, distance } from './math';

describe('add function', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should add positive and negative numbers', () => {
    expect(add(5, -3)).toBe(2);
  });

  it('should add two negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
    expect(add(0, 0)).toBe(0);
  });
});

describe('distance function', () => {
  it('should calculate distance from origin', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });

  it('should return 0 for same points', () => {
    expect(distance(5, 5, 5, 5)).toBe(0);
  });

  it('should calculate distance between arbitrary points', () => {
    expect(distance(1, 1, 4, 5)).toBe(5);
  });

  it('should handle negative coordinates', () => {
    expect(distance(-1, -1, 2, 3)).toBe(5);
  });
});