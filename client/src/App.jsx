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
  ArrowRight, 
  Sparkles,
  KanbanSquare
} from 'lucide-react';

import { leadsApi } from './api/leads.api.js';
import { dealsApi } from './api/deals.api.js';
import { tasksApi, activitiesApi } from './api/tasks.api.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [selectedContactId, setSelectedContactId] = useState('cont_1');
  const [user, setUser] = useState({
    name: 'Sarah Chen',
    email: 'sarah.chen@ove.com',
    role: 'admin',
  });

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    openDeals: 0,
    pipelineValue: 0,
    winRate: 0,
    deals: [],
    tasks: [],
    activities: [],
  });
  const [dashLoading, setDashLoading] = useState(true);

  const loadDashboardMetrics = async () => {
    setDashLoading(true);
    try {
      const [leadsRes, dealsRes, tasksRes, actRes] = await Promise.all([
        leadsApi.getAll(),
        dealsApi.getAll(),
        tasksApi.getAll({ status: 'pending' }),
        activitiesApi.getAll(),
      ]);

      const leads = leadsRes.data || [];
      const deals = dealsRes.data || [];
      const tasks = tasksRes.data || [];
      const activities = actRes.data || [];

      const openDeals = deals.filter((d) => d.stage !== '6_won' && d.stage !== '7_lost');
      const wonDeals = deals.filter((d) => d.stage === '6_won');
      const closedDeals = deals.filter((d) => d.stage === '6_won' || d.stage === '7_lost');
      const winRate = closedDeals.length > 0 ? ((wonDeals.length / closedDeals.length) * 100).toFixed(1) : 0;
      const pipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

      setDashboardData({
        totalLeads: leads.length,
        openDeals: openDeals.length,
        pipelineValue,
        winRate,
        deals,
        tasks,
        activities: activities.slice(0, 6),
      });
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
            <div className="bg-gradient-to-r from-ove-forest via-[#364e30] to-ove-primary rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  OVE Solutions • People • Process • Progress
                </span>
                <h2 className="text-2xl font-bold mt-1 tracking-tight">
                  Welcome back, {user.name}
                </h2>
                <p className="text-xs text-white/90 mt-1 max-w-xl">
                  Real-time pipeline visibility, customer interaction memory, and AI-accelerated sales workflows.
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
              <LoadingSpinner message="Calculating live CRM metrics..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="!p-5 border-l-4 border-l-ove-forest">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                      Total Inbound Leads
                    </span>
                    <div className="p-2 rounded-lg bg-ove-soft text-ove-forest">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-ove-text">
                      {dashboardData.totalLeads}
                    </span>
                    <span className="text-xs text-ove-success font-medium">Live sync</span>
                  </div>
                </Card>

                <Card className="!p-5 border-l-4 border-l-ove-primary">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                      Active Pipeline Value
                    </span>
                    <div className="p-2 rounded-lg bg-ove-soft text-ove-primary">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-ove-forest">
                      ${dashboardData.pipelineValue.toLocaleString()}
                    </span>
                  </div>
                </Card>

                <Card className="!p-5 border-l-4 border-l-[#2C5282]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                      Open Deals
                    </span>
                    <div className="p-2 rounded-lg bg-ove-soft text-[#2C5282]">
                      <KanbanSquare className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-ove-text">
                      {dashboardData.openDeals}
                    </span>
                    <span className="text-xs text-ove-muted">In pipeline</span>
                  </div>
                </Card>

                <Card className="!p-5 border-l-4 border-l-ove-success">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ove-muted uppercase tracking-wider">
                      Win Rate %
                    </span>
                    <div className="p-2 rounded-lg bg-ove-soft text-ove-success">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-ove-success">
                      {dashboardData.winRate}%
                    </span>
                    <span className="text-xs text-ove-muted">Closed deals</span>
                  </div>
                </Card>
              </div>
            )}

            {/* Split Section: Upcoming Tasks & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Follow-ups */}
              <Card
                title="Pending Follow-up Tasks"
                subtitle="High priority touchpoints scheduled for closing"
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentPath('/tasks')}
                  >
                    View All
                  </Button>
                }
              >
                {dashboardData.tasks.length === 0 ? (
                  <p className="text-xs text-ove-muted py-6 text-center">
                    All tasks completed! Great work.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.tasks.slice(0, 4).map((task) => (
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

              {/* Recent Activity Feed */}
              <Card
                title="Recent Customer Activities"
                subtitle="Audit stream of calls, notes, and deal progressions"
              >
                <ActivityStream activities={dashboardData.activities} />
              </Card>
            </div>
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
