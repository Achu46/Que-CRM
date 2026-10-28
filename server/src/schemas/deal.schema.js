import { z } from 'zod';

export const DEAL_STAGES = [
  '1_new',
  '2_qualified',
  '3_meeting_scheduled',
  '4_proposal_sent',
  '5_negotiation',
  '6_won',
  '7_lost',
];

export const createDealSchema = z.object({
  title: z.string().trim().min(1, 'Deal title is required'),
  amount: z.number().nonnegative('Amount must be non-negative'),
  currency: z.string().default('USD'),
  stage: z.enum(DEAL_STAGES).default('1_new'),
  probability: z.number().min(0).max(100).optional().default(20),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  expectedCloseDate: z.string().optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const updateDealStageSchema = z.object({
  stage: z.enum(DEAL_STAGES),
  lostReason: z.string().trim().optional(),
  lostNotes: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  if (data.stage === '7_lost' && (!data.lostReason || data.lostReason.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Lost reason is required when marking a deal as Closed Lost',
      path: ['lostReason'],
    });
  }
});

