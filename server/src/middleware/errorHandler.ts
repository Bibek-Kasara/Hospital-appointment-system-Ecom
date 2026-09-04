import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    next(new AppError(message, 400));
    return;
  }
  next();
};

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError('Route not found', 404));
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400);
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  if ((err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    return sendError(res, `${field} already exists`, 409);
  }

  console.error('Unhandled error:', err);
  return sendError(res, 'Internal server error', 500);
};
