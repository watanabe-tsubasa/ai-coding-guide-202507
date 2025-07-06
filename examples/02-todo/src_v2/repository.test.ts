import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteRepository } from './sqlite-repository.js';
import { PrismaRepository } from './prisma-repository.js';
import { PrismaClient } from '@prisma/client';
import type { TodoRepository } from './types.js';
import fs from 'node:fs';

// テスト用のデータベースファイル
const TEST_DB = './test-todos.db';

// 両方のリポジトリ実装をテスト
describe.each([
  ['SqliteRepository', () => new SqliteRepository(TEST_DB)],
  ['PrismaRepository', () => new PrismaRepository()],
])('%s', (name, createRepo) => {
  let repository: TodoRepository;
  let prisma: PrismaClient;

  beforeEach(async () => {
    // Prismaの場合は事前にデータをクリア
    if (name === 'PrismaRepository') {
      prisma = new PrismaClient();
      await prisma.todo.deleteMany();
    }
    
    repository = createRepo();
  });

  afterEach(async () => {
    if (repository.close) {
      await repository.close();
    }
    
    // Prismaの場合は接続を閉じる
    if (name === 'PrismaRepository' && prisma) {
      await prisma.$disconnect();
    }
    
    // SQLiteのテストDBを削除
    if (name === 'SqliteRepository' && fs.existsSync(TEST_DB)) {
      fs.unlinkSync(TEST_DB);
    }
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todo = await repository.create('Test Todo');
      
      expect(todo.id).toBeGreaterThan(0);
      expect(todo.title).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      expect(todo.created_at).toBeTruthy();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no todos exist', async () => {
      const todos = await repository.findAll();
      expect(todos).toEqual([]);
    });

    it('should return all todos', async () => {
      await repository.create('Todo 1');
      await repository.create('Todo 2');
      await repository.create('Todo 3');

      const todos = await repository.findAll();
      
      expect(todos).toHaveLength(3);
      expect(todos[0].title).toBe('Todo 3'); // 降順でソート
      expect(todos[1].title).toBe('Todo 2');
      expect(todos[2].title).toBe('Todo 1');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent todo', async () => {
      const todo = await repository.findById(999);
      expect(todo).toBeNull();
    });

    it('should return todo by id', async () => {
      const created = await repository.create('Find me');
      const found = await repository.findById(created.id);
      
      expect(found).not.toBeNull();
      expect(found?.title).toBe('Find me');
      expect(found?.id).toBe(created.id);
    });
  });

  describe('update', () => {
    it('should return null for non-existent todo', async () => {
      const updated = await repository.update(999, { completed: true });
      expect(updated).toBeNull();
    });

    it('should update todo completed status', async () => {
      const todo = await repository.create('Update me');
      expect(todo.completed).toBe(false);
      
      const updated = await repository.update(todo.id, { completed: true });
      
      expect(updated).not.toBeNull();
      expect(updated?.completed).toBe(true);
      expect(updated?.title).toBe('Update me');
    });

    it('should update todo title', async () => {
      const todo = await repository.create('Old title');
      
      const updated = await repository.update(todo.id, { title: 'New title' });
      
      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('New title');
    });
  });

  describe('delete', () => {
    it('should return false for non-existent todo', async () => {
      const deleted = await repository.delete(999);
      expect(deleted).toBe(false);
    });

    it('should delete existing todo', async () => {
      const todo = await repository.create('Delete me');
      
      const deleted = await repository.delete(todo.id);
      expect(deleted).toBe(true);
      
      const found = await repository.findById(todo.id);
      expect(found).toBeNull();
    });
  });
});