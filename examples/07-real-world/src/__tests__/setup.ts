import { beforeAll } from 'vitest';

// テスト環境のセットアップ
beforeAll(() => {
  process.env.DATABASE_URL = 'file:./test.db';
});