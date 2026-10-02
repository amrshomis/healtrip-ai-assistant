import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Global error handler middleware.
 * Sends structured JSON error responses.
 * Never exposes internal error details in production.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Unexpected errors — don't leak internals
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
