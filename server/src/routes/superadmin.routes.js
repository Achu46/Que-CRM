import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  superAdminReviewSchema,
  tenantStatusUpdateSchema,
} from '../schemas/onboarding.schema.js';
import {
  getPlatformDashboard,
  listApplications,
  getApplicationDetail,
  reviewApplication,
  listTenants,
  updateTenantStatus,
  listAuditLogs,
} from '../controllers/superadmin.controller.js';

const router = Router();

// Platform Super Admin routes (requires authentication + Super Admin role)
router.use(authenticate, requireSuperAdmin);

router.get('/dashboard', getPlatformDashboard);
router.get('/applications', listApplications);
router.get('/applications/:id', getApplicationDetail);
router.post('/applications/:id/review', validate(superAdminReviewSchema), reviewApplication);
router.get('/tenants', listTenants);
router.patch('/tenants/:id/status', validate(tenantStatusUpdateSchema), updateTenantStatus);
router.get('/audit-logs', listAuditLogs);

export default router;
