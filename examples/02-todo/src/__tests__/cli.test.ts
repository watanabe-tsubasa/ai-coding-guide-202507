import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TodoCLI } from '../cli.js';
import { Database } from '../db.js';
import { unlinkSync, existsSync } from 'node:fs';

describe('TodoCLI', () => {
  let cli: TodoCLI;
  const testDbPath = './test-cli-todos.db';
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    // コンソール出力をモック
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit');
    });
    
    // テスト用DBでCLIを初期化
    cli = new TodoCLI(testDbPath);
  });

  afterEach(() => {
    cli.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    vi.restoreAllMocks();
  });

  describe('add command', () => {
    it('should add a new todo', async () => {
      await cli.run(['add', 'Test todo']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Created todo #')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test todo')
      );
    });

    it('should handle multiple word titles', async () => {
      await cli.run(['add', 'Buy', 'some', 'groceries']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Buy some groceries')
      );
    });

    it('should error when no title provided', async () => {
      await expect(cli.run(['add'])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:', 'Please provide a todo title'
      );
    });
  });

  describe('list command', () => {
    it('should show message when no todos exist', async () => {
      await cli.run(['list']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'No todos found. Add one with: todo add "Your task"'
      );
    });

    it('should list all todos', async () => {
      // いくつかのTodoを追加
      const db = new Database(testDbPath);
      db.create('First todo');
      db.create('Second todo');
      const completedTodo = db.create('Completed todo');
      db.update(completedTodo.id, { completed: true });
      db.close();

      await cli.run(['list']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 Your todos:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('First todo')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Second todo')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completed todo')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Progress: 1/3 completed')
      );
    });
  });

  describe('done command', () => {
    it('should mark todo as completed', async () => {
      // Todoを追加
      const db = new Database(testDbPath);
      const todo = db.create('Test todo');
      db.close();

      await cli.run(['done', todo.id.toString()]);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Marked todo #')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test todo')
      );
    });

    it('should error when no ID provided', async () => {
      await expect(cli.run(['done'])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:', 'Please provide a valid todo ID'
      );
    });

    it('should error when invalid ID provided', async () => {
      await expect(cli.run(['done', 'abc'])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:', 'Please provide a valid todo ID'
      );
    });

    it('should error when todo not found', async () => {
      await expect(cli.run(['done', '999'])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:', 'Todo #999 not found'
      );
    });
  });

  describe('undone command', () => {
    it('should mark todo as not completed', async () => {
      // 完了済みのTodoを追加
      const db = new Database(testDbPath);
      const todo = db.create('Test todo');
      db.update(todo.id, { completed: true });
      db.close();

      await cli.run(['undone', todo.id.toString()]);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('⬜ Marked todo #')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test todo')
      );
    });
  });

  describe('delete command', () => {
    it('should delete todo', async () => {
      // Todoを追加
      const db = new Database(testDbPath);
      const todo = db.create('To be deleted');
      db.close();

      await cli.run(['delete', todo.id.toString()]);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🗑️  Deleted todo #')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('To be deleted')
      );
    });

    it('should error when todo not found', async () => {
      await expect(cli.run(['delete', '999'])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:', 'Todo #999 not found'
      );
    });
  });

  describe('help command', () => {
    it('should show help message', async () => {
      await cli.run(['help']);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Todo CLI - Simple task management')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Commands:')
      );
    });
  });

  describe('unknown command', () => {
    it('should show error and help for unknown command', async () => {
      await expect(cli.run(['unknown'])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: unknown');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Todo CLI - Simple task management')
      );
    });
  });

  describe('no command', () => {
    it('should show error and help when no command provided', async () => {
      await expect(cli.run([])).rejects.toThrow('Process exit');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: undefined');
    });
  });
});