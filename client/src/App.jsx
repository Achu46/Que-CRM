import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import LeadsPage from './pages/LeadsPage';
import DealsKanbanPage from './pages/DealsKanbanPage';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import TasksPage from './pages/TasksPage';
import Card from './components/common/Card';
import Badge, { StageBadge } from './components/common/Badge';
import Button from './components/common/Button';
import LoadingSpinner from './components/common/LoadingSpinner';
import ActivityStream from './components/timeline/ActivityStream';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckSquare, 
  Plus, 
  Sparkles,
  KanbanSquare,
  BarChart3,
  PieChart,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import { dashboardApi } from './api/integrations.api.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [selectedContactId, setSelectedContactId] = useState('cont_1');
  const [user, setUser] = useState({
    name: 'Sarah Chen',
    email: 'sarah.chen@ove.com',
    role: 'admin',
  });

  // Dashboard Data State
  const [metrics, setMetrics] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  const loadDashboardMetrics = async () => {
    setDashLoading(true);
    try {
      const res = await dashboardApi.getMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setDashLoading(false);
    }
  };

  useEffect(() => {
    if (currentPath === '/dashboard') {
      loadDashboardMetrics();
    }
  }, [currentPath]);

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    setCurrentPath('/contact-detail');
  };

  const getPageTitle = () => {
    switch (currentPath) {
      case '/dashboard':
        return 'Executive Dashboard';
      case '/leads':
        return 'Leads & Inbound Inquiries';
      case '/deals':
        return 'Sales Pipeline & Kanban';
      case '/contacts':
        return 'Customer Contacts';
      case '/contact-detail':
        return 'Customer Profile Hub';
      case '/companies':
        return 'Accounts & Organizations';
      case '/tasks':
        return 'Tasks & Reminders';
      default:
        return 'Dashboard';
    }
  };

  const summary = metrics?.summary || {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    openDealsCount: 0,
    wonDealsCount: 0,
    lostDealsCount: 0,
    totalPipelineValue: 0,
    wonRevenue: 0,
    winRatePercent: 0,
    leadConversionRatePercent: 0,
  };

  const pipelineByStage = metrics?.pipelineByStage || [];
  const maxStageValue = Math.max(...pipelineByStage.map((s) => s.totalValue || 0), 1);

  const renderCurrentView = () => {
    switch (currentPath) {
      case '/leads':
        return <LeadsPage onNavigateToContact={handleSelectContact} />;
      case '/deals':
        return <DealsKanbanPage />;
      case '/contacts':
        return <ContactsPage onSelectContact={handleSelectContact} />;
      case '/contact-detail':
        return (
          <ContactDetailPage
            contactId={selectedContactId}
            onBack={() => setCurrentPath('/contacts')}
          />
        );
      case '/companies':
        return <CompaniesPage />;
      case '/tasks':
        return <TasksPage />;
      case '/dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Top Welcome Banner */}
            <div className="bg-gradient-to-r from-ove-forest via-[#384f33] to-ove-primary rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                  OVE Solutions • People • Process • Progress
                </span>
                <h2 className="text-2xl font-bold mt-1 tracking-tight">
                  Welcome back, {user.name}
                </h2>
                <p className="text-xs text-white/90 mt-1 max-w-xl">
                  Real-time pipeline visibility, customer interaction memory, Resend email outreach, and Gemini AI assistance.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="!text-ove-forest !border-white/30"
                  icon={KanbanSquare}
                  onClick={() => setCurrentPath('/deals')}
                >
                  View Pipeline
                </Button>
                <Button
                  size="sm"
                  variant="olive"
                  icon={Plus}
                  onClick={() => setCurrentPath('/leads')}
                >
                  New Lead
                </Button>
              </div>
            </div>

            {/* Live KPI Metric Cards */}
            {dashLoading ? (
              <LoadingSpinner message="Calculating live CRM database metrics..." />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Pipeline Value */}
                  <Card className="!p-5 border-l-4 border-l-ove-forest">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                        Active Pipeline Value
                      </span>
                      <div className="p-2 rounded-lg bg-ove-soft text-ove-forest">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-ove-forest">
                        ${summary.totalPipelineValue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-ove-muted mt-1">
                      Across {summary.openDealsCount} open opportunities
                    </p>
                  </Card>

                  {/* Win Rate */}
                  <Card className="!p-5 border-l-4 border-l-ove-success">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                        Sales Win Rate
                      </span>
                      <div className="p-2 rounded-lg bg-ove-soft text-ove-success">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-ove-success">
                        {summary.winRatePercent}%
                      </span>
                      <span className="text-xs text-ove-muted">
                        ({summary.wonDealsCount} won / {summary.wonDealsCount + summary.lostDealsCount} closed)
                      </span>
                    </div>
                    <p className="text-[11px] text-ove-muted mt-1">
                      ${summary.wonRevenue.toLocaleString()} in closed revenue
                    </p>
                  </Card>

                  {/* Total Inbound Leads */}
                  <Card className="!p-5 border-l-4 border-l-ove-primary">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                        Total Inbound Leads
                      </span>
                      <div className="p-2 rounded-lg bg-ove-soft text-ove-primary">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-ove-text">
                        {summary.totalLeads}
                      </span>
                      <span className="text-xs text-ove-primary font-medium">
                        {summary.newLeads} new
                      </span>
                    </div>
                    <p className="text-[11px] text-ove-muted mt-1">
                      {summary.leadConversionRatePercent}% converted to deals
                    </p>
                  </Card>

                  {/* Open Deals */}
                  <Card className="!p-5 border-l-4 border-l-[#2C5282]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                        Open Pipeline Deals
                      </span>
                      <div className="p-2 rounded-lg bg-ove-soft text-[#2C5282]">
                        <KanbanSquare className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-ove-text">
                        {summary.openDealsCount}
                      </span>
                      <span className="text-xs text-ove-muted">In progression</span>
                    </div>
                    <p className="text-[11px] text-ove-muted mt-1">
                      {summary.qualifiedLeads} qualified prospects
                    </p>
                  </Card>
                </div>

                {/* Mid Section: Pipeline Stages Visual & Lead Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sales Pipeline by Stage */}
                  <Card
                    title="Sales Pipeline Velocity"
                    subtitle="Distribution of value across all 7 stages"
                    className="lg:col-span-2"
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ArrowRight}
                        onClick={() => setCurrentPath('/deals')}
                      >
                        Kanban View
                      </Button>
                    }
                  >
                    <div className="space-y-3.5 pt-2">
                      {pipelineByStage.map((s) => {
                        const pct = Math.round((s.totalValue / maxStageValue) * 100);
                        return (
                          <div key={s.stage} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-ove-text flex items-center space-x-2">
                                <span>{s.label}</span>
                                <span className="text-[10px] text-ove-muted font-normal">
                                  ({s.count} deal{s.count !== 1 ? 's' : ''})
                                </span>
                              </span>
                              <span className="font-bold text-ove-forest">
                                ${s.totalValue.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-ove-soft rounded-full h-2 overflow-hidden border border-ove-border/40">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  s.stage === '6_won'
                                    ? 'bg-ove-success'
                                    : s.stage === '7_lost'
                                    ? 'bg-ove-error'
                                    : 'bg-ove-forest'
                                }`}
                                style={{ width: `${Math.max(pct, s.count > 0 ? 4 : 0)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Lead Source Distribution */}
                  <Card
                    title="Leads by Acquisition Source"
                    subtitle="Channel attribution of prospective clients"
                  >
                    <div className="space-y-3 pt-2">
                      {(metrics?.leadSourceDistribution || []).map((src) => (
                        <div key={src.source} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="capitalize font-medium text-ove-text">
                              {src.source.replace('_', ' ')}
                            </span>
                            <span className="text-ove-muted">
                              {src.count} ({src.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-ove-soft rounded-full h-1.5 overflow-hidden border border-ove-border/40">
                            <div
                              className="bg-ove-primary h-1.5 rounded-full"
                              style={{ width: `${src.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Bottom Split: Upcoming Tasks & Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Follow-ups */}
                  <Card
                    title="Upcoming Follow-up Tasks"
                    subtitle="Scheduled customer touchpoints"
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCurrentPath('/tasks')}
                      >
                        All Tasks
                      </Button>
                    }
                  >
                    {(!metrics?.upcomingFollowUps || metrics.upcomingFollowUps.length === 0) ? (
                      <p className="text-xs text-ove-muted py-6 text-center">
                        All tasks completed! Great work.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {metrics.upcomingFollowUps.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg border border-ove-border flex items-center justify-between bg-white hover:border-ove-forest/40 transition-colors"
                          >
                            <div className="flex items-center space-x-2.5">
                              <CheckSquare className="w-4 h-4 text-ove-primary flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-ove-text">{task.title}</p>
                                <p className="text-[10px] text-ove-muted">
                                  Due: {new Date(task.dueDate).toLocaleDateString()} • {task.entityTitle || 'CRM Record'}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ove-soft border border-ove-border text-ove-muted">
                              {task.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Recent Customer Activities */}
                  <Card
                    title="Recent Customer Activities"
                    subtitle="Chronological audit stream of touchpoints"
                  >
                    <ActivityStream activities={metrics?.recentActivities || []} />
                  </Card>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={(path) => setCurrentPath(path)}
      title={getPageTitle()}
      user={user}
    >
      {renderCurrentView()}
    </AppShell>
  );
}
