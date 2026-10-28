import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { superAdminApi } from '../../api/superadmin.api';
import { 
  Building2, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ExternalLink,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function ReviewApplicationModal({
  isOpen,
  onClose,
  application,
  onReviewed,
}) {
  const [decision, setDecision] = useState('approve');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!application) return null;

  const handleSubmit = async (selectedDecision) => {
    const finalDecision = selectedDecision || decision;
    if (!notes.trim()) {
      setError('Please provide review notes / justification for this decision.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await superAdminApi.reviewApplication(application.id, {
        decision: finalDecision,
        notes: notes.trim(),
      });
      if (res.success) {
        if (onReviewed) onReviewed(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Application: ${application.companyName}`}
      subtitle={`Application ID: ${application.id} • Submitted by ${application.ownerName}`}
      size="xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-ove-error/10 border border-ove-error/30 text-ove-error text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Dossier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: Applicant Profile */}
          <div className="bg-ove-soft/50 border border-ove-border rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-ove-forest">
              <Building2 className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Company Dossier</h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Company Name:</span>
                <span className="font-semibold text-ove-text">{application.companyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Administrator:</span>
                <span className="font-semibold text-ove-text">{application.ownerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Work Email:</span>
                <span className="font-mono text-ove-text">{application.workEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Phone Number:</span>
                <span className="text-ove-text">{application.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Industry Sector:</span>
                <span className="text-ove-text">{application.industry || 'General'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ove-muted">Company Size:</span>
                <span className="text-ove-text">{application.companySize || '1-10'} employees</span>
              </div>
            </div>
          </div>

          {/* Column 2: Plan & Payment Proof */}
          <div className="bg-ove-soft/50 border border-ove-border rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-ove-forest">
              <CreditCard className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Plan & Payment Verification
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Selected Tier:</span>
                <span className="font-bold uppercase text-ove-forest">
                  {application.planId || 'pro'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Billing Cycle:</span>
                <span className="capitalize text-ove-text">{application.billingCycle || 'monthly'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Amount Remitted:</span>
                <span className="text-sm font-black text-ove-forest">
                  ${application.amountDue || 149} {application.currency || 'USD'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-ove-border/60">
                <span className="text-ove-muted">Payment Reference:</span>
                <span className="font-mono font-bold text-ove-text bg-white px-1.5 py-0.5 rounded border border-ove-border">
                  {application.paymentReference || 'PENDING_SUBMISSION'}
                </span>
              </div>
              <div className="py-1">
                <span className="text-ove-muted block mb-1">Applicant Notes:</span>
                <div className="bg-white p-2 rounded border border-ove-border text-[11px] text-ove-text">
                  {application.proofNotes || 'No additional notes provided.'}
                </div>
              </div>
              {application.proofFileUrl && (
                <div className="pt-1">
                  <a
                    href={application.proofFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-ove-primary hover:underline font-semibold"
                  >
                    <span>View Submitted Receipt Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviewer Decision Form */}
        <div className="border-t border-ove-border pt-4 space-y-3">
          <label className="block text-xs font-bold text-ove-text uppercase tracking-wider">
            Super Admin Review Decision & Audit Note
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document verification check details (e.g. Bank statement ref matched, funds verified in OVE account #9821. Approving workspace provisioning)."
            className="w-full px-3 py-2 text-xs bg-white border border-ove-border rounded-lg text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-forest"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-ove-error border-ove-error/30 hover:bg-ove-error/10 w-full sm:w-auto"
                icon={XCircle}
                loading={loading}
                onClick={() => handleSubmit('reject')}
              >
                Reject Application
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-ove-warning border-ove-warning/30 hover:bg-ove-warning/10 w-full sm:w-auto"
                icon={HelpCircle}
                loading={loading}
                onClick={() => handleSubmit('request_info')}
              >
                Request Info
              </Button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                loading={loading}
                onClick={() => handleSubmit('approve')}
              >
                Approve & Provision Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
