import { useEffect, useRef } from 'react';

interface KeyState {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
}

export const useKeyboard = () => {
  const keysRef = useRef<KeyState>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in keysRef.current) {
        keysRef.current[e.key as keyof KeyState] = true;
        e.preventDefault(); // ページのスクロールを防ぐ
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keysRef.current) {
        keysRef.current[e.key as keyof KeyState] = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keysRef;
};