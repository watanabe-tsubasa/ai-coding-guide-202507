import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import type { CreateTodoDto, UpdateTodoDto } from '../types/todo.js';
import { TodoService } from '../services/todo.service.js';
import { handleAppError } from '../utils/error-handler.js';

const router = Router();
const prisma = new PrismaClient();
const todoService = new TodoService(prisma);

// GET /api/todos
router.get('/', async (req, res) => {
  const result = await todoService.findAll();
  
  result.match(
    (todos) => res.json({ data: todos }),
    (error) => handleAppError(error, res)
  );
});

// GET /api/todos/:id
router.get('/:id', async (req, res) => {
  const result = await todoService.findById(req.params.id);
  
  result.match(
    (todo) => res.json({ data: todo }),
    (error) => handleAppError(error, res)
  );
});

// POST /api/todos
router.post('/', async (req, res) => {
  const data: CreateTodoDto = req.body;
  const result = await todoService.create(data);
  
  result.match(
    (todo) => res.status(201).json({ data: todo }),
    (error) => handleAppError(error, res)
  );
});

// PATCH /api/todos/:id
router.patch('/:id', async (req, res) => {
  const data: UpdateTodoDto = req.body;
  const result = await todoService.update(req.params.id, data);
  
  result.match(
    (todo) => res.json({ data: todo }),
    (error) => handleAppError(error, res)
  );
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  const result = await todoService.delete(req.params.id);
  
  result.match(
    () => res.status(204).send(),
    (error) => handleAppError(error, res)
  );
});

export default router;