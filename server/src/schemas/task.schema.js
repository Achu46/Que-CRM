import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  description: z.string().trim().optional().default(''),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(),
  entityType: z.enum(['lead', 'contact', 'deal']),
  entityId: z.string().min(1, 'Target entity ID is required'),
  entityTitle: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
