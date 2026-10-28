import { env } from '../config/env.js';
import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Inbound webhook for n8n or external website forms to submit leads
 * Validates the x-crm-secret header for authentication.
 */
export async function handleInboundLead(req, res, next) {
  try {
    const providedSecret = req.headers['x-crm-secret'];
    if (!providedSecret || providedSecret !== env.n8n.inboundSecret) {
      throw new AppError('Invalid or missing webhook secret', 401, 'UNAUTHORIZED_WEBHOOK');
    }

    const { firstName, lastName, email, phone, companyName, notes, source } = req.body;

    if (!firstName || !email) {
      throw new AppError('firstName and email are required fields', 422, 'VALIDATION_ERROR');
    }

    const newLead = await store.create('leads', {
      firstName,
      lastName: lastName || '',
      email,
      phone: phone || '',
      companyName: companyName || '',
      source: source || 'website',
      status: 'new',
      notes: notes || 'Submitted via n8n automation webhook',
      assignedTo: 'user_sales_rep_123',
      isConverted: false,
      isArchived: false,
    });

    await store.create('activities', {
      entityType: 'lead',
      entityId: newLead.id,
      type: 'note',
      title: 'Lead Ingested via n8n',
      content: `Inbound lead received from external webhook. Source: ${newLead.source}.`,
      performedBy: 'system',
      performedByName: 'n8n Automation Engine',
    });

    return sendSuccess(res, newLead, 'Lead ingested via n8n webhook', 201);
  } catch (error) {
    next(error);
  }
}
