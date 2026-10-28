import { Router } from 'express';
import {
  summarizeInteractions,
  draftEmail,
  extractLead,
  summarizeSchema,
  draftEmailSchema,
  extractLeadSchema,
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/summarize', validate(summarizeSchema), summarizeInteractions);
router.post('/draft-email', validate(draftEmailSchema), draftEmail);
router.post('/extract-lead', validate(extractLeadSchema), extractLead);

export default router;

