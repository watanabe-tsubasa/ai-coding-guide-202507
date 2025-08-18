
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteRepository, PrismaRepository, TodoRepository, Todo } from '../repository';
import { PrismaClient } from '@prisma/client';
import { openDb, initDb } from '../db';
import sqlite from 'node:sqlite';

// Helper function to run common tests for any TodoRepository implementation
function testTodoRepository(repositoryName: string, getRepository: () => TodoRepository) {
  describe(repositoryName, () => {
    let repository: TodoRepository;

    beforeEach(async () => {
      repository = getRepository();
      // Ensure a clean state for each test
      if (repository instanceof PrismaRepository) {
        // For Prisma, delete all records before each test
        const prisma = (repository as any).prisma as PrismaClient;
        await prisma.todo.deleteMany({});
      } else if (repository instanceof SqliteRepository) {
        // For Sqlite, use an in-memory database for testing
        // Re-initialize the database for each test
        const db = (repository as any).db as sqlite.DatabaseSync;
        db.exec('DROP TABLE IF EXISTS todos');
        initDb(db);
      }
    });

    afterEach(async () => {
      if (repository instanceof PrismaRepository) {
        await (repository as PrismaRepository).disconnect();
      }
    });

    it('should add a todo', async () => {
      const todo = await repository.add('Test Todo');
      expect(todo).toBeDefined();
      expect(todo.text).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      const listedTodos = await repository.list();
      expect(listedTodos).toHaveLength(1);
    });

    it('should list all todos', async () => {
      await repository.add('Todo 1');
      await repository.add('Todo 2');
      const todos = await repository.list();
      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('Todo 1');
      expect(todos[1].text).toBe('Todo 2');
    });

    it('should get a todo by ID', async () => {
      const todo1 = await repository.add('Todo 1');
      const foundTodo = await repository.getById(todo1.id);
      expect(foundTodo).toEqual(todo1);
    });

    it('should return null for a non-existent ID', async () => {
      const foundTodo = await repository.getById(999);
      expect(foundTodo).toBeNull();
    });

    it('should update a todo', async () => {
      const todo = await repository.add('Original Todo');
      const updatedTodo = await repository.update(todo.id, 'Updated Todo', true);
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo!.text).toBe('Updated Todo');
      expect(updatedTodo!.completed).toBe(true);
      const foundTodo = await repository.getById(todo.id);
      expect(foundTodo).toEqual(updatedTodo);
    });

    it('should return null when updating a non-existent todo', async () => {
      const updatedTodo = await repository.update(999, 'Non Existent', true);
      expect(updatedTodo).toBeNull();
    });

    it('should delete a todo', async () => {
      const todo = await repository.add('Todo to delete');
      const deleted = await repository.delete(todo.id);
      expect(deleted).toBe(true);
      const foundTodo = await repository.getById(todo.id);
      expect(foundTodo).toBeNull();
    });

    it('should return false when deleting a non-existent todo', async () => {
      const deleted = await repository.delete(999);
      expect(deleted).toBe(false);
    });
  });
}

// Run tests for SqliteRepository
testTodoRepository('SqliteRepository', () => {
  // Use an in-memory database for testing SqliteRepository
  const db = openDb(':memory:');
  initDb(db);
  return new SqliteRepository(':memory:');
});

// Run tests for PrismaRepository
testTodoRepository('PrismaRepository', () => new PrismaRepository());
