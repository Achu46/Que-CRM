import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../src/middleware/validate.middleware.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { sendSuccess } from '../src/utils/response.js';

describe('Validate Middleware (Zod)', () => {
  const testSchema = z.object({
    email: z.string().email(),
    amount: z.number().positive(),
  });

  const app = express();
  app.use(express.json());
  app.post('/test-validate', validate(testSchema), (req, res) => {
    return sendSuccess(res, req.body, 'Validated');
  });
  app.use(errorHandler);

  it('should accept valid payload', async () => {
    const res = await request(app)
      .post('/test-validate')
      .send({ email: 'client@example.com', amount: 5000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(5000);
  });

  it('should reject invalid email and non-positive amount with 422', async () => {
    const res = await request(app)
      .post('/test-validate')
      .send({ email: 'not-an-email', amount: -10 });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeInstanceOf(Array);
    expect(res.body.error.details.length).toBe(2);
  });
});
