import { Router } from 'express';
import { getMe, syncUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protected Auth Routes
router.get('/me', authenticate, getMe);
router.post('/sync', authenticate, syncUser);

export default router;

