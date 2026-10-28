import { Router } from 'express';
import {
  getMyOrganizations,
  getCurrentOrganization,
  createOrganization,
  createOrgSchema,
} from '../controllers/organizations.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/my-orgs', getMyOrganizations);
router.get('/current', getCurrentOrganization);
router.post('/', validate(createOrgSchema), createOrganization);

export default router;
