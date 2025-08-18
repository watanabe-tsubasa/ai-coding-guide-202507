import { PrismaClient } from '@prisma/client';
import { openDb, initDb, createTodo, getAllTodos, updateTodo, deleteTodo, getTodoById } from './db';
import sqlite from 'node:sqlite';

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export interface TodoRepository {
  add(text: string): Promise<Todo>;
  list(): Promise<Todo[]>;
  getById(id: number): Promise<Todo | null>;
  update(id: number, text: string, completed: boolean): Promise<Todo | null>;
  delete(id: number): Promise<boolean>;
}

export class SqliteRepository implements TodoRepository {
  private db: sqlite.DatabaseSync;

  constructor(dbOrPath: sqlite.DatabaseSync | string = './database.db') {
    if (typeof dbOrPath === 'string') {
      this.db = openDb(dbOrPath);
    } else {
      this.db = dbOrPath;
    }
    initDb(this.db);
  }

  async add(text: string): Promise<Todo> {
    const newTodo = createTodo(this.db, text);
    return newTodo;
  }

  async list(): Promise<Todo[]> {
    return getAllTodos(this.db);
  }

  async getById(id: number): Promise<Todo | null> {
    return getTodoById(this.db, id);
  }

  async update(id: number, text: string, completed: boolean): Promise<Todo | null> {
    return updateTodo(this.db, id, text, completed);
  }

  async delete(id: number): Promise<boolean> {
    return deleteTodo(this.db, id);
  }
}

export class PrismaRepository implements TodoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async add(text: string): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: {
        text,
        completed: false,
      },
    });
    return todo;
  }

  async list(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  async getById(id: number): Promise<Todo | null> {
    return this.prisma.todo.findUnique({
      where: { id },
    });
  }

  async update(id: number, text: string, completed: boolean): Promise<Todo | null> {
    try {
      const todo = await this.prisma.todo.update({
        where: { id },
        data: { text, completed },
      });
      return todo;
    } catch (error) {
      // P2025: Record to update not found
      if ((error as any).code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.todo.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      // Handle case where todo with id doesn't exist
      return false;
    }
  }

  // Optional: Add a disconnect method for graceful shutdown
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export function getRepository(): TodoRepository {
  const dbType = process.env.DB_TYPE || 'prisma'; // Default to prisma

  switch (dbType.toLowerCase()) {
    case 'sqlite':
      return new SqliteRepository();
    case 'prisma':
      return new PrismaRepository();
    default:
      throw new Error(`Unsupported DB_TYPE: ${dbType}. Use 'sqlite' or 'prisma'.`);
  }
}