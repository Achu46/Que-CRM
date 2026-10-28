import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

const OVE_TENANT_HEADER = {
  Authorization: 'Bearer mock_rep_token',
  'x-tenant-id': 'org_ove_main',
};

const QUE_TENANT_HEADER = {
  Authorization: 'Bearer mock_rep_token',
  'x-tenant-id': 'org_que_corp',
};

describe('Multi-Tenancy & Bulk Import Suite', () => {
  // --- MULTI-TENANCY ISOLATION ---
  describe('Tenant Boundary Isolation', () => {
    it('should list organizations available to the user', async () => {
      const res = await request(app)
        .get('/api/organizations/my-orgs')
        .set(OVE_TENANT_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.some((o) => o.id === 'org_ove_main')).toBe(true);
      expect(res.body.data.some((o) => o.id === 'org_que_corp')).toBe(true);
    });

    it('should strictly isolate leads by active tenant header', async () => {
      // Query leads for OVE Solutions
      const oveRes = await request(app).get('/api/leads').set(OVE_TENANT_HEADER);
      expect(oveRes.status).toBe(200);
      expect(oveRes.body.meta.tenantId).toBe('org_ove_main');
      expect(oveRes.body.data.some((l) => l.email === 'liam@manchester-sound.uk')).toBe(false);

      // Query leads for Que Global
      const queRes = await request(app).get('/api/leads').set(QUE_TENANT_HEADER);
      expect(queRes.status).toBe(200);
      expect(queRes.body.meta.tenantId).toBe('org_que_corp');
      expect(queRes.body.data.some((l) => l.email === 'liam@manchester-sound.uk')).toBe(true);
      expect(queRes.body.data.some((l) => l.email === 'marcus.vance@vancetech.io')).toBe(false);
    });

    it('should isolate deals by active tenant header', async () => {
      const oveDeals = await request(app).get('/api/deals').set(OVE_TENANT_HEADER);
      const queDeals = await request(app).get('/api/deals').set(QUE_TENANT_HEADER);

      expect(oveDeals.body.meta.tenantId).toBe('org_ove_main');
      expect(queDeals.body.meta.tenantId).toBe('org_que_corp');
      expect(queDeals.body.data.some((d) => d.title === 'Studio Audio Overhaul')).toBe(true);
      expect(oveDeals.body.data.some((d) => d.title === 'Studio Audio Overhaul')).toBe(false);
    });

    it('should create a new organization tenant', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set(OVE_TENANT_HEADER)
        .send({ name: 'Acme Global Ventures', plan: 'enterprise' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Acme Global Ventures');
      expect(res.body.data.slug).toContain('acme-global-ventures');
    });
  });

  // --- BULK LEAD IMPORT ---
  describe('Bulk Lead Import API', () => {
    it('should reject bulk import with empty leads array', async () => {
      const res = await request(app)
        .post('/api/leads/bulk-import')
        .set(OVE_TENANT_HEADER)
        .send({ leads: [] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should bulk import valid leads and skip duplicates', async () => {
      const batch = [
        {
          firstName: 'Chloe',
          lastName: 'Bennett',
          email: 'chloe.b@shieldtech.com',
          phone: '+1 (555) 777-8888',
          companyName: 'Shield Tech',
          source: 'event',
          notes: 'Met at SaaStr 2026',
        },
        {
          firstName: 'Leo',
          lastName: 'Fitz',
          email: 'fitz@shieldtech.com',
          phone: '+1 (555) 777-9999',
          companyName: 'Shield Tech',
          source: 'referral',
          notes: 'Hardware engineering lead',
        },
        // Duplicate inside the batch
        {
          firstName: 'Chloe Duplicate',
          email: 'chloe.b@shieldtech.com',
        },
        // Duplicate of existing database lead
        {
          firstName: 'Marcus Duplicate',
          email: 'marcus.vance@vancetech.io',
        },
      ];

      const res = await request(app)
        .post('/api/leads/bulk-import')
        .set(OVE_TENANT_HEADER)
        .send({ leads: batch, skipDuplicates: true });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProcessed).toBe(4);
      expect(res.body.data.importedCount).toBe(2);
      expect(res.body.data.skippedCount).toBe(2);

      // Verify imported leads now appear in OVE leads list
      const checkRes = await request(app).get('/api/leads').set(OVE_TENANT_HEADER);
      expect(checkRes.body.data.some((l) => l.email === 'chloe.b@shieldtech.com')).toBe(true);
      expect(checkRes.body.data.some((l) => l.email === 'fitz@shieldtech.com')).toBe(true);
    });
  });
});
