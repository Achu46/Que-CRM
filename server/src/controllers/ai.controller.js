import { z } from 'zod';
import { geminiService } from '../services/gemini.service.js';
import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';

export const summarizeSchema = z.object({
  contactName: z.string().optional(),
  entityType: z.enum(['contact', 'lead', 'deal']).optional(),
  entityId: z.string().optional(),
  activities: z.array(z.any()).optional(),
});

export const draftEmailSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  companyName: z.string().optional(),
  userInstructions: z.string().optional(),
  activities: z.array(z.any()).optional(),
});

export const extractLeadSchema = z.object({
  inquiryText: z.string().min(5, 'Inquiry text must be at least 5 characters'),
});

export async function summarizeInteractions(req, res, next) {
  try {
    const { contactName, entityType, entityId } = req.body;
    let activities = req.body.activities || [];

    if (!activities.length && entityType && entityId) {
      activities = await store.list(
        'activities',
        (a) => a.entityType === entityType && a.entityId === entityId
      );
    }

    const result = await geminiService.summarizeInteractions(activities, contactName);
    return sendSuccess(res, result, 'AI interaction summary generated');
  } catch (error) {
    next(error);
  }
}

export async function draftEmail(req, res, next) {
  try {
    const { contactName, companyName, userInstructions, activities } = req.body;

    const result = await geminiService.generateFollowUpDraft({
      contactName,
      companyName,
      activities: activities || [],
      userInstructions,
      repName: req.user.name,
    });

    return sendSuccess(res, result, 'Personalized follow-up draft generated');
  } catch (error) {
    next(error);
  }
}

export async function extractLead(req, res, next) {
  try {
    const { inquiryText } = req.body;
    const result = await geminiService.extractLeadFromText(inquiryText);
    return sendSuccess(res, result, 'Structured lead fields extracted');
  } catch (error) {
    next(error);
  }
}

