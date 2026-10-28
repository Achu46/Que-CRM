import React, { useState, useEffect } from 'react';
import { Contact, Search, Plus, Building2, Mail, Phone, ChevronRight } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { Input } from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { contactsApi } from '../api/contacts.api.js';

export default function ContactsPage({ onSelectContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    companyName: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsApi.getAll({ search: search || undefined });
      setContacts(res.data || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await contactsApi.create(formData);
      setIsOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', companyName: '' });
      fetchContacts();
    } catch (err) {
      console.error('Failed to create contact:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ove-text tracking-tight">Contacts Directory</h2>
          <p className="text-xs text-ove-muted mt-0.5">
            Individual stakeholder profiles, communication histories, and linked accounts.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Add Contact
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="!p-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ove-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search contacts by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-ove-soft border border-ove-border rounded-lg text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
          />
        </div>
      </Card>

      {/* Contacts List Grid */}
      {loading ? (
        <LoadingSpinner message="Loading contacts..." />
      ) : contacts.length === 0 ? (
        <Card className="py-12 text-center">
          <Contact className="w-10 h-10 text-ove-muted/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ove-text">No contacts found</p>
          <p className="text-xs text-ove-muted mt-0.5">Add a contact or convert a qualified lead.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact && onSelectContact(contact.id)}
              className="bg-white border border-ove-border rounded-xl p-5 shadow-2xs hover:border-ove-forest hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-ove-soft border border-ove-border flex items-center justify-center font-bold text-ove-forest text-sm">
                      {contact.firstName?.charAt(0)}
                      {contact.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ove-text group-hover:text-ove-forest transition-colors">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-xs text-ove-muted">{contact.jobTitle || 'Stakeholder'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ove-muted group-hover:text-ove-forest transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="mt-4 pt-3 border-t border-ove-border/60 space-y-2 text-xs text-ove-muted">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-ove-muted flex-shrink-0" />
                    <span className="font-medium text-ove-text truncate">
                      {contact.companyName || 'No Company'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-ove-muted flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-ove-muted flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-ove-border/40 flex items-center justify-between text-[11px] text-ove-primary font-medium">
                <span>View Full Timeline & Deals</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Contact Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Customer Contact"
        subtitle="Create an individual profile for communication tracking"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input
              label="Job Title"
              placeholder="e.g. Director of Operations"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitLoading}>
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

