import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  archiveLead,
  convertLead,
} from '../controllers/leads.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createLeadSchema,
  updateLeadSchema,
  convertLeadSchema,
} from '../schemas/lead.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getLeads);
router.post('/', validate(createLeadSchema), createLead);
router.get('/:id', getLeadById);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', requireRole(['admin']), archiveLead);
router.post('/:id/convert', validate(convertLeadSchema), convertLead);

export default router;

