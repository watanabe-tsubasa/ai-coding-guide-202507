import sqlite from 'node:sqlite';

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export function initDb(db: sqlite.DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL CHECK (completed IN (0, 1))
    )
  `);
}

export function createTodo(db: sqlite.DatabaseSync, text: string): Todo {
  const stmt = db.prepare(
    'INSERT INTO todos (text, completed) VALUES (?, ?) RETURNING *'
  );
  const newTodo = stmt.get(text, 0) as unknown as Todo;

  if (!newTodo) {
    throw new Error('Failed to create todo');
  }

  return {
    ...newTodo,
    completed: !!newTodo.completed,
  };
}

export function getAllTodos(db: sqlite.DatabaseSync): Todo[] {
  const stmt = db.prepare('SELECT * FROM todos ORDER BY id');
  const todos = stmt.all() as unknown as Todo[]; // Explicit cast
  return todos.map(todo => ({
    ...todo,
    completed: !!todo.completed,
  }));
}

export function getTodoById(db: sqlite.DatabaseSync, id: number): Todo | null {
  const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
  const todo = stmt.get(id) as unknown as Todo | undefined; // Explicit cast
  if (!todo) {
    return null;
  }
  return {
    ...todo,
    completed: !!todo.completed,
  };
}

export function updateTodo(db: sqlite.DatabaseSync, id: number, text: string, completed: boolean): Todo | null {
  const stmt = db.prepare(
    'UPDATE todos SET text = ?, completed = ? WHERE id = ? RETURNING *'
  );
  const result = stmt.get(text, completed ? 1 : 0, id) as unknown as
    | Todo
    | undefined;

  if (!result) {
    return null;
  }

  return {
    ...result,
    completed: !!result.completed,
  };
}

export function deleteTodo(db: sqlite.DatabaseSync, id: number): boolean {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function openDb(filename: string = './database.db'): sqlite.DatabaseSync {
  return new sqlite.DatabaseSync(filename);
}