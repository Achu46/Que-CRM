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

/**
 * Enforces Super Admin privileges for platform governance routes
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return next(new AppError('Unauthorized request', 401, 'UNAUTHORIZED'));
  }

  if (!req.user.isSuperAdmin && req.user.role !== 'super_admin') {
    return next(
      new AppError(
        'Access denied. Platform Super Admin privileges required.',
        403,
        'SUPER_ADMIN_FORBIDDEN'
      )
    );
  }

  next();
}

