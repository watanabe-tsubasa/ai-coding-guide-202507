import { DatabaseSync } from 'node:sqlite';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export class Database {
  private db: DatabaseSync;

  constructor(filename: string = ':memory:') {
    this.db = new DatabaseSync(filename);
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  create(title: string): Todo {
    const stmt = this.db.prepare(
      'INSERT INTO todos (title) VALUES (?) RETURNING *'
    );
    const result = stmt.get(title) as any;
    return {
      id: result.id as number,
      title: result.title as string,
      completed: Boolean(result.completed),
      created_at: result.created_at as string
    };
  }

  findAll(): Todo[] {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY id DESC');
    const todos = stmt.all() as any[];
    return todos.map(todo => ({
      id: todo.id as number,
      title: todo.title as string,
      completed: Boolean(todo.completed),
      created_at: todo.created_at as string
    }));
  }

  findById(id: number): Todo | null {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE id = ?');
    const todo = stmt.get(id) as any;
    if (!todo) return null;
    return {
      id: todo.id as number,
      title: todo.title as string,
      completed: Boolean(todo.completed),
      created_at: todo.created_at as string
    };
  }

  update(id: number, data: Partial<Omit<Todo, 'id' | 'created_at'>>): Todo | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.completed !== undefined) {
      fields.push('completed = ?');
      values.push(data.completed ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE todos SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    );
    const result = stmt.get(...values) as any;
    if (!result) return null;
    return {
      id: result.id as number,
      title: result.title as string,
      completed: Boolean(result.completed),
      created_at: result.created_at as string
    };
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}