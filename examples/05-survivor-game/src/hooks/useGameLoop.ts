import { useEffect, useRef, useCallback } from 'react';

interface UseGameLoopProps {
  update: (deltaTime: number) => void;
  render: () => void;
  isRunning: boolean;
}

export const useGameLoop = ({ update, render, isRunning }: UseGameLoopProps) => {
  const animationIdRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isRunning) return;

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // 初回フレームスキップ
      if (deltaTime < 100) {
        update(deltaTime);
      }
      
      render();
      
      animationIdRef.current = requestAnimationFrame(gameLoop);
    },
    [update, render, isRunning]
  );

  useEffect(() => {
    if (isRunning) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameLoop, isRunning]);
};