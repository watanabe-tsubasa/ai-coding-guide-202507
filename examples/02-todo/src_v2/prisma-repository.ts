import { PrismaClient } from '@prisma/client';
import type { Todo, TodoRepository } from './types.js';

export class PrismaRepository implements TodoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(title: string): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: { title },
    });
    return this.mapTodoFromPrisma(todo);
  }

  async findAll(): Promise<Todo[]> {
    const todos = await this.prisma.todo.findMany({
      orderBy: { id: 'desc' },
    });
    return todos.map(todo => this.mapTodoFromPrisma(todo));
  }

  async findById(id: number): Promise<Todo | null> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });
    return todo ? this.mapTodoFromPrisma(todo) : null;
  }

  async update(id: number, data: Partial<Omit<Todo, 'id' | 'created_at'>>): Promise<Todo | null> {
    try {
      const todo = await this.prisma.todo.update({
        where: { id },
        data,
      });
      return this.mapTodoFromPrisma(todo);
    } catch (error) {
      // Record not found
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.todo.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      // Record not found
      return false;
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private mapTodoFromPrisma(todo: any): Todo {
    return {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      created_at: todo.createdAt.toISOString(),
    };
  }
}