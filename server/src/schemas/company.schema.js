import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  website: z.string().trim().optional().default(''),
  industry: z.string().trim().optional().default('Technology'),
  size: z.string().optional().default('11-50'),
  annualRevenue: z.number().nonnegative().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
