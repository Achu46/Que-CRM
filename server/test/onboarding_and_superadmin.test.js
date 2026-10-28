import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('SaaS Onboarding & Super Admin Governance API', () => {
  const superAdminAuth = 'Bearer mock_super_admin';
  const regularAdminAuth = 'Bearer mock_admin_token';
  const salesRepAuth = 'Bearer mock_sales_rep_token';

  let testApplicationId = '';

  describe('1. Public Company Onboarding Flow', () => {
    it('GET /api/onboarding/plans - returns subscription tiers and pricing', async () => {
      const res = await request(app).get('/api/onboarding/plans');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);

      const proPlan = res.body.data.find((p) => p.id === 'pro');
      expect(proPlan).toBeDefined();
      expect(proPlan.priceMonthly).toBe(149);
      expect(proPlan.limits.maxLeads).toBe(10000);
    });

    it('POST /api/onboarding/register - successfully registers company in submitted state', async () => {
      const uniqueEmail = `testowner_${Date.now()}@acmehaul.com`;
      const res = await request(app)
        .post('/api/onboarding/register')
        .send({
          companyName: 'Acme Freight & Haulage',
          workEmail: uniqueEmail,
          phone: '+1 (555) 789-0123',
          industry: 'Freight & Logistics',
          companySize: '11-50',
          ownerName: 'Arthur Dent',
          password: 'SecurePassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.applicationId).toBeDefined();
      expect(res.body.data.status).toBe('submitted');

      testApplicationId = res.body.data.applicationId;
    });

    it('POST /api/onboarding/register - rejects duplicate active email with 409', async () => {
      // Re-register with the seeded under_review email
      const res = await request(app)
        .post('/api/onboarding/register')
        .send({
          companyName: 'Duplicate Inc',
          workEmail: 'admin@apexlogistics.com',
          phone: '+1 (555) 000-0000',
          industry: 'Logistics',
          companySize: '1-10',
          ownerName: 'Copy Cat',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/onboarding/select-plan - transitions application to payment_pending', async () => {
      const res = await request(app)
        .post('/api/onboarding/select-plan')
        .send({
          applicationId: testApplicationId,
          planId: 'pro',
          billingCycle: 'annual',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('payment_pending');
      expect(res.body.data.amountDue).toBe(1490);
      expect(res.body.data.paymentInstructions).toBeDefined();
      expect(res.body.data.paymentInstructions.bankName).toBeDefined();
    });

    it('POST /api/onboarding/submit-payment - transitions application to under_review', async () => {
      const res = await request(app)
        .post('/api/onboarding/submit-payment')
        .send({
          applicationId: testApplicationId,
          paymentReference: 'WIRE-TEST-998822',
          proofNotes: 'Annual Pro wire payment initiated from Wells Fargo',
          proofFileUrl: 'https://example.com/receipts/proof_998822.pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('under_review');
      expect(res.body.data.paymentReference).toBe('WIRE-TEST-998822');
    });

    it('GET /api/onboarding/status/:id - allows applicant to track application', async () => {
      const res = await request(app).get(`/api/onboarding/status/${testApplicationId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('under_review');
      expect(res.body.data.companyName).toBe('Acme Freight & Haulage');
      expect(res.body.data.planId).toBe('pro');
    });
  });

  describe('2. Super Admin Authorization & Platform Governance', () => {
    it('GET /api/super-admin/dashboard - rejects unauthorized and non-super-admin users with 403', async () => {
      // No token -> 401
      const noAuthRes = await request(app).get('/api/super-admin/dashboard');
      expect(noAuthRes.status).toBe(401);

      // Regular tenant admin token -> 403
      const regularAdminRes = await request(app)
        .get('/api/super-admin/dashboard')
        .set('Authorization', regularAdminAuth);
      expect(regularAdminRes.status).toBe(403);
      expect(regularAdminRes.body.error.code).toBe('SUPER_ADMIN_FORBIDDEN');

      // Sales rep token -> 403
      const salesRepRes = await request(app)
        .get('/api/super-admin/dashboard')
        .set('Authorization', salesRepAuth);
      expect(salesRepRes.status).toBe(403);
    });

    it('GET /api/super-admin/dashboard - returns platform KPIs and audit logs for Super Admin', async () => {
      const res = await request(app)
        .get('/api/super-admin/dashboard')
        .set('Authorization', superAdminAuth);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalTenants).toBeGreaterThanOrEqual(2);
      expect(res.body.data.metrics.monthlyRecurringRevenue).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.recentApplications)).toBe(true);
      expect(Array.isArray(res.body.data.recentAuditLogs)).toBe(true);
    });

    it('GET /api/super-admin/applications - lists pending company applications', async () => {
      const res = await request(app)
        .get('/api/super-admin/applications?status=under_review')
        .set('Authorization', superAdminAuth);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((a) => a.id === testApplicationId);
      expect(found).toBeDefined();
      expect(found.status).toBe('under_review');
    });

    it('POST /api/super-admin/applications/:id/review - atomically approves and provisions tenant workspace', async () => {
      const res = await request(app)
        .post(`/api/super-admin/applications/${testApplicationId}/review`)
        .set('Authorization', superAdminAuth)
        .send({
          decision: 'approve',
          notes: 'Wire payment reference WIRE-TEST-998822 verified. Workspace provisioned.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.status).toBe('approved');
      expect(res.body.data.organization).toBeDefined();

      const provisionedOrg = res.body.data.organization;
      expect(provisionedOrg.name).toBe('Acme Freight & Haulage');
      expect(provisionedOrg.plan).toBe('pro');
      expect(provisionedOrg.status).toBe('active');
      expect(provisionedOrg.limits.maxLeads).toBe(10000);

      // Verify tenant is visible in /api/super-admin/tenants
      const tenantsRes = await request(app)
        .get('/api/super-admin/tenants')
        .set('Authorization', superAdminAuth);
      expect(tenantsRes.status).toBe(200);
      const tenantMatch = tenantsRes.body.data.find((t) => t.id === provisionedOrg.id);
      expect(tenantMatch).toBeDefined();
    });

    it('PATCH /api/super-admin/tenants/:id/status - suspends and reactivates a tenant workspace', async () => {
      // Suspend
      const suspendRes = await request(app)
        .patch('/api/super-admin/tenants/org_que_corp/status')
        .set('Authorization', superAdminAuth)
        .send({
          status: 'suspended',
          reason: 'Subscription renewal payment delayed',
        });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.status).toBe('suspended');

      // Reactivate
      const reactivateRes = await request(app)
        .patch('/api/super-admin/tenants/org_que_corp/status')
        .set('Authorization', superAdminAuth)
        .send({
          status: 'active',
          reason: 'Renewal payment cleared',
        });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.status).toBe('active');
    });

    it('GET /api/super-admin/audit-logs - returns platform administrative logs', async () => {
      const res = await request(app)
        .get('/api/super-admin/audit-logs')
        .set('Authorization', superAdminAuth);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      // Contains the approval event
      const approvalLog = res.body.data.find((log) => log.action === 'application_approved');
      expect(approvalLog).toBeDefined();
    });
  });
});
