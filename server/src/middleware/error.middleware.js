import { env } from '../config/env.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handling middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    status: statusCode,
    message,
    ...(err.details && { details: err.details }),
    ...(!env.isProduction && { stack: err.stack }),
  };

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, {
    status: statusCode,
    message,
    details: err.details,
    stack: !env.isProduction ? err.stack : undefined,
  });

  res.status(statusCode).json(response);
}

