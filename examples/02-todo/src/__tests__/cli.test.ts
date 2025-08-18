import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
// Import the original classes, but getRepository will be mocked
import { SqliteRepository, getRepository, PrismaRepository } from '../repository';
import { openDb, initDb } from '../db';
import sqlite from 'node:sqlite';

// Dynamically import runCliApp inside beforeEach
let runCliApp: typeof import('../cli').runCliApp;

// Mock getRepository specifically, while keeping original implementations of classes
vi.mock('../repository', async (importOriginal) => {
  const original = await importOriginal<typeof import('../repository')>();
  return {
    ...original,
    // Mock getRepository, the rest is original.
    // We will provide the implementation in each test.
    getRepository: vi.fn(),
  };
});

describe('CLI Integration Tests', () => {
  let consoleOutput: string[] = [];
  let consoleErrorOutput: string[] = [];

  // Mock console.log and console.error
  const mockConsole = {
    log: (...args: any[]) => { consoleOutput.push(args.join(' ')); },
    error: (...args: any[]) => { consoleErrorOutput.push(args.join(' ')); },
  } as Console;

  // Helper to run tests for a specific repository type
  const runTestsForRepositoryType = (testDbType: 'sqlite' | 'prisma') => {
    describe(`with DB_TYPE=${testDbType}`, () => {
      let sqliteDb: sqlite.DatabaseSync; // Declare here
      let prismaClient: PrismaClient; // Declare here

      beforeEach(async () => {
        consoleOutput = [];
        consoleErrorOutput = [];
        process.exitCode = 0;

        // Set the environment variable for the test
        process.env.DB_TYPE = testDbType;

        // Initialize database based on type
        if (testDbType === 'sqlite') {
          sqliteDb = openDb(':memory:'); // Open a single in-memory db
          initDb(sqliteDb); // Initialize schema for it
          // Mock getRepository to return a real SqliteRepository with the shared db
          vi.mocked(getRepository).mockImplementation(() => new SqliteRepository(sqliteDb));
        } else {
          prismaClient = new PrismaClient();
          await prismaClient.todo.deleteMany({}); // Clean up Prisma db
          // Mock getRepository to return a real PrismaRepository
          vi.mocked(getRepository).mockImplementation(() => new PrismaRepository());
        }

        // Import runCliApp after setting env var and mock
        const cliModule = await import('../cli');
        runCliApp = cliModule.runCliApp;
      });

      afterEach(async () => {
        // Clear the environment variable
        delete process.env.DB_TYPE;

        // Close database connections
        if (testDbType === 'sqlite') {
          sqliteDb.close();
        } else {
          await prismaClient?.$disconnect();
        }
      });

      it('should add a todo', async () => {
        await runCliApp(['add', 'Test Todo from CLI'], mockConsole);
        const addedMessage = consoleOutput[0];
        expect(addedMessage).toMatch(/Added todo: "Test Todo from CLI" with ID \d+/);

        const match = addedMessage.match(/ID (\d+)/);
        const todoId = match ? parseInt(match[1], 10) : null;
        expect(todoId).not.toBeNull();

        // Verify directly using the appropriate client
        if (testDbType === 'sqlite') {
          const repo = new SqliteRepository(sqliteDb);
          const todos = await repo.list();
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe('Test Todo from CLI');
          expect(todos[0].completed).toBe(false);
          expect(todos[0].id).toBe(todoId);
        } else {
          const todos = await prismaClient.todo.findMany();
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe('Test Todo from CLI');
          expect(todos[0].completed).toBe(false);
          expect(todos[0].id).toBe(todoId);
        }
      });

      it('should list todos', async () => {
        // Add directly using the appropriate client
        if (testDbType === 'sqlite') {
          const repo = new SqliteRepository(sqliteDb);
          await repo.add('Todo 1');
          await repo.add('Todo 2');
        } else {
          await prismaClient.todo.create({ data: { text: 'Todo 1', completed: false } });
          await prismaClient.todo.create({ data: { text: 'Todo 2', completed: false } });
        }

        consoleOutput = []; // Clear output from add commands
        await runCliApp(['list'], mockConsole);
        expect(consoleOutput[0]).toContain('--- TODOs ---');
        // Verify content without relying on specific IDs from CLI output
        expect(consoleOutput[1]).toMatch(/\\\[ \\\\\\] \\\\d+: Todo 1/);
        expect(consoleOutput[2]).toMatch(/\\\[ \\\\\\] \\\\d+: Todo 2/);
      });

      it('should mark a todo as done', async () => {
        let initialTodoId: number | null = null;
        if (testDbType === 'sqlite') {
          const repo = new SqliteRepository(sqliteDb);
          const initialTodo = await repo.add('Task to complete');
          initialTodoId = initialTodo.id;
        } else {
          const initialTodo = await prismaClient.todo.create({ data: { text: 'Task to complete', completed: false } });
          initialTodoId = initialTodo.id;
        }

        consoleOutput = []; // Clear output from add command
        await runCliApp(['done', String(initialTodoId)], mockConsole);
        expect(consoleOutput[0]).toContain('Completed todo: "Task to complete"');

        // Verify directly using the appropriate client
        if (testDbType === 'sqlite') {
          const repo = new SqliteRepository(sqliteDb);
          const todo = await repo.getById(initialTodoId!);
          expect(todo).toBeDefined();
          expect(todo!.completed).toBe(true);
        } else {
          const todo = await prismaClient.todo.findUnique({ where: { id: initialTodoId! } });
          expect(todo).toBeDefined();
          expect(todo!.completed).toBe(true);
        }
      });

      it('should delete a todo', async () => {
        let initialTodoId: number | null = null;
        if (testDbType === 'sqlite') {
          const repo = new SqliteRepository(sqliteDb);
          const initialTodo = await repo.add('Task to delete');
          initialTodoId = initialTodo.id;
        } else {
          const initialTodo = await prismaClient.todo.create({ data: { text: 'Task to delete', completed: false } });
          initialTodoId = initialTodo.id;
        }

        consoleOutput = []; // Clear output from add command
        await runCliApp(['delete', String(initialTodoId)], mockConsole);
        expect(consoleOutput[0]).toContain('Deleted todo with ID ' + initialTodoId);

        // Verify directly using the appropriate client
        if (testDbType === 'sqlite') {
          const repo = new SqliteRepository(sqliteDb);
          const todos = await repo.list();
          expect(todos.length).toBe(0);
        }
        else {
          const todos = await prismaClient.todo.findMany();
          expect(todos.length).toBe(0);
        }
      });

      it('should show error for missing add text', async () => {
        let errorThrown = false;
        try {
          await runCliApp(['add'], mockConsole);
        } catch (e: any) {
          errorThrown = true;
          expect(e.message).toContain('Missing text for "add" command.');
        }
        expect(errorThrown).toBe(true);
        expect(consoleErrorOutput[0]).toContain('Error: Missing text for "add" command.');
      });

      it('should show error for invalid done ID', async () => {
        let errorThrown = false;
        try {
          await runCliApp(['done', 'invalid'], mockConsole);
        } catch (e: any) {
          errorThrown = true;
          expect(e.message).toContain('Invalid ID provided.');
        } 
        expect(errorThrown).toBe(true);
        expect(consoleErrorOutput[0]).toContain('Error: Invalid ID provided.');
      });

      it('should show error for non-existent done ID', async () => {
        let errorThrown = false;
        try {
          await runCliApp(['done', '999'], mockConsole);
        } catch (e: any) {
          errorThrown = true;
          expect(e.message).toContain('Todo with ID 999 not found.');
        }
        expect(errorThrown).toBe(true);
        expect(consoleErrorOutput[0]).toContain('Error: Todo with ID 999 not found.');
      });

      it('should show error for invalid delete ID', async () => {
        let errorThrown = false;
        try {
          await runCliApp(['delete', 'invalid'], mockConsole);
        } catch (e: any) {
          errorThrown = true;
          expect(e.message).toContain('Invalid ID provided.');
        }
        expect(errorThrown).toBe(true);
        expect(consoleErrorOutput[0]).toContain('Error: Invalid ID provided.');
      });

      it('should show error for non-existent delete ID', async () => {
        let errorThrown = false;
        try {
          await runCliApp(['delete', '999'], mockConsole);
        } catch (e: any) {
          errorThrown = true;
          expect(e.message).toContain('Todo with ID 999 not found.');
        }
        expect(errorThrown).toBe(true);
        expect(consoleErrorOutput[0]).toContain('Error: Todo with ID 999 not found.');
      });

      it('should show usage for unknown command', async () => {
        let errorThrown = false;
        try {
          await runCliApp(['unknown_command'], mockConsole);
        } catch (e: any) {
          errorThrown = true;
          expect(e.message).toContain('Unknown command');
        }
        expect(errorThrown).toBe(true);
        expect(consoleOutput[0]).toContain('Unknown command: unknown_command');
        expect(consoleOutput[0]).toContain('Usage:');
      });
    });
  };

  // Run the test suite for both repository types
  runTestsForRepositoryType('sqlite');
  runTestsForRepositoryType('prisma');
});