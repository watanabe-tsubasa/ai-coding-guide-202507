import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '../generated/prisma/index.js';
import { TodoService } from '../services/todo.service.js';

// Prismaのモック
vi.mock('../generated/prisma/index.js', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    todo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }))
}));

describe('TodoService', () => {
  let todoService: TodoService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    todoService = new TodoService(prisma);
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const mockTodos = [
        { id: '1', title: 'Todo 1', completed: false },
        { id: '2', title: 'Todo 2', completed: true }
      ];
      
      vi.mocked(prisma.todo.findMany).mockResolvedValue(mockTodos as any);
      
      const result = await todoService.findAll();
      
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockTodos);
    });

    it('should return database error on failure', async () => {
      vi.mocked(prisma.todo.findMany).mockRejectedValue(new Error('DB Error'));
      
      const result = await todoService.findAll();
      
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        type: 'DATABASE_ERROR',
        error: expect.any(Error)
      });
    });
  });

  describe('findById', () => {
    it('should return todo when found', async () => {
      const mockTodo = { id: '1', title: 'Todo 1', completed: false };
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(mockTodo as any);
      
      const result = await todoService.findById('1');
      
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockTodo);
    });

    it('should return not found error when todo does not exist', async () => {
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(null);
      
      const result = await todoService.findById('999');
      
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        type: 'NOT_FOUND',
        resource: 'Todo'
      });
    });
  });

  describe('create', () => {
    it('should create todo with valid data', async () => {
      const createDto = { title: 'New Todo', description: 'Description' };
      const mockTodo = { id: '1', ...createDto, completed: false };
      
      vi.mocked(prisma.todo.create).mockResolvedValue(mockTodo as any);
      
      const result = await todoService.create(createDto);
      
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockTodo);
    });

    it('should return validation error for empty title', async () => {
      const result = await todoService.create({ title: '' });
      
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        type: 'VALIDATION_ERROR',
        message: 'Title is required'
      });
    });
  });
});