import { Result } from 'neverthrow';
import type { Todo } from '../generated/prisma/index.js';

// エラー型の定義
export type AppError = 
  | { type: 'NOT_FOUND'; resource: string }
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'DATABASE_ERROR'; error: unknown }
  | { type: 'UNKNOWN_ERROR'; error: unknown };

// Result型のエイリアス
export type AppResult<T> = Result<T, AppError>;

// Todo関連の型
export type TodoResult = AppResult<Todo>;
export type TodosResult = AppResult<Todo[]>;
export type VoidResult = AppResult<void>;

// エラーコンストラクター
export const AppErrors = {
  notFound: (resource: string): AppError => ({
    type: 'NOT_FOUND',
    resource
  }),
  
  validation: (message: string): AppError => ({
    type: 'VALIDATION_ERROR',
    message
  }),
  
  database: (error: unknown): AppError => ({
    type: 'DATABASE_ERROR',
    error
  }),
  
  unknown: (error: unknown): AppError => ({
    type: 'UNKNOWN_ERROR',
    error
  })
};