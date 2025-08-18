import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initDb, createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo } from '../db';
import sqlite from 'node:sqlite';
import fs from 'node:fs';

describe('Database Functions', () => {
  let db: sqlite.DatabaseSync;
  const dbFile = './test-database.db';

  beforeAll(() => {
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
    db = new sqlite.DatabaseSync(dbFile);
    initDb(db);
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
  });

  beforeEach(() => {
    db.exec('DELETE FROM todos');
    db.exec("DELETE FROM sqlite_sequence WHERE name='todos'");
  });

  it('should initialize the database with a todos table', () => {
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'").get();
    expect(tableInfo).toBeDefined();
    expect((tableInfo as any).name).toBe('todos');
  });

  it('should create a new todo', () => {
    const newTodo = createTodo(db, 'Test Todo');
    expect(newTodo).toBeDefined();
    expect(newTodo.id).toBe(1);
    expect(newTodo.text).toBe('Test Todo');
    expect(newTodo.completed).toBe(false);

    const allTodos = getAllTodos(db);
    expect(allTodos.length).toBe(1);
  });

  it('should get all todos', () => {
    createTodo(db, 'Todo 1');
    createTodo(db, 'Todo 2');
    const allTodos = getAllTodos(db);
    expect(allTodos.length).toBe(2);
    expect(allTodos[0].text).toBe('Todo 1');
    expect(allTodos[1].text).toBe('Todo 2');
  });

  it('should get a todo by its ID', () => {
    const todo1 = createTodo(db, 'Todo 1');
    const foundTodo = getTodoById(db, todo1.id);
    expect(foundTodo).toBeDefined();
    expect(foundTodo!.id).toBe(todo1.id);
    expect(foundTodo!.text).toBe('Todo 1');
  });

  it('should return null if todo not found by ID', () => {
    const foundTodo = getTodoById(db, 999);
    expect(foundTodo).toBeNull();
  });

  it('should update a todo', () => {
    const todo = createTodo(db, 'Initial Text');
    const updatedTodo = updateTodo(db, todo.id, 'Updated Text', true);
    
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo!.id).toBe(todo.id);
    expect(updatedTodo!.text).toBe('Updated Text');
    expect(updatedTodo!.completed).toBe(true);

    const foundTodo = getTodoById(db, todo.id);
    expect(foundTodo!.text).toBe('Updated Text');
    expect(foundTodo!.completed).toBe(true);
  });

  it('should return null when trying to update a non-existent todo', () => {
    const updatedTodo = updateTodo(db, 999, 'Does not exist', false);
    expect(updatedTodo).toBeNull();
  });

  it('should delete a todo', () => {
    const todo = createTodo(db, 'To be deleted');
    let allTodos = getAllTodos(db);
    expect(allTodos.length).toBe(1);

    const result = deleteTodo(db, todo.id);
    expect(result).toBe(true);

    allTodos = getAllTodos(db);
    expect(allTodos.length).toBe(0);
  });

  it('should return false when trying to delete a non-existent todo', () => {
    const result = deleteTodo(db, 999);
    expect(result).toBe(false);
  });
});