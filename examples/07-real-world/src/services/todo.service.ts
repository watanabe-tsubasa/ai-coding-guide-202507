import { ok, err } from 'neverthrow';
import { PrismaClient } from '../generated/prisma/index.js';
import type { CreateTodoDto, UpdateTodoDto } from '../types/todo.js';
import { AppErrors, type TodoResult, type TodosResult, type VoidResult } from '../types/result.js';

export class TodoService {
  constructor(private prisma: PrismaClient) {}

  async findAll(): TodosResult {
    try {
      const todos = await this.prisma.todo.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return ok(todos);
    } catch (error) {
      return err(AppErrors.database(error));
    }
  }

  async findById(id: string): TodoResult {
    try {
      const todo = await this.prisma.todo.findUnique({
        where: { id }
      });
      
      if (!todo) {
        return err(AppErrors.notFound('Todo'));
      }
      
      return ok(todo);
    } catch (error) {
      return err(AppErrors.database(error));
    }
  }

  async create(data: CreateTodoDto): TodoResult {
    if (!data.title || data.title.trim() === '') {
      return err(AppErrors.validation('Title is required'));
    }

    try {
      const todo = await this.prisma.todo.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority ?? 0,
          dueDate: data.dueDate ? new Date(data.dueDate) : null
        }
      });
      
      return ok(todo);
    } catch (error) {
      return err(AppErrors.database(error));
    }
  }

  async update(id: string, data: UpdateTodoDto): TodoResult {
    try {
      const todo = await this.prisma.todo.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.completed !== undefined && { completed: data.completed }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null })
        }
      });
      
      return ok(todo);
    } catch (error) {
      if (error instanceof Error && error.message.includes('P2025')) {
        return err(AppErrors.notFound('Todo'));
      }
      return err(AppErrors.database(error));
    }
  }

  async delete(id: string): VoidResult {
    try {
      await this.prisma.todo.delete({
        where: { id }
      });
      
      return ok(undefined);
    } catch (error) {
      if (error instanceof Error && error.message.includes('P2025')) {
        return err(AppErrors.notFound('Todo'));
      }
      return err(AppErrors.database(error));
    }
  }
}