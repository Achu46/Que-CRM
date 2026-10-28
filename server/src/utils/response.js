/**
 * Standard API response envelope helpers
 */

export function sendSuccess(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const payload = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(res, code = 'ERROR', message = 'An error occurred', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(payload);
}

