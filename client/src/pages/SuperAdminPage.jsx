import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewApplicationModal from '../components/superadmin/ReviewApplicationModal';
import { superAdminApi } from '../api/superadmin.api';
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  Power,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function SuperAdminPage({ onSwitchToTenant }) {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'tenants' | 'audit'
  const [dashboardData, setDashboardData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter for Applications
  const [appStatusFilter, setAppStatusFilter] = useState('');

  // Review Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Tenant Status Modal / Action
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [appStatusFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, appsRes, tenantsRes, auditRes] = await Promise.all([
        superAdminApi.getDashboard(),
        superAdminApi.getApplications(appStatusFilter),
        superAdminApi.getTenants(),
        superAdminApi.getAuditLogs(),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (appsRes.success) setApplications(appsRes.data);
      if (tenantsRes.success) setTenants(tenantsRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (app) => {
    setSelectedApp(app);
    setIsReviewOpen(true);
  };

  const handleToggleTenantStatus = async (tenant) => {
    const nextStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
    const reason = prompt(
      `Please provide a reason to set ${tenant.name} status to ${nextStatus}:`,
      nextStatus === 'suspended' ? 'Payment overdue / Terms violation' : 'Account verified and payment cleared'
    );
    if (!reason) return;

    setActionLoading(true);
    try {
      await superAdminApi.updateTenantStatus(tenant.id, {
        status: nextStatus,
        reason,
      });
      await loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update tenant status');
    } finally {
      setActionLoading(false);
    }
  };

  const metrics = dashboardData?.metrics || {
    totalTenants: 0,
    activeTenants: 0,
    suspendedTenants: 0,
    pendingApplications: 0,
    monthlyRecurringRevenue: 0,
  };

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="bg-gradient-to-r from-ove-forest via-[#283824] to-[#1c281a] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-ove-primary/40 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20">
              Super Admin Governance
            </span>
            <span className="text-xs text-white/70">Master Multi-Tenant Orchestrator</span>
          </div>
          <h2 className="text-2xl font-bold mt-1.5 tracking-tight">
            OVE Solutions SaaS Governance Console
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Authorize new company registrations, verify manual payments, provision dedicated tenant workspaces, and monitor platform health.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            size="sm"
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
            icon={RefreshCw}
            onClick={loadAllData}
          >
            Sync Platform State
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-ove-forest">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ove-muted font-medium">Active Tenants</span>
            <Building2 className="w-4 h-4 text-ove-forest" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-ove-text">{metrics.activeTenants}</span>
            <span className="text-[11px] text-ove-muted">of {metrics.totalTenants} total</span>
          </div>
        </Card>

        <Card className={`p-4 border-l-4 ${metrics.pendingApplications > 0 ? 'border-ove-warning bg-ove-warning/5' : 'border-ove-border'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ove-muted font-medium">Pending Approvals</span>
            <Clock className={`w-4 h-4 ${metrics.pendingApplications > 0 ? 'text-ove-warning' : 'text-ove-muted'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-ove-text">{metrics.pendingApplications}</span>
            {metrics.pendingApplications > 0 && (
              <Badge variant="warning" size="sm">Action Required</Badge>
            )}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-ove-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ove-muted font-medium">Platform MRR</span>
            <DollarSign className="w-4 h-4 text-ove-primary" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-ove-text">
              ${metrics.monthlyRecurringRevenue?.toLocaleString()}
            </span>
            <span className="text-[11px] text-ove-success font-semibold flex items-center">
              +14% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-ove-text">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ove-muted font-medium">Suspended Tenants</span>
            <AlertTriangle className="w-4 h-4 text-ove-error" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-ove-text">{metrics.suspendedTenants}</span>
            <span className="text-[11px] text-ove-muted">governance holds</span>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-3 border-b border-ove-border">
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'applications'
              ? 'border-ove-forest text-ove-forest'
              : 'border-transparent text-ove-muted hover:text-ove-text'
          }`}
        >
          <span>Company Applications</span>
          {metrics.pendingApplications > 0 && (
            <span className="bg-ove-warning text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {metrics.pendingApplications}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'tenants'
              ? 'border-ove-forest text-ove-forest'
              : 'border-transparent text-ove-muted hover:text-ove-text'
          }`}
        >
          <span>All Platform Tenants ({tenants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'border-ove-forest text-ove-forest'
              : 'border-transparent text-ove-muted hover:text-ove-text'
          }`}
        >
          <span>Platform Audit Trail</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* TAB 1: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-ove-muted font-medium">Filter Status:</span>
                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      appStatusFilter === '' ? 'bg-ove-forest text-white' : 'bg-ove-soft text-ove-muted hover:text-ove-text'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('under_review')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      appStatusFilter === 'under_review' ? 'bg-ove-warning text-white' : 'bg-ove-soft text-ove-muted hover:text-ove-text'
                    }`}
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('approved')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      appStatusFilter === 'approved' ? 'bg-ove-success text-white' : 'bg-ove-soft text-ove-muted hover:text-ove-text'
                    }`}
                  >
                    Approved
                  </button>
                </div>
              </div>

              {/* Applications Table */}
              <Card className="overflow-hidden p-0 border border-ove-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ove-soft/60 border-b border-ove-border text-ove-muted uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Company & Administrator</th>
                        <th className="py-3 px-4">Plan & Billing</th>
                        <th className="py-3 px-4">Amount Due</th>
                        <th className="py-3 px-4">Payment Ref Code</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ove-border">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-ove-muted">
                            No company applications found matching filter.
                          </td>
                        </tr>
                      ) : (
                        applications.map((app) => (
                          <tr key={app.id} className="hover:bg-ove-soft/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-ove-text block">{app.companyName}</span>
                              <span className="text-[11px] text-ove-muted">{app.ownerName} • {app.workEmail}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold uppercase text-ove-forest block">
                                {app.planId || 'pro'}
                              </span>
                              <span className="text-[11px] text-ove-muted capitalize">{app.billingCycle || 'monthly'}</span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-ove-text">
                              ${app.amountDue || 149} {app.currency || 'USD'}
                            </td>
                            <td className="py-3.5 px-4">
                              {app.paymentReference ? (
                                <span className="font-mono text-[11px] font-semibold bg-ove-soft px-2 py-0.5 rounded border border-ove-border">
                                  {app.paymentReference}
                                </span>
                              ) : (
                                <span className="text-ove-muted italic">Awaiting submission</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={
                                  app.status === 'approved'
                                    ? 'success'
                                    : app.status === 'under_review'
                                    ? 'warning'
                                    : app.status === 'rejected'
                                    ? 'error'
                                    : 'neutral'
                                }
                              >
                                {app.status?.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {app.status === 'under_review' ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleReviewClick(app)}
                                >
                                  Review Application
                                </Button>
                              ) : app.status === 'approved' && app.provisionedOrgId ? (
                                <span className="text-[11px] font-mono text-ove-muted">
                                  {app.provisionedOrgId}
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReviewClick(app)}
                                >
                                  Inspect Dossier
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: TENANTS DIRECTORY */}
          {activeTab === 'tenants' && (
            <Card className="overflow-hidden p-0 border border-ove-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ove-soft/60 border-b border-ove-border text-ove-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Tenant Workspace</th>
                      <th className="py-3 px-4">Workspace ID</th>
                      <th className="py-3 px-4">Subscription Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Data Usage</th>
                      <th className="py-3 px-4 text-right">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ove-border">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-ove-soft/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-ove-text block">{tenant.name}</span>
                          <span className="text-[11px] text-ove-muted">{tenant.ownerEmail || 'Primary Account'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ove-muted">{tenant.id}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold uppercase text-ove-forest block">
                            {tenant.plan}
                          </span>
                          <span className="text-[11px] text-ove-muted">
                            Max {tenant.limits?.maxLeads?.toLocaleString() || 10000} leads
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={tenant.status === 'suspended' ? 'error' : 'success'}>
                            {tenant.status || 'active'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-ove-text font-semibold">{tenant.leadCount || 0} Leads</span>
                          <span className="text-ove-muted text-[11px] block">{tenant.memberCount || 1} Members</span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={tenant.status === 'suspended' ? 'text-ove-success border-ove-success/30' : 'text-ove-error border-ove-error/30'}
                            loading={actionLoading}
                            onClick={() => handleToggleTenantStatus(tenant)}
                          >
                            {tenant.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              localStorage.setItem('crm_active_tenant_id', tenant.id);
                              if (onSwitchToTenant) onSwitchToTenant(tenant.id);
                            }}
                          >
                            Enter Workspace
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <Card className="overflow-hidden p-0 border border-ove-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ove-soft/60 border-b border-ove-border text-ove-muted uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ove-border">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-ove-soft/40 transition-colors">
                        <td className="py-3 px-4 text-ove-muted whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="neutral">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ove-text">
                          {log.actorEmail || log.actorId || 'system'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ove-muted">
                          {log.targetType}: {log.targetId}
                        </td>
                        <td className="py-3 px-4 text-ove-text max-w-md">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Review Modal */}
      {isReviewOpen && (
        <ReviewApplicationModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          application={selectedApp}
          onReviewed={() => {
            loadAllData();
          }}
        />
      )}
    </div>
  );
}
