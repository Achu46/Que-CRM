import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { env } from '../src/config/env.js';

const AUTH_HEADER = { Authorization: 'Bearer mock_rep_token' };

describe('Integrations API Suite (Resend, Gemini, n8n)', () => {
  // --- RESEND EMAIL ---
  describe('Email Dispatch via Resend API', () => {
    it('should reject email with invalid recipient format', async () => {
      const res = await request(app)
        .post('/api/emails/send')
        .set(AUTH_HEADER)
        .send({
          to: 'invalid-email',
          subject: 'Test Subject',
          text: 'Test Body',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should send/simulate email and record activity log', async () => {
      const res = await request(app)
        .post('/api/emails/send')
        .set(AUTH_HEADER)
        .send({
          to: 'sarah.jenkins@acme.com',
          subject: 'Q4 Contract Proposal Review',
          text: 'Hi Sarah, please find the updated proposal attached.',
          contactId: 'cont_1',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messageId).toBeDefined();
      expect(res.body.data.status).toBeDefined();

      // Check that activity log was added to contact
      const actRes = await request(app)
        .get('/api/activities?entityType=contact&entityId=cont_1')
        .set(AUTH_HEADER);

      expect(actRes.status).toBe(200);
      const emailActivity = actRes.body.data.find((a) => a.type === 'email_sent');
      expect(emailActivity).toBeDefined();
      expect(emailActivity.title).toContain('Q4 Contract Proposal Review');
    });
  });

  // --- GEMINI AI ASSISTANT ---
  describe('Gemini AI Assistant', () => {
    it('should summarize contact interaction history', async () => {
      const res = await request(app)
        .post('/api/ai/summarize')
        .set(AUTH_HEADER)
        .send({
          contactName: 'Sarah Jenkins',
          entityType: 'contact',
          entityId: 'cont_1',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(typeof res.body.data.summary).toBe('string');
      expect(res.body.data.summary.length).toBeGreaterThan(20);
    });

    it('should generate a personalized follow-up email draft', async () => {
      const res = await request(app)
        .post('/api/ai/draft-email')
        .set(AUTH_HEADER)
        .send({
          contactName: 'Sarah Jenkins',
          companyName: 'Acme Corporation',
          userInstructions: 'Ask if they reviewed the SLA clause.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBeDefined();
      expect(res.body.data.body).toContain('Sarah');
    });

    it('should extract structured lead fields from raw inquiry text', async () => {
      const inquiry = 'Hi, I am Alex Drake from Zenith Tech (alex@zenithtech.io, 555-123-4567). We need an enterprise CRM urgently for our 50 sales reps.';

      const res = await request(app)
        .post('/api/ai/extract-lead')
        .set(AUTH_HEADER)
        .send({ inquiryText: inquiry });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('alex@zenithtech.io');
    });
  });

  // --- n8n WEBHOOKS ---
  describe('n8n Webhook Automations', () => {
    it('should reject inbound lead without valid secret header', async () => {
      const res = await request(app)
        .post('/api/webhooks/n8n/lead')
        .send({ firstName: 'Hacker', email: 'spam@bot.com' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED_WEBHOOK');
    });

    it('should ingest lead from n8n with valid x-crm-secret', async () => {
      const res = await request(app)
        .post('/api/webhooks/n8n/lead')
        .set('x-crm-secret', env.n8n.inboundSecret)
        .send({
          firstName: 'Elena',
          lastName: 'Rostova',
          email: 'elena@novasystems.de',
          companyName: 'Nova Systems',
          source: 'website',
          notes: 'Ingested via n8n landing page form',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Elena');
      expect(res.body.data.email).toBe('elena@novasystems.de');
    });
  });
});
