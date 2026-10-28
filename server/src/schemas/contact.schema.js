import { z } from 'zod';

export const createContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional().default(''),
  email: z.string().trim().email('Invalid email address format'),
  phone: z.string().trim().optional().default(''),
  jobTitle: z.string().trim().optional().default(''),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const updateContactSchema = createContactSchema.partial();
