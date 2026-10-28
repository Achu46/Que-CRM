import { Router } from 'express';
import {
  getActivities,
  createActivity,
} from '../controllers/activities.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createActivitySchema } from '../schemas/activity.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getActivities);
router.post('/', validate(createActivitySchema), createActivity);

export default router;
