import type { Response } from 'express';
import type { AppError } from '../types/result.js';

export function handleAppError(error: AppError, res: Response): void {
  switch (error.type) {
    case 'NOT_FOUND':
      res.status(404).json({
        error: {
          code: 404,
          message: `${error.resource} not found`
        }
      });
      break;
      
    case 'VALIDATION_ERROR':
      res.status(400).json({
        error: {
          code: 400,
          message: error.message
        }
      });
      break;
      
    case 'DATABASE_ERROR':
      console.error('Database error:', error.error);
      res.status(500).json({
        error: {
          code: 500,
          message: 'Database error occurred'
        }
      });
      break;
      
    case 'UNKNOWN_ERROR':
    default:
      console.error('Unknown error:', error);
      res.status(500).json({
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
  }
}