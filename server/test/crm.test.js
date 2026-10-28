import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

const AUTH_HEADER = { Authorization: 'Bearer mock_rep_token' };
const ADMIN_HEADER = { Authorization: 'Bearer mock_admin_token' };

describe('Core CRM API Suite', () => {
  let createdLeadId = null;
  let createdDealId = null;
  let createdTaskId = null;

  // --- LEADS ---
  describe('Leads Management & Conversion', () => {
    it('should list leads with default seed data', async () => {
      const res = await request(app).get('/api/leads').set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should create a new lead with validation', async () => {
      const newLead = {
        firstName: 'Arthur',
        lastName: 'Dent',
        email: 'arthur.dent@hitchhiker.org',
        phone: '+1 (555) 424-2424',
        companyName: 'Megadodo Publications',
        source: 'website',
        notes: 'Needs universal translation module.',
      };

      const res = await request(app).post('/api/leads').set(AUTH_HEADER).send(newLead);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Arthur');
      expect(res.body.data.id).toBeDefined();
      createdLeadId = res.body.data.id;
    });

    it('should warn on duplicate email creation', async () => {
      const dupLead = {
        firstName: 'Duplicate',
        email: 'arthur.dent@hitchhiker.org',
      };

      const res = await request(app).post('/api/leads').set(AUTH_HEADER).send(dupLead);

      expect(res.status).toBe(201);
      expect(res.body.data.warning).toContain('duplicate');
    });

    it('should atomically convert a lead into Company, Contact, and Deal', async () => {
      const conversionPayload = {
        companyName: 'Megadodo Publications Ltd.',
        dealTitle: 'Galactic Enterprise Subscription',
        dealAmount: 42000,
        expectedCloseDate: '2026-12-01',
      };

      const res = await request(app)
        .post(`/api/leads/${createdLeadId}/convert`)
        .set(AUTH_HEADER)
        .send(conversionPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company).toBeDefined();
      expect(res.body.data.contact).toBeDefined();
      expect(res.body.data.deal).toBeDefined();
      expect(res.body.data.deal.amount).toBe(42000);
    });

    it('should prevent re-converting an already converted lead', async () => {
      const res = await request(app)
        .post(`/api/leads/${createdLeadId}/convert`)
        .set(AUTH_HEADER)
        .send({ companyName: 'Another Org' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ALREADY_CONVERTED');
    });
  });

  // --- DEALS & PIPELINE ---
  describe('Deals & Kanban Pipeline', () => {
    it('should list deals with total pipeline calculations', async () => {
      const res = await request(app).get('/api/deals').set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta.totalPipelineValue).toBeGreaterThan(0);
    });

    it('should create a deal and validate positive amounts', async () => {
      const res = await request(app).post('/api/deals').set(AUTH_HEADER).send({
        title: 'New AI Expansion Pack',
        amount: 35000,
        stage: '1_new',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('New AI Expansion Pack');
      createdDealId = res.body.data.id;
    });

    it('should allow valid stage transitions', async () => {
      const res = await request(app)
        .patch(`/api/deals/${createdDealId}/stage`)
        .set(AUTH_HEADER)
        .send({ stage: '3_meeting_scheduled' });

      expect(res.status).toBe(200);
      expect(res.body.data.stage).toBe('3_meeting_scheduled');
    });

    it('should reject Closed Lost stage when lostReason is omitted', async () => {
      const res = await request(app)
        .patch(`/api/deals/${createdDealId}/stage`)
        .set(AUTH_HEADER)
        .send({ stage: '7_lost' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept Closed Lost when valid reason is provided', async () => {
      const res = await request(app)
        .patch(`/api/deals/${createdDealId}/stage`)
        .set(AUTH_HEADER)
        .send({
          stage: '7_lost',
          lostReason: 'Budget frozen until next fiscal year',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.stage).toBe('7_lost');
      expect(res.body.data.lostReason).toBe('Budget frozen until next fiscal year');
    });
  });

  // --- TASKS & ACTIVITIES ---
  describe('Tasks & Activities', () => {
    it('should create a task attached to a deal', async () => {
      const res = await request(app).post('/api/tasks').set(AUTH_HEADER).send({
        title: 'Send revisited ROI summary',
        dueDate: '2026-11-15',
        priority: 'high',
        entityType: 'deal',
        entityId: createdDealId,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      createdTaskId = res.body.data.id;
    });

    it('should complete task and record completion', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/complete`)
        .set(AUTH_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });

    it('should record and fetch activity log for an entity', async () => {
      const actRes = await request(app).post('/api/activities').set(AUTH_HEADER).send({
        entityType: 'deal',
        entityId: createdDealId,
        type: 'call',
        title: 'Quick check-in call with sponsor',
        content: 'Customer confirmed Q1 revisit date.',
      });

      expect(actRes.status).toBe(201);

      const listRes = await request(app)
        .get(`/api/activities?entityType=deal&entityId=${createdDealId}`)
        .set(AUTH_HEADER);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
