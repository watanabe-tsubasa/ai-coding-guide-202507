import { renderHook, act } from '@testing-library/react';
import { useGameLoop } from './useGameLoop';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  // Simulate 60fps by default, but timers will be faked
  return setTimeout(() => cb(performance.now()), 16) as unknown as number;
});
vi.stubGlobal('cancelAnimationFrame', (id: number) => {
  clearTimeout(id);
});

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(vi.getRealSystemTime);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should call the callback function on each frame', () => {
    const callback = vi.fn();
    renderHook(() => useGameLoop(callback));

    act(() => {
      // Advance time by a little more than 3 frames (16 * 3 = 48)
      vi.advanceTimersByTime(50);
    });

    // 1st frame (16ms) -> no call, 2nd (32ms) -> call, 3rd (48ms) -> call
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should pass the delta time to the callback', () => {
    const callback = vi.fn();
    let lastTime = 0;
    vi.spyOn(performance, 'now')
      .mockImplementation(() => {
        lastTime += 16; // Simulate 16ms passing each time
        return lastTime;
      });

    renderHook(() => useGameLoop(callback));

    // First frame, initializes time, no callback
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(callback).not.toHaveBeenCalled();

    // Second frame, callback should be called with delta
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.closeTo(16));
  });

  it('should not call the callback when isRunning is false', () => {
    const callback = vi.fn();
    renderHook(() => useGameLoop(callback, false));

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
