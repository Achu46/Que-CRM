import { AppError } from './error.middleware.js';

/**
 * Higher-order middleware to validate incoming request data using Zod
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Target request property (default: 'body')
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          issue: e.message,
        }));
        return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', details));
      }
      next(err);
    }
  };
}
