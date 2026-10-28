import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { onboardingApi } from '../../api/onboarding.api';
import { 
  Building2, 
  Check, 
  CreditCard, 
  FileText, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function PublicOnboardingModal({ isOpen, onClose, onTenantActivated }) {
  const [mode, setMode] = useState('register'); // 'register' | 'lookup'
  const [step, setStep] = useState(1); // 1: Profile, 2: Plan, 3: Payment, 4: Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Plans from API
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState('pro');

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    workEmail: '',
    ownerName: '',
    phone: '',
    industry: 'Technology & SaaS',
    companySize: '11-50',
    password: 'Password123!',
  });

  // Application ID & Status
  const [applicationId, setApplicationId] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentReference: '',
    proofNotes: '',
    proofFileUrl: '',
  });

  // Lookup state
  const [lookupId, setLookupId] = useState('');

  // Fetch plans on open
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const res = await onboardingApi.getPlans();
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await onboardingApi.register(formData);
      if (res.success) {
        setApplicationId(res.data.applicationId);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelectSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await onboardingApi.selectPlan({
        applicationId,
        planId: selectedPlanId,
        billingCycle,
      });
      if (res.success) {
        setApplicationData(res.data);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Plan selection failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await onboardingApi.submitPayment({
        applicationId,
        paymentReference: paymentForm.paymentReference,
        proofNotes: paymentForm.proofNotes,
        proofFileUrl: paymentForm.proofFileUrl,
      });
      if (res.success) {
        await refreshStatus(applicationId);
        setStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment submission failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async (appId) => {
    try {
      const res = await onboardingApi.getStatus(appId || applicationId);
      if (res.success) {
        setApplicationData(res.data);
      }
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  };

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await onboardingApi.getStatus(lookupId.trim());
      if (res.success) {
        setApplicationId(res.data.id);
        setApplicationData(res.data);
        setStep(4);
        setMode('register');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found with provided ID');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceLaunch = () => {
    if (applicationData?.provisionedOrgId) {
      localStorage.setItem('crm_active_tenant_id', applicationData.provisionedOrgId);
      if (onTenantActivated) {
        onTenantActivated(applicationData.provisionedOrgId);
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OVE Solutions SaaS Workspace Onboarding"
      subtitle="People • Process • Progress — Register and activate your company CRM"
      size="xl"
    >
      {/* Top Toggle: Register vs Track Status */}
      <div className="flex items-center justify-between border-b border-ove-border pb-3 mb-5">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-ove-forest text-white'
                : 'text-ove-muted hover:text-ove-text hover:bg-ove-soft'
            }`}
          >
            New Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('lookup');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'lookup'
                ? 'bg-ove-forest text-white'
                : 'text-ove-muted hover:text-ove-text hover:bg-ove-soft'
            }`}
          >
            Track Existing Application
          </button>
        </div>

        {mode === 'register' && (
          <div className="hidden sm:flex items-center space-x-2 text-xs text-ove-muted">
            <span className={step >= 1 ? 'font-bold text-ove-forest' : ''}>1. Profile</span>
            <span>→</span>
            <span className={step >= 2 ? 'font-bold text-ove-forest' : ''}>2. Plan</span>
            <span>→</span>
            <span className={step >= 3 ? 'font-bold text-ove-forest' : ''}>3. Payment</span>
            <span>→</span>
            <span className={step === 4 ? 'font-bold text-ove-forest' : ''}>4. Status</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-ove-error/10 border border-ove-error/30 text-ove-error text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MODE 1: LOOKUP EXISTING APPLICATION */}
      {mode === 'lookup' && (
        <form onSubmit={handleLookupSubmit} className="space-y-4 py-4 max-w-md mx-auto">
          <div className="text-center space-y-1">
            <Search className="w-8 h-8 text-ove-primary mx-auto" />
            <h3 className="text-base font-bold text-ove-text">Track Application Status</h3>
            <p className="text-xs text-ove-muted">
              Enter the application reference ID you received during registration.
            </p>
          </div>

          <Input
            label="Application Reference ID"
            placeholder="e.g. app_apex_1 or app_173000..."
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            Find Application
          </Button>
        </form>
      )}

      {/* MODE 2: STEP 1 — COMPANY REGISTRATION */}
      {mode === 'register' && step === 1 && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="e.g. Apex Logistics Ltd"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
            <Input
              label="Work Email Address"
              type="email"
              placeholder="e.g. admin@apexlogistics.com"
              value={formData.workEmail}
              onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
              required
            />
            <Input
              label="Contact / Administrator Name"
              placeholder="e.g. Marcus Vance"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +1 (555) 234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-ove-text mb-1.5">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-ove-border rounded-lg text-ove-text focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
              >
                <option value="Technology & SaaS">Technology & SaaS</option>
                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Financial & Legal Services">Financial & Legal Services</option>
                <option value="Manufacturing & Retail">Manufacturing & Retail</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ove-text mb-1.5">
                Company Size
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-ove-border rounded-lg text-ove-text focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ enterprise</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-ove-border flex items-center justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={ArrowRight}
              loading={loading}
            >
              Continue to Plan Selection
            </Button>
          </div>
        </form>
      )}

      {/* MODE 2: STEP 2 — PLAN SELECTION */}
      {mode === 'register' && step === 2 && (
        <div className="space-y-6">
          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center space-x-3">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-ove-forest' : 'text-ove-muted'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                billingCycle === 'annual' ? 'bg-ove-forest' : 'bg-ove-border'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center space-x-1.5">
              <span className={`text-xs font-semibold ${billingCycle === 'annual' ? 'text-ove-forest' : 'text-ove-muted'}`}>
                Annual Billing
              </span>
              <Badge variant="success">Save ~15%</Badge>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const price = billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly;
              const period = billingCycle === 'annual' ? '/year' : '/mo';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-ove-forest bg-ove-soft/30 shadow-md ring-2 ring-ove-primary/20'
                      : 'border-ove-border bg-white hover:border-ove-primary/50'
                  }`}
                >
                  {p.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ove-forest text-white text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-ove-forest">{p.name}</h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-ove-forest" />}
                    </div>
                    <p className="text-[11px] text-ove-muted mb-3">{p.tagline}</p>
                    <div className="mb-4">
                      <span className="text-2xl font-black text-ove-text">${price}</span>
                      <span className="text-xs text-ove-muted ml-1">{period}</span>
                    </div>

                    <div className="space-y-2 border-t border-ove-border/70 pt-3">
                      {p.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-ove-text">
                          <Check className="w-3.5 h-3.5 text-ove-primary mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(p.id);
                      }}
                    >
                      {isSelected ? 'Selected Plan' : 'Choose Plan'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-ove-border flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back to Profile
            </Button>
            <Button
              variant="primary"
              icon={ArrowRight}
              loading={loading}
              onClick={handlePlanSelectSubmit}
            >
              Continue to Payment Instructions
            </Button>
          </div>
        </div>
      )}

      {/* MODE 2: STEP 3 — PAYMENT PROOF SUBMISSION */}
      {mode === 'register' && step === 3 && (
        <form onSubmit={handlePaymentSubmit} className="space-y-5">
          {/* Bank Instructions Card */}
          <div className="bg-ove-soft border border-ove-border rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-ove-forest">
              <Building2 className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Bank Transfer & Wire Remittance Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-ove-muted block text-[11px]">Beneficiary Name</span>
                <span className="font-semibold text-ove-text">OVE Solutions Inc.</span>
              </div>
              <div>
                <span className="text-ove-muted block text-[11px]">Bank Name</span>
                <span className="font-semibold text-ove-text">Silicon SaaS National Bank</span>
              </div>
              <div>
                <span className="text-ove-muted block text-[11px]">Account Number</span>
                <span className="font-mono font-semibold text-ove-text">9821-4402-9912</span>
              </div>
              <div>
                <span className="text-ove-muted block text-[11px]">Routing / SWIFT Code</span>
                <span className="font-mono font-semibold text-ove-text">SSNBUS33</span>
              </div>
            </div>

            <div className="border-t border-ove-border pt-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-ove-muted">Amount Due:</span>
                <span className="text-base font-bold text-ove-forest ml-1.5">
                  ${applicationData?.amountDue || 149} {applicationData?.currency || 'USD'}
                </span>
              </div>
              <div className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-ove-border text-ove-muted">
                Ref Code: OVE-{applicationId.toUpperCase().slice(-8)}
              </div>
            </div>
          </div>

          {/* Proof Inputs */}
          <div className="space-y-3">
            <Input
              label="Transaction Reference / UTR Number"
              placeholder="e.g. UTR-98231448 or WIRE-CHASE-01992"
              value={paymentForm.paymentReference}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
              required
            />
            <Input
              label="Proof Receipt URL / Cloud Link"
              placeholder="e.g. https://storage.google.com/receipts/proof.pdf (optional)"
              value={paymentForm.proofFileUrl}
              onChange={(e) => setPaymentForm({ ...paymentForm, proofFileUrl: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-ove-text mb-1.5">
                Additional Verification Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Sent from JPMorgan account ending in 4109 on behalf of Apex Logistics."
                value={paymentForm.proofNotes}
                onChange={(e) => setPaymentForm({ ...paymentForm, proofNotes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-ove-border rounded-lg text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-ove-border flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              loading={loading}
            >
              Submit Proof for Super Admin Verification
            </Button>
          </div>
        </form>
      )}

      {/* MODE 2: STEP 4 — STATUS TRACKER */}
      {step === 4 && (
        <div className="space-y-6 py-2 text-center">
          <div className="w-14 h-14 rounded-full bg-ove-soft border-2 border-ove-forest flex items-center justify-center mx-auto text-ove-forest">
            {applicationData?.status === 'approved' ? (
              <CheckCircle2 className="w-7 h-7 text-ove-success" />
            ) : applicationData?.status === 'rejected' ? (
              <AlertCircle className="w-7 h-7 text-ove-error" />
            ) : (
              <Clock className="w-7 h-7 animate-pulse text-ove-primary" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-ove-text">
              Application {applicationData?.status === 'approved' ? 'Approved & Ready!' : 'Under Review'}
            </h3>
            <p className="text-xs text-ove-muted max-w-md mx-auto">
              Reference ID: <span className="font-mono font-semibold text-ove-text">{applicationId}</span>
            </p>
          </div>

          {/* Status Details Box */}
          <div className="bg-ove-soft/60 border border-ove-border rounded-xl p-4 max-w-lg mx-auto text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ove-muted">Company:</span>
              <span className="font-bold text-ove-text">{applicationData?.companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ove-muted">Current Status:</span>
              <span className="capitalize font-bold text-ove-forest">
                {applicationData?.status?.replace('_', ' ')}
              </span>
            </div>
            {applicationData?.paymentReference && (
              <div className="flex items-center justify-between">
                <span className="text-ove-muted">Payment Ref:</span>
                <span className="font-mono">{applicationData.paymentReference}</span>
              </div>
            )}
            {applicationData?.reviewNotes && (
              <div className="border-t border-ove-border pt-2 text-[11px]">
                <span className="font-semibold text-ove-text block">Super Admin Notes:</span>
                <span className="text-ove-muted">{applicationData.reviewNotes}</span>
              </div>
            )}
          </div>

          {applicationData?.status === 'approved' ? (
            <div className="pt-2">
              <Button
                variant="primary"
                icon={Sparkles}
                className="w-full max-w-xs mx-auto"
                onClick={handleWorkspaceLaunch}
              >
                Launch Provisioned Workspace
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshStatus(applicationId)}
              >
                Refresh Status
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
