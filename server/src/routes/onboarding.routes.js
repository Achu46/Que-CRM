import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import {
  registrationSchema,
  planSelectionSchema,
  paymentSubmissionSchema,
} from '../schemas/onboarding.schema.js';
import {
  getSubscriptionPlans,
  registerApplication,
  selectPlan,
  submitPayment,
  getApplicationStatus,
} from '../controllers/onboarding.controller.js';

const router = Router();

// Public Onboarding Endpoints
router.get('/plans', getSubscriptionPlans);
router.post('/register', validate(registrationSchema), registerApplication);
router.post('/select-plan', validate(planSelectionSchema), selectPlan);
router.post('/submit-payment', validate(paymentSubmissionSchema), submitPayment);
router.get('/status/:id', getApplicationStatus);

export default router;
