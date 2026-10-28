import { z } from 'zod';

/**
 * Zod Schemas for Public SaaS Onboarding & Super Admin Review
 */

export const registrationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long'),
  workEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid work email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(25, 'Phone number is too long'),
  industry: z
    .string()
    .trim()
    .min(2, 'Industry is required')
    .max(50, 'Industry name is too long'),
  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-500', '500+'])
    .default('1-10'),
  ownerName: z
    .string()
    .trim()
    .min(2, 'Contact / Owner name must be at least 2 characters')
    .max(60, 'Owner name is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const planSelectionSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(1, 'Application ID is required'),
  planId: z
    .enum(['starter', 'pro', 'enterprise']),
  billingCycle: z
    .enum(['monthly', 'annual'])
    .default('monthly'),
});

export const paymentSubmissionSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(1, 'Application ID is required'),
  paymentReference: z
    .string()
    .trim()
    .min(3, 'Payment reference (e.g., UTR / Wire transaction number) is required')
    .max(80, 'Payment reference is too long'),
  proofNotes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .default(''),
  proofFileUrl: z
    .string()
    .trim()
    .optional()
    .default(''),
});

export const superAdminReviewSchema = z.object({
  decision: z
    .enum(['approve', 'reject', 'request_info']),
  notes: z
    .string()
    .trim()
    .min(3, 'Review notes / rationale is required')
    .max(1000, 'Notes cannot exceed 1000 characters'),
});

export const tenantStatusUpdateSchema = z.object({
  status: z
    .enum(['active', 'suspended']),
  reason: z
    .string()
    .trim()
    .min(3, 'Reason for status change is required')
    .max(500, 'Reason cannot exceed 500 characters'),
});
