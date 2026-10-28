import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
} from '../controllers/companies.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCompanySchema } from '../schemas/company.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getCompanies);
router.post('/', validate(createCompanySchema), createCompany);
router.get('/:id', getCompanyById);

export default router;

