import React, { useState, useEffect } from 'react';
import { Building, ChevronDown, Check, Plus, Shield } from 'lucide-react';
import { organizationsApi } from '../../api/organizations.api.js';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Input, Select } from '../common/Input';

export default function TenantSwitcher({ onTenantChanged }) {
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(
    localStorage.getItem('crm_active_tenant_id') || 'org_ove_main'
  );
  const [isOpen, setIsOpen] = useState(false);

  // New Organization Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('pro');
  const [creating, setCreating] = useState(false);

  const fetchOrgs = async () => {
    try {
      const res = await organizationsApi.getMyOrgs();
      const orgs = res.data || [];
      setOrganizations(orgs);
      if (!orgs.some((o) => o.id === activeOrgId) && orgs.length > 0) {
        handleSelectOrg(orgs[0].id);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleSelectOrg = (orgId) => {
    setActiveOrgId(orgId);
    localStorage.setItem('crm_active_tenant_id', orgId);
    setIsOpen(false);
    if (onTenantChanged) onTenantChanged(orgId);
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await organizationsApi.create({ name, plan });
      await fetchOrgs();
      if (res.data?.id) {
        handleSelectOrg(res.data.id);
      }
      setIsModalOpen(false);
      setName('');
    } catch (err) {
      console.error('Failed to create organization:', err);
    } finally {
      setCreating(false);
    }
  };

  const currentOrg = organizations.find((o) => o.id === activeOrgId) || {
    name: 'OVE Solutions HQ',
    plan: 'enterprise',
  };

  return (
    <div className="relative">
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-ove-soft/90 border border-ove-border hover:border-ove-primary/50 transition-all text-left group"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-ove-forest text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
            {currentOrg.name?.charAt(0) || 'O'}
          </div>
          <div className="truncate">
            <span className="text-[10px] font-semibold text-ove-muted block uppercase tracking-wider">
              Tenant Org
            </span>
            <span className="text-xs font-bold text-ove-text truncate block group-hover:text-ove-forest">
              {currentOrg.name}
            </span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-ove-muted flex-shrink-0 ml-1" />
      </button>

      {/* Switcher Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-ove-border rounded-xl shadow-lg z-40 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold text-ove-muted uppercase tracking-wider border-b border-ove-border/60">
              Select Organization
            </div>

            {organizations.map((org) => {
              const isSelected = org.id === activeOrgId;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectOrg(org.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-ove-soft text-ove-forest font-bold border border-ove-border'
                      : 'text-ove-text hover:bg-ove-soft/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Building className="w-3.5 h-3.5 text-ove-primary flex-shrink-0" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-ove-success flex-shrink-0" />}
                </button>
              );
            })}

            <div className="pt-1 border-t border-ove-border/60">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-ove-primary hover:bg-ove-soft transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Organization</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Organization Tenant"
        subtitle="Provision an isolated multi-tenant environment"
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <Input
            label="Organization / Company Name"
            placeholder="e.g. Acme Global Logistics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Subscription Plan Tier"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            options={[
              { value: 'starter', label: 'Starter (Up to 5 Users)' },
              { value: 'pro', label: 'Pro (Up to 25 Users)' },
              { value: 'enterprise', label: 'Enterprise (Unlimited Users & Workflows)' },
            ]}
          />

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={creating}>
              Create Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
