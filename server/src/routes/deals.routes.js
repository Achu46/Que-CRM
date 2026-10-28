import { Router } from 'express';
import {
  getDeals,
  getDealById,
  createDeal,
  updateDealStage,
  updateDeal,
} from '../controllers/deals.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
} from '../schemas/deal.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getDeals);
router.post('/', validate(createDealSchema), createDeal);
router.get('/:id', getDealById);
router.patch('/:id/stage', validate(updateDealStageSchema), updateDealStage);
router.put('/:id', validate(updateDealSchema), updateDeal);

export default router;

