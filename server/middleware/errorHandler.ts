import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry', message: 'Resource already exists' });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
