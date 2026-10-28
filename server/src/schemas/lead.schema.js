import { z } from 'zod';

export const createLeadSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional().default(''),
  email: z.string().trim().email('Invalid email address format'),
  phone: z.string().trim().optional().default(''),
  companyName: z.string().trim().optional().default(''),
  source: z.enum(['website', 'referral', 'linkedin', 'cold_outreach', 'event', 'other']).default('website'),
  status: z.enum(['new', 'contacted', 'qualified', 'disqualified']).default('new'),
  notes: z.string().trim().optional().default(''),
  assignedTo: z.string().trim().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const convertLeadSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required for conversion'),
  dealTitle: z.string().trim().optional(),
  dealAmount: z.number().nonnegative('Deal amount must be non-negative').optional(),
  expectedCloseDate: z.string().optional(),
});
