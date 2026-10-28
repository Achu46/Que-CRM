import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowRightCircle, 
  Filter, 
  AlertCircle, 
  CheckCircle,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { Input, Select, Textarea } from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { leadsApi } from '../api/leads.api.js';

export default function LeadsPage({ onNavigateToContact }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Create Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    source: 'website',
    notes: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Convert Form State
  const [convertData, setConvertData] = useState({
    companyName: '',
    dealTitle: '',
    dealAmount: 15000,
  });
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadsApi.getAll({
        status: statusFilter,
        search: search || undefined,
      });
      setLeads(res.data || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setDuplicateWarning(null);

    try {
      const res = await leadsApi.create(formData);
      if (res.data?.warning) {
        setDuplicateWarning(res.data.warning);
      }
      setIsCreateOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        source: 'website',
        notes: '',
      });
      fetchLeads();
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || err.message || 'Failed to create lead');
    } finally {
      setCreateLoading(false);
    }
  };

  const openConvertModal = (lead) => {
    setSelectedLead(lead);
    setConvertData({
      companyName: lead.companyName || `${lead.firstName}'s Enterprise`,
      dealTitle: `${lead.companyName || lead.firstName} - Discovery Deal`,
      dealAmount: 25000,
    });
    setIsConvertOpen(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setConvertLoading(true);
    setConvertError(null);

    try {
      const res = await leadsApi.convert(selectedLead.id, convertData);
      setIsConvertOpen(false);
      fetchLeads();
      if (onNavigateToContact && res.data?.contact?.id) {
        onNavigateToContact(res.data.contact.id);
      }
    } catch (err) {
      setConvertError(err.response?.data?.error?.message || err.message || 'Failed to convert lead');
    } finally {
      setConvertLoading(false);
    }
  };

  const getStatusBadge = (status, isConverted) => {
    if (isConverted) {
      return <Badge variant="success" dot>Converted</Badge>;
    }
    switch (status) {
      case 'new':
        return <Badge variant="forest" dot>New Lead</Badge>;
      case 'contacted':
        return <Badge variant="info" dot>Contacted</Badge>;
      case 'qualified':
        return <Badge variant="olive" dot>Qualified</Badge>;
      case 'disqualified':
        return <Badge variant="error" dot>Disqualified</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ove-text tracking-tight">Leads Inbox</h2>
          <p className="text-xs text-ove-muted mt-0.5">
            Ingest, qualify, and convert prospects into high-value opportunities.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          Add New Lead
        </Button>
      </div>

      {duplicateWarning && (
        <div className="p-3 bg-ove-warning/10 border border-ove-warning/30 rounded-lg flex items-center space-x-2 text-xs text-ove-warning">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-ove-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-ove-soft border border-ove-border rounded-lg text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['all', 'new', 'contacted', 'qualified', 'disqualified'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-ove-forest text-white'
                    : 'text-ove-muted hover:text-ove-text hover:bg-ove-soft'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading active leads..." />
        ) : leads.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-ove-muted/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-ove-text">No leads found</p>
            <p className="text-xs text-ove-muted mt-0.5">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ove-soft/60 border-b border-ove-border text-[11px] font-semibold text-ove-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ove-border text-xs">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-ove-soft/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ove-text">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-ove-muted flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-ove-muted" />
                          <span>{lead.email}</span>
                        </span>
                        {lead.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-ove-muted" />
                            <span>{lead.phone}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ove-text">
                      <div className="flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-ove-muted" />
                        <span>{lead.companyName || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-ove-muted">
                      {lead.source?.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(lead.status, lead.isConverted)}
                    </td>
                    <td className="py-3.5 px-4 text-ove-muted text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!lead.isConverted ? (
                        <Button
                          size="sm"
                          variant="olive"
                          icon={ArrowRightCircle}
                          onClick={() => openConvertModal(lead)}
                        >
                          Convert
                        </Button>
                      ) : (
                        <span className="text-[11px] text-ove-success font-medium inline-flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Converted</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Inbound Lead"
        subtitle="Record contact details and prospect requirements"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs bg-ove-error/10 text-ove-error rounded-lg border border-ove-error/20">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <Select
              label="Acquisition Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              options={[
                { value: 'website', label: 'Website Form' },
                { value: 'referral', label: 'Client Referral' },
                { value: 'linkedin', label: 'LinkedIn Outreach' },
                { value: 'cold_outreach', label: 'Cold Email / Call' },
                { value: 'event', label: 'Industry Conference' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <Textarea
            label="Inquiry / Requirement Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Key needs, timeline, and current tooling..."
          />

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createLoading}>
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Convert Lead Modal */}
      <Modal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        title="Convert Lead to Opportunity"
        subtitle={`Promote ${selectedLead?.firstName} ${selectedLead?.lastName || ''} to an active Contact and Deal`}
      >
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          {convertError && (
            <div className="p-3 text-xs bg-ove-error/10 text-ove-error rounded-lg border border-ove-error/20">
              {convertError}
            </div>
          )}

          <div className="p-3 bg-ove-soft border border-ove-border rounded-lg text-xs space-y-1">
            <p className="font-semibold text-ove-forest">Atomic Conversion Pipeline:</p>
            <p className="text-ove-muted">
              1. Creates Company record ({convertData.companyName || 'Auto-generated'}).
            </p>
            <p className="text-ove-muted">
              2. Creates Contact profile linked to the company.
            </p>
            <p className="text-ove-muted">
              3. Spawns Deal opportunity into the Kanban pipeline in stage "2_qualified".
            </p>
          </div>

          <Input
            label="Target Company Name"
            value={convertData.companyName}
            onChange={(e) => setConvertData({ ...convertData, companyName: e.target.value })}
            required
          />

          <Input
            label="Opportunity / Deal Title"
            value={convertData.dealTitle}
            onChange={(e) => setConvertData({ ...convertData, dealTitle: e.target.value })}
            required
          />

          <Input
            label="Estimated Deal Value (USD)"
            type="number"
            min="0"
            value={convertData.dealAmount}
            onChange={(e) => setConvertData({ ...convertData, dealAmount: Number(e.target.value) })}
            required
          />

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsConvertOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={convertLoading}>
              Confirm Conversion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
