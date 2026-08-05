import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: err.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    });
  }
  
  console.error(err);

  res.status(500).json({
    message: 'Internal server error.'
  });
};