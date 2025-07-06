import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

export const TestInput: React.FC = () => {
  const [lastInput, setLastInput] = useState<string>('');
  const [lastKey, setLastKey] = useState<any>({});
  const { exit } = useApp();

  useInput((input, key) => {
    setLastInput(input);
    setLastKey(key);
    
    if (input === 'q') {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>キー入力テスト</Text>
      <Text>最後の入力: "{lastInput}"</Text>
      <Text>キーコード: {lastInput.charCodeAt(0)}</Text>
      <Text>キーオブジェクト: {JSON.stringify(lastKey, null, 2)}</Text>
      <Text color="gray">矢印キーを押してみてください。[Q]で終了</Text>
    </Box>
  );
};