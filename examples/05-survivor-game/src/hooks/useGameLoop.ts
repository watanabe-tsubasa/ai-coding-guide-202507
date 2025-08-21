import { useEffect, useRef } from 'react';

type GameLoopCallback = (deltaTime: number) => void;

export const useGameLoop = (callback: GameLoopCallback, isRunning = true) => {
  const loopId = useRef<number>();
  const lastTime = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      if (loopId.current) {
        cancelAnimationFrame(loopId.current);
      }
      return;
    }

    const loop = (currentTime: number) => {
      // The first frame has no delta, so we initialize lastTime and skip the callback
      if (lastTime.current === 0) {
        lastTime.current = currentTime;
        loopId.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = currentTime - lastTime.current;
      callback(deltaTime);
      
      lastTime.current = currentTime;
      loopId.current = requestAnimationFrame(loop);
    };

    // Reset lastTime when the loop starts/restarts
    lastTime.current = 0;
    loopId.current = requestAnimationFrame(loop);

    return () => {
      if (loopId.current) {
        cancelAnimationFrame(loopId.current);
      }
    };
  }, [isRunning, callback]);
};
