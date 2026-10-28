import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';
import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string().trim().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  plan: z.enum(['starter', 'pro', 'enterprise']).default('pro'),
});

export async function getMyOrganizations(req, res, next) {
  try {
    const orgs = await store.list('organizations');
    return sendSuccess(res, orgs, 'User organizations retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCurrentOrganization(req, res, next) {
  try {
    const currentTenantId = req.user.tenantId;
    const org = await store.getById('organizations', currentTenantId);
    if (!org) {
      throw new AppError('Active organization not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, org, 'Active organization profile');
  } catch (error) {
    next(error);
  }
}

export async function createOrganization(req, res, next) {
  try {
    const { name, plan } = req.body;
    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newOrg = await store.create('organizations', {
      name,
      slug,
      plan,
      ownerId: req.user.uid,
    });

    return sendSuccess(res, newOrg, 'Organization created successfully', 201);
  } catch (error) {
    next(error);
  }
}

