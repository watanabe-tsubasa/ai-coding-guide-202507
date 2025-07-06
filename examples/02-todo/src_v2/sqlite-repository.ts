import { Database } from '../src/db.js';
import type { Todo, TodoRepository } from './types.js';

export class SqliteRepository implements TodoRepository {
  private db: Database;

  constructor(filename: string = './todos.db') {
    this.db = new Database(filename);
  }

  async create(title: string): Promise<Todo> {
    return this.db.create(title);
  }

  async findAll(): Promise<Todo[]> {
    return this.db.findAll();
  }

  async findById(id: number): Promise<Todo | null> {
    return this.db.findById(id);
  }

  async update(id: number, data: Partial<Omit<Todo, 'id' | 'created_at'>>): Promise<Todo | null> {
    return this.db.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.db.delete(id);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}