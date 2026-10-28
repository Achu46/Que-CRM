import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Returns comprehensive, live database aggregates for the Executive Dashboard
 * Multi-tenant: metrics strictly isolated to the requesting user's tenantId.
 */
export async function getDashboardMetrics(req, res, next) {
  try {
    const tenantId = req.user.tenantId;

    const [allLeads, allDeals, allTasks, allActivities] = await Promise.all([
      store.list('leads', (l) => !l.isArchived, tenantId),
      store.list('deals', null, tenantId),
      store.list('tasks', null, tenantId),
      store.list('activities', null, tenantId),
    ]);

    // 1. Lead Metrics
    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter((l) => l.status === 'new').length;
    const qualifiedLeads = allLeads.filter((l) => l.status === 'qualified' || l.isConverted).length;
    const convertedLeads = allLeads.filter((l) => l.isConverted).length;

    // 2. Deal Metrics
    const openDeals = allDeals.filter((d) => d.stage !== '6_won' && d.stage !== '7_lost');
    const wonDeals = allDeals.filter((d) => d.stage === '6_won');
    const lostDeals = allDeals.filter((d) => d.stage === '7_lost');

    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const wonRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const decidedDealsCount = wonDeals.length + lostDeals.length;
    const winRatePercent = decidedDealsCount > 0
      ? Number(((wonDeals.length / decidedDealsCount) * 100).toFixed(1))
      : 0;

    const leadConversionRatePercent = totalLeads > 0
      ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
      : 0;

    // 3. Lead Source Distribution
    const sourceCounts = {};
    allLeads.forEach((l) => {
      const src = l.source || 'other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const leadSourceDistribution = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? Number(((count / totalLeads) * 100).toFixed(1)) : 0,
    }));

    // 4. Sales Pipeline by Stage
    const stages = [
      { id: '1_new', label: 'New' },
      { id: '2_qualified', label: 'Qualified' },
      { id: '3_meeting_scheduled', label: 'Meeting Scheduled' },
      { id: '4_proposal_sent', label: 'Proposal Sent' },
      { id: '5_negotiation', label: 'Negotiation' },
      { id: '6_won', label: 'Closed Won' },
      { id: '7_lost', label: 'Closed Lost' },
    ];

    const pipelineByStage = stages.map((stage) => {
      const stageDeals = allDeals.filter((d) => d.stage === stage.id);
      const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      return {
        stage: stage.id,
        label: stage.label,
        count: stageDeals.length,
        totalValue: stageValue,
      };
    });

    // 5. Upcoming Follow-ups (Pending tasks)
    const pendingTasks = allTasks.filter((t) => t.status === 'pending');
    pendingTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const upcomingFollowUps = pendingTasks.slice(0, 5);

    // 6. Recent Activities
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentActivities = allActivities.slice(0, 8);

    const metrics = {
      tenantId,
      summary: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        openDealsCount: openDeals.length,
        wonDealsCount: wonDeals.length,
        lostDealsCount: lostDeals.length,
        totalPipelineValue,
        wonRevenue,
        winRatePercent,
        leadConversionRatePercent,
      },
      leadSourceDistribution,
      pipelineByStage,
      upcomingFollowUps,
      recentActivities,
    };

    return sendSuccess(res, metrics, 'Dashboard analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
}
