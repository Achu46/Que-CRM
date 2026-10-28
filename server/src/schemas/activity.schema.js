import { z } from 'zod';

export const createActivitySchema = z.object({
  entityType: z.enum(['lead', 'contact', 'deal']),
  entityId: z.string().min(1, 'Target entity ID is required'),
  type: z.enum(['call', 'meeting', 'note', 'email_sent', 'stage_change', 'ai_summary']),
  title: z.string().trim().min(1, 'Title or summary is required'),
  content: z.string().trim().optional().default(''),
  metadata: z.record(z.any()).optional().default({}),
});

