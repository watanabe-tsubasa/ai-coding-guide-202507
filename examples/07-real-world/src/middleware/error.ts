import type { Request, Response, NextFunction } from 'express';

// グローバルエラーハンドラー（neverthrowで処理されなかったエラー用）
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 500
    }
  });
};