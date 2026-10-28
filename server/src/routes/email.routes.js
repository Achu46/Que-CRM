import { Router } from 'express';
import { sendEmail, sendEmailSchema } from '../controllers/email.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/send', validate(sendEmailSchema), sendEmail);

export default router;

