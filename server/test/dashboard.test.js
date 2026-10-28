import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

const AUTH_HEADER = { Authorization: 'Bearer mock_rep_token' };

describe('Dashboard & Analytics API', () => {
  it('should return complete live metrics from database data', async () => {
    const res = await request(app).get('/api/dashboard/metrics').set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, leadSourceDistribution, pipelineByStage, upcomingFollowUps, recentActivities } = res.body.data;

    // Verify summary structure
    expect(summary.totalLeads).toBeGreaterThanOrEqual(1);
    expect(summary.totalPipelineValue).toBeGreaterThan(0);
    expect(summary.openDealsCount).toBeGreaterThanOrEqual(1);
    expect(typeof summary.winRatePercent).toBe('number');

    // Verify lead source distribution
    expect(Array.isArray(leadSourceDistribution)).toBe(true);
    expect(leadSourceDistribution.length).toBeGreaterThan(0);
    expect(leadSourceDistribution[0]).toHaveProperty('source');
    expect(leadSourceDistribution[0]).toHaveProperty('percentage');

    // Verify pipeline by stage
    expect(Array.isArray(pipelineByStage)).toBe(true);
    expect(pipelineByStage.length).toBe(7); // All 7 stages
    expect(pipelineByStage[0]).toHaveProperty('stage');
    expect(pipelineByStage[0]).toHaveProperty('totalValue');

    // Verify upcoming follow-ups & recent activities
    expect(Array.isArray(upcomingFollowUps)).toBe(true);
    expect(Array.isArray(recentActivities)).toBe(true);
  });
});
