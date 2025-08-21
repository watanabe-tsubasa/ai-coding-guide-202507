import type { Vector } from '../types/game';

export const add = (v1: Vector, v2: Vector): Vector => {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
};

export const subtract = (v1: Vector, v2: Vector): Vector => {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
};

export const distance = (v1: Vector, v2: Vector): number => {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const magnitude = (v: Vector): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export const normalize = (v: Vector): Vector => {
  const mag = magnitude(v);
  if (mag === 0) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / mag, y: v.y / mag };
};