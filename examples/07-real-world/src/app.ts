import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.js';
import todosRouter from './routes/todos.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todosRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

export default app;