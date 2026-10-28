import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Auth Middleware & /api/auth/me', () => {
  it('should reject request without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject request with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic 123456');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should authenticate user with mock sales_rep token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer mock_rep_token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('sales_rep');
    expect(res.body.data.email).toBe('sales_rep@ove.com');
  });

  it('should authenticate user with mock admin token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer mock_admin_token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('admin');
  });
});
