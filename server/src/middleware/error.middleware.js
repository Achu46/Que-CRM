import { env } from '../config/env.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
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
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  const errorPayload = {
    code,
    message,
    ...(err.details && { details: err.details }),
    ...(!env.isProduction && { stack: err.stack }),
  };

  if (env.nodeEnv !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, {
      status: statusCode,
      code,
      message,
      details: err.details,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: errorPayload,
  });
}
