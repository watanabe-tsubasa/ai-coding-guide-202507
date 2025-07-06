import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database, type Todo } from '../db.js';
import { unlinkSync, existsSync } from 'node:fs';

describe('Database', () => {
  let db: Database;
  const testDbPath = './test-todos.db';

  beforeEach(() => {
    // メモリDBを使用してテスト
    db = new Database(':memory:');
  });

  afterEach(() => {
    // ファイルベースのテストの場合のクリーンアップ
    if (existsSync(testDbPath)) {
      db.close();
      unlinkSync(testDbPath);
    }
  });

  describe('初期化', () => {
    it('should create todos table on initialization', () => {
      // テーブルが作成されていることを確認
      const todos = db.findAll();
      expect(todos).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new todo', () => {
      const todo = db.create('Test Todo');
      
      expect(todo).toMatchObject({
        title: 'Test Todo',
        completed: false
      });
      expect(todo.id).toBeDefined();
      expect(todo.id).toBeGreaterThan(0);
      expect(todo.created_at).toBeDefined();
    });

    it('should create multiple todos with unique IDs', () => {
      const todo1 = db.create('Todo 1');
      const todo2 = db.create('Todo 2');
      
      expect(todo1.id).not.toBe(todo2.id);
      expect(todo1.title).toBe('Todo 1');
      expect(todo2.title).toBe('Todo 2');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no todos exist', () => {
      const todos = db.findAll();
      expect(todos).toEqual([]);
    });

    it('should return all todos', () => {
      db.create('Todo 1');
      db.create('Todo 2');
      db.create('Todo 3');
      
      const todos = db.findAll();
      
      expect(todos).toHaveLength(3);
      expect(todos[0].title).toBe('Todo 3'); // 新しい順
      expect(todos[1].title).toBe('Todo 2');
      expect(todos[2].title).toBe('Todo 1');
    });
  });

  describe('findById', () => {
    it('should find todo by ID', () => {
      const created = db.create('Find me');
      const found = db.findById(created.id);
      
      expect(found).toMatchObject({
        id: created.id,
        title: 'Find me',
        completed: false
      });
    });

    it('should return null when todo not found', () => {
      const found = db.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update todo title', () => {
      const todo = db.create('Original title');
      const updated = db.update(todo.id, { title: 'Updated title' });
      
      expect(updated).toMatchObject({
        id: todo.id,
        title: 'Updated title',
        completed: false
      });
    });

    it('should update todo completed status', () => {
      const todo = db.create('Test todo');
      const updated = db.update(todo.id, { completed: true });
      
      expect(updated).toMatchObject({
        id: todo.id,
        title: 'Test todo',
        completed: true
      });
    });

    it('should update multiple properties', () => {
      const todo = db.create('Test todo');
      const updated = db.update(todo.id, { 
        title: 'Updated', 
        completed: true 
      });
      
      expect(updated).toMatchObject({
        id: todo.id,
        title: 'Updated',
        completed: true
      });
    });

    it('should return null when todo not found', () => {
      const updated = db.update(999, { title: 'Not found' });
      expect(updated).toBeNull();
    });

    it('should return original todo when no data provided', () => {
      const todo = db.create('Test todo');
      const updated = db.update(todo.id, {});
      
      expect(updated).toMatchObject({
        id: todo.id,
        title: 'Test todo',
        completed: false
      });
    });
  });

  describe('delete', () => {
    it('should delete todo by ID', () => {
      const todo = db.create('To be deleted');
      const deleted = db.delete(todo.id);
      
      expect(deleted).toBe(true);
      
      const found = db.findById(todo.id);
      expect(found).toBeNull();
    });

    it('should return false when todo not found', () => {
      const deleted = db.delete(999);
      expect(deleted).toBe(false);
    });

    it('should only delete specified todo', () => {
      const todo1 = db.create('Todo 1');
      const todo2 = db.create('Todo 2');
      const todo3 = db.create('Todo 3');
      
      db.delete(todo2.id);
      
      const todos = db.findAll();
      expect(todos).toHaveLength(2);
      expect(todos.find(t => t.id === todo1.id)).toBeDefined();
      expect(todos.find(t => t.id === todo2.id)).toBeUndefined();
      expect(todos.find(t => t.id === todo3.id)).toBeDefined();
    });
  });

  describe('ファイルベースのDB', () => {
    it('should persist data to file', () => {
      // ファイルDBを作成
      const fileDb = new Database(testDbPath);
      const todo = fileDb.create('Persistent todo');
      fileDb.close();
      
      // 新しいインスタンスで読み込み
      const newDb = new Database(testDbPath);
      const todos = newDb.findAll();
      
      expect(todos).toHaveLength(1);
      expect(todos[0].title).toBe('Persistent todo');
      
      newDb.close();
    });
  });
});