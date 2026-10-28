import { store } from '../services/store.service.js';
import { n8nService } from '../services/n8n.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getDeals(req, res, next) {
  try {
    const { stage, ownerId } = req.query;

    const deals = await store.list('deals', (deal) => {
      if (stage && stage !== 'all' && deal.stage !== stage) return false;
      if (ownerId && deal.ownerId !== ownerId) return false;
      return true;
    });

    // Calculate pipeline value and stage summary
    const totalPipelineValue = deals
      .filter((d) => d.stage !== '7_lost')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const wonValue = deals
      .filter((d) => d.stage === '6_won')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    return sendSuccess(res, deals, 'Deals retrieved successfully', 200, {
      total: deals.length,
      totalPipelineValue,
      wonValue,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDealById(req, res, next) {
  try {
    const { id } = req.params;
    const deal = await store.getById('deals', id);
    if (!deal) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }

    const activities = await store.list(
      'activities',
      (act) => act.entityType === 'deal' && act.entityId === id
    );

    const tasks = await store.list(
      'tasks',
      (t) => t.entityType === 'deal' && t.entityId === id
    );

    return sendSuccess(res, { ...deal, activities, tasks }, 'Deal details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createDeal(req, res, next) {
  try {
    const data = req.body;

    const deal = await store.create('deals', {
      ...data,
      ownerId: data.ownerId || req.user.uid,
      stageChangedAt: new Date().toISOString(),
    });

    await store.create('activities', {
      entityType: 'deal',
      entityId: deal.id,
      type: 'note',
      title: 'Deal Created',
      content: `Opportunity created with value: $${deal.amount.toLocaleString()} in stage: ${deal.stage}.`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    });

    return sendSuccess(res, deal, 'Deal created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateDealStage(req, res, next) {
  try {
    const { id } = req.params;
    const { stage, lostReason, lostNotes } = req.body;

    const existing = await store.getById('deals', id);
    if (!existing) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }

    const previousStage = existing.stage;
    const updates = {
      stage,
      stageChangedAt: new Date().toISOString(),
      ...(stage === '7_lost' && {
        lostReason,
        lostNotes: lostNotes || '',
        closedAt: new Date().toISOString(),
      }),
      ...(stage === '6_won' && {
        closedAt: new Date().toISOString(),
      }),
    };

    const updated = await store.update('deals', id, updates);

    // Log stage change activity
    await store.create('activities', {
      entityType: 'deal',
      entityId: id,
      type: 'stage_change',
      title: `Stage Changed: ${stage}`,
      content:
        stage === '7_lost'
          ? `Deal marked Lost. Reason: ${lostReason}. ${lostNotes ? `Notes: ${lostNotes}` : ''}`
          : `Moved from ${previousStage} to ${stage}.`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
      metadata: { previousStage, newStage: stage, lostReason },
    });

    // Outbound automation trigger via n8n
    n8nService.dispatch('deal.stage_changed', {
      dealId: id,
      previousStage,
      newStage: stage,
      amount: updated.amount,
      title: updated.title,
    });

    return sendSuccess(res, updated, 'Deal stage updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateDeal(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await store.getById('deals', id);
    if (!existing) {
      throw new AppError('Deal not found', 404, 'NOT_FOUND');
    }

    const updated = await store.update('deals', id, req.body);
    return sendSuccess(res, updated, 'Deal updated successfully');
  } catch (error) {
    next(error);
  }
}

