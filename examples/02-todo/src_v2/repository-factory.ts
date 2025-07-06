import { TodoRepository } from './types.js';
import { SqliteRepository } from './sqlite-repository.js';
import { PrismaRepository } from './prisma-repository.js';

export function createRepository(type?: string): TodoRepository {
  const dbType = type || process.env.DB_TYPE || 'sqlite';
  
  switch (dbType) {
    case 'prisma':
      return new PrismaRepository();
    case 'sqlite':
    default:
      // テスト用のDBファイルパスを環境変数から取得
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './todos.db';
      return new SqliteRepository(dbPath);
  }
}