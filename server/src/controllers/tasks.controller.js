import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getTasks(req, res, next) {
  try {
    const { status, priority, entityType, entityId } = req.query;
    const tenantId = req.user.tenantId;

    const tasks = await store.list('tasks', (task) => {
      if (status && status !== 'all' && task.status !== status) return false;
      if (priority && priority !== 'all' && task.priority !== priority) return false;
      if (entityType && task.entityType !== entityType) return false;
      if (entityId && task.entityId !== entityId) return false;
      return true;
    }, tenantId);

    tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return sendSuccess(res, tasks, 'Tasks retrieved successfully', 200, { total: tasks.length, tenantId });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const data = req.body;
    const tenantId = req.user.tenantId;

    const task = await store.create('tasks', {
      ...data,
      status: 'pending',
      assignedTo: data.assignedTo || req.user.uid,
    }, tenantId);

    return sendSuccess(res, task, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function completeTask(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const existing = await store.getById('tasks', id, tenantId);
    if (!existing) {
      throw new AppError('Task not found', 404, 'NOT_FOUND');
    }

    const updated = await store.update('tasks', id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    }, tenantId);

    await store.create('activities', {
      entityType: existing.entityType,
      entityId: existing.entityId,
      type: 'note',
      title: 'Task Completed',
      content: `Completed task: "${existing.title}".`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    }, tenantId);

    return sendSuccess(res, updated, 'Task marked as completed');
  } catch (error) {
    next(error);
  }
}
