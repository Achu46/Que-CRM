import { Router } from 'express';
import { handleInboundLead } from '../controllers/webhook.controller.js';

const router = Router();

// Inbound webhook from n8n (protected via secret header)
router.post('/n8n/lead', handleInboundLead);

export default router;
