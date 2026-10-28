import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, Globe, DollarSign, Users } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { Input, Select } from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { companiesApi } from '../api/contacts.api.js';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: 'Technology',
    size: '11-50',
    annualRevenue: 5000000,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companiesApi.getAll({ search: search || undefined });
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await companiesApi.create(formData);
      setIsOpen(false);
      setFormData({ name: '', website: '', industry: 'Technology', size: '11-50', annualRevenue: 5000000 });
      fetchCompanies();
    } catch (err) {
      console.error('Failed to create company:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ove-text tracking-tight">Companies & Accounts</h2>
          <p className="text-xs text-ove-muted mt-0.5">
            Client enterprises, industries, account sizing, and linked revenue pipelines.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Company
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="!p-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ove-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-ove-soft border border-ove-border rounded-lg text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
          />
        </div>
      </Card>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSpinner message="Loading enterprise accounts..." />
      ) : companies.length === 0 ? (
        <Card className="py-12 text-center">
          <Building2 className="w-10 h-10 text-ove-muted/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ove-text">No companies found</p>
          <p className="text-xs text-ove-muted mt-0.5">Add an account or convert a lead.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => (
            <Card key={comp.id} className="p-5 flex flex-col justify-between hover:border-ove-forest/40 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-ove-soft border border-ove-border flex items-center justify-center font-bold text-ove-forest text-sm">
                      {comp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ove-text">{comp.name}</h4>
                      <span className="text-[11px] font-medium text-ove-primary bg-ove-primary/10 px-2 py-0.5 rounded-full">
                        {comp.industry || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ove-border/60 space-y-2 text-xs text-ove-muted">
                  {comp.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-ove-muted flex-shrink-0" />
                      <a
                        href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ove-primary hover:underline truncate"
                      >
                        {comp.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-ove-muted flex-shrink-0" />
                    <span>{comp.size || '11-50'} employees</span>
                  </div>
                  {comp.annualRevenue && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-3.5 h-3.5 text-ove-muted flex-shrink-0" />
                      <span>${Number(comp.annualRevenue).toLocaleString()} estimated revenue</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-ove-border/40 text-[11px] text-ove-muted">
                Created {new Date(comp.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Company Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Client Company"
        subtitle="Create an enterprise account record"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Apex Global Technologies"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Website"
              placeholder="https://company.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
            <Select
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={[
                { value: 'Technology', label: 'Technology / SaaS' },
                { value: 'Healthcare', label: 'Healthcare & Life Sciences' },
                { value: 'Finance', label: 'Finance & Banking' },
                { value: 'Manufacturing', label: 'Manufacturing & Industrial' },
                { value: 'Retail', label: 'Retail & E-Commerce' },
                { value: 'Services', label: 'Professional Services' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Company Size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              options={[
                { value: '1-10', label: '1 - 10 employees' },
                { value: '11-50', label: '11 - 50 employees' },
                { value: '51-200', label: '51 - 200 employees' },
                { value: '201-500', label: '201 - 500 employees' },
                { value: '500+', label: '500+ employees' },
              ]}
            />
            <Input
              label="Annual Revenue (USD)"
              type="number"
              min="0"
              value={formData.annualRevenue}
              onChange={(e) => setFormData({ ...formData, annualRevenue: Number(e.target.value) })}
            />
          </div>

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitLoading}>
              Save Company
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
