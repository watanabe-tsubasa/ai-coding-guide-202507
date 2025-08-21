import { renderHook, act } from '@testing-library/react';
import { useKeyboard } from './useKeyboard';
import { describe, it, expect } from 'vitest';

describe('useKeyboard', () => {
  it('should return a set of pressed keys', () => {
    const { result } = renderHook(() => useKeyboard());
    expect(result.current).toBeInstanceOf(Set);
    expect(result.current.size).toBe(0);
  });

  it('should update the set of pressed keys on keydown and keyup', () => {
    const { result } = renderHook(() => useKeyboard());

    // Simulate keydown
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(result.current.has('ArrowUp')).toBe(true);
    expect(result.current.size).toBe(1);

    // Simulate another keydown
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(result.current.has('ArrowUp')).toBe(true);
    expect(result.current.has('ArrowLeft')).toBe(true);
    expect(result.current.size).toBe(2);

    // Simulate keyup
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    });
    expect(result.current.has('ArrowUp')).toBe(false);
    expect(result.current.has('ArrowLeft')).toBe(true);
    expect(result.current.size).toBe(1);
  });
});
