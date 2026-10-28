import { AppError } from './error.middleware.js';

/**
 * Enforces role-based authorization guards on protected routes
 * @param {string | string[]} roles - Required role(s), e.g. 'admin' or ['admin', 'sales_rep']
 */
export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized request', 401, 'UNAUTHORIZED'));
    }

    if (!allowed.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of [${allowed.join(', ')}] role(s).`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
