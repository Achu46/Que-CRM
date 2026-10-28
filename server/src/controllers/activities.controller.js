import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getActivities(req, res, next) {
  try {
    const { entityType, entityId } = req.query;
    const tenantId = req.user.tenantId;

    const activities = await store.list('activities', (act) => {
      if (entityType && act.entityType !== entityType) return false;
      if (entityId && act.entityId !== entityId) return false;
      return true;
    }, tenantId);

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return sendSuccess(res, activities, 'Activities retrieved successfully', 200, { total: activities.length, tenantId });
  } catch (error) {
    next(error);
  }
}

export async function createActivity(req, res, next) {
  try {
    const data = req.body;
    const tenantId = req.user.tenantId;

    const activity = await store.create('activities', {
      ...data,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    }, tenantId);

    return sendSuccess(res, activity, 'Activity logged successfully', 201);
  } catch (error) {
    next(error);
  }
}
