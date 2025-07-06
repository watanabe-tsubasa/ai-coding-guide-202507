import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TodoCLI } from './cli.js';
import * as fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const TEST_DB = ':memory:'; // メモリDBを使用

describe('TodoCLI', () => {
  let cli: TodoCLI;
  let consoleSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(async () => {
    // 環境変数をSQLiteに設定
    process.env.DB_TYPE = 'sqlite';
    process.env.DATABASE_URL = TEST_DB;
    
    cli = new TodoCLI();
    
    // コンソール出力をモック
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(async () => {
    await cli.close();
    
    // モックを復元
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    
    // 環境変数をクリア
    delete process.env.DB_TYPE;
    delete process.env.DATABASE_URL;
  });

  describe('add command', () => {
    it('should add a new todo', async () => {
      await cli.run(['add', 'Test', 'todo', 'item']);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/✅ Created todo #\d+: Test todo item/)
      );
    });

    it('should fail without title', async () => {
      await expect(cli.run(['add'])).rejects.toThrow('process.exit');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Please provide a todo title');
    });
  });

  describe('list command', () => {
    it('should show empty message when no todos', async () => {
      await cli.run(['list']);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'No todos found. Add one with: todo add "Your task"'
      );
    });

    it('should list todos', async () => {
      await cli.run(['add', 'First todo']);
      await cli.run(['add', 'Second todo']);
      
      consoleSpy.mockClear();
      await cli.run(['list']);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Your todos:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/⬜ \[\d+\] First todo/));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/⬜ \[\d+\] Second todo/));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/📊 Progress: 0\/2 completed/));
    });
  });

  describe('done command', () => {
    it('should mark todo as completed', async () => {
      await cli.run(['add', 'Complete me']);
      
      consoleSpy.mockClear();
      await cli.run(['done', '1']);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/✅ Marked todo #\d+ as completed: Complete me/)
      );
    });

    it('should fail with invalid ID', async () => {
      await expect(cli.run(['done', 'abc'])).rejects.toThrow('process.exit');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Please provide a valid todo ID');
    });

    it('should fail with non-existent ID', async () => {
      await expect(cli.run(['done', '999'])).rejects.toThrow('process.exit');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Todo #999 not found');
    });
  });

  describe('undone command', () => {
    it('should mark todo as not completed', async () => {
      await cli.run(['add', 'Uncomplete me']);
      await cli.run(['done', '1']);
      
      consoleSpy.mockClear();
      await cli.run(['undone', '1']);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/⬜ Marked todo #\d+ as not completed: Uncomplete me/)
      );
    });
  });

  describe('delete command', () => {
    it('should delete todo', async () => {
      await cli.run(['add', 'Delete me']);
      
      consoleSpy.mockClear();
      await cli.run(['delete', '1']);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/🗑️  Deleted todo #\d+: Delete me/)
      );
    });

    it('should fail with non-existent ID', async () => {
      await expect(cli.run(['delete', '999'])).rejects.toThrow('process.exit');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Todo #999 not found');
    });
  });

  describe('help command', () => {
    it('should show help message', async () => {
      await cli.run(['help']);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Todo CLI v2 - Simple task management with repository pattern')
      );
    });
  });

  describe('unknown command', () => {
    it('should show error and help', async () => {
      try {
        await cli.run(['unknown']);
      } catch (error) {
        // process.exit をモックしているのでエラーを無視
      }
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: unknown');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Todo CLI v2 - Simple task management with repository pattern')
      );
    });
  });
});

// Prismaリポジトリでのテスト
describe.skip('TodoCLI with Prisma', () => {
  let cli: TodoCLI;
  let consoleSpy: any;
  let prisma: PrismaClient;

  beforeEach(async () => {
    // 環境変数をPrismaに設定
    process.env.DB_TYPE = 'prisma';
    
    // Prismaのデータをクリア
    prisma = new PrismaClient();
    await prisma.todo.deleteMany().catch(() => {
      // テーブルが存在しない場合はエラーを無視
    });
    
    cli = new TodoCLI();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await cli.close();
    await prisma.$disconnect();
    consoleSpy.mockRestore();
  });

  it('should work with Prisma repository', async () => {
    await cli.run(['add', 'Prisma todo']);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/✅ Created todo #\d+: Prisma todo/)
    );
    
    consoleSpy.mockClear();
    await cli.run(['list']);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/⬜ \[\d+\] Prisma todo/));
  });
});