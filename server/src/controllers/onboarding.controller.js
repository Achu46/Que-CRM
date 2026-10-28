import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Public SaaS Onboarding Controller
 * Manages company registration, plan selection, payment proof submission, and status inquiries.
 */

// 1. Get Subscription Plans
export async function getSubscriptionPlans(req, res, next) {
  try {
    const plans = await store.list('subscriptionPlans');
    return sendSuccess(res, plans, 'Active subscription plans retrieved successfully');
  } catch (error) {
    next(error);
  }
}

// 2. Register Company Application
export async function registerApplication(req, res, next) {
  try {
    const { companyName, workEmail, phone, industry, companySize, ownerName } = req.body;

    // Check if an application with this work email already exists in submitted or under_review state
    const existing = await store.list('organizationApplications', (app) => {
      return (
        app.workEmail?.toLowerCase() === workEmail.toLowerCase() &&
        ['submitted', 'payment_pending', 'under_review'].includes(app.status)
      );
    });

    if (existing.length > 0) {
      throw new AppError(
        'An active application for this email already exists. Please track your existing application status.',
        409,
        'APPLICATION_EXISTS'
      );
    }

    const newApp = await store.create('organizationApplications', {
      companyName,
      workEmail,
      phone,
      industry,
      companySize,
      ownerName,
      status: 'submitted',
      planId: null,
      billingCycle: 'monthly',
      amountDue: 0,
      currency: 'USD',
      paymentReference: null,
      proofNotes: null,
      proofFileUrl: null,
      reviewNotes: null,
      provisionedOrgId: null,
    });

    return sendSuccess(
      res,
      {
        applicationId: newApp.id,
        companyName: newApp.companyName,
        workEmail: newApp.workEmail,
        status: newApp.status,
      },
      'Company registration submitted successfully. Please proceed to plan selection.',
      201
    );
  } catch (error) {
    next(error);
  }
}

// 3. Select Subscription Plan
export async function selectPlan(req, res, next) {
  try {
    const { applicationId, planId, billingCycle } = req.body;

    const application = await store.getById('organizationApplications', applicationId);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    if (application.status === 'approved') {
      throw new AppError('This application has already been approved and provisioned', 400, 'ALREADY_APPROVED');
    }

    // Verify plan exists
    const plans = await store.list('subscriptionPlans');
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) {
      throw new AppError('Selected subscription plan not found', 404, 'PLAN_NOT_FOUND');
    }

    const amountDue = billingCycle === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;

    const updated = await store.update('organizationApplications', applicationId, {
      planId,
      billingCycle,
      amountDue,
      currency: selectedPlan.currency || 'USD',
      status: 'payment_pending',
    });

    return sendSuccess(
      res,
      {
        applicationId: updated.id,
        plan: selectedPlan,
        billingCycle,
        amountDue,
        currency: updated.currency,
        status: updated.status,
        paymentInstructions: {
          beneficiary: 'OVE Solutions Inc.',
          bankName: 'Silicon SaaS National Bank',
          accountNumber: '9821-4402-9912',
          routingSwift: 'SSNBUS33',
          paymentReferenceCode: `OVE-${applicationId.toUpperCase().slice(-8)}`,
        },
      },
      'Plan selected successfully. Please submit payment reference to initiate Super Admin review.'
    );
  } catch (error) {
    next(error);
  }
}

// 4. Submit Manual Payment Proof
export async function submitPayment(req, res, next) {
  try {
    const { applicationId, paymentReference, proofNotes, proofFileUrl } = req.body;

    const application = await store.getById('organizationApplications', applicationId);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    if (application.status === 'approved') {
      throw new AppError('This application has already been approved', 400, 'ALREADY_APPROVED');
    }

    const updated = await store.update('organizationApplications', applicationId, {
      paymentReference,
      proofNotes: proofNotes || '',
      proofFileUrl: proofFileUrl || '',
      status: 'under_review',
      submittedAt: new Date().toISOString(),
    });

    // Record in global audit logs
    await store.create('auditLogs', {
      action: 'payment_proof_submitted',
      actorEmail: application.workEmail,
      targetType: 'application',
      targetId: applicationId,
      details: `Payment reference ${paymentReference} submitted for ${application.companyName} (${application.planId} plan).`,
    });

    return sendSuccess(
      res,
      {
        applicationId: updated.id,
        companyName: updated.companyName,
        status: updated.status,
        paymentReference: updated.paymentReference,
        submittedAt: updated.submittedAt,
      },
      'Payment proof submitted successfully. Your workspace application is under review by the OVE Solutions Platform Team.'
    );
  } catch (error) {
    next(error);
  }
}

// 5. Track Application Status
export async function getApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const application = await store.getById('organizationApplications', id);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(
      res,
      {
        id: application.id,
        companyName: application.companyName,
        workEmail: application.workEmail,
        status: application.status,
        planId: application.planId,
        billingCycle: application.billingCycle,
        amountDue: application.amountDue,
        currency: application.currency,
        paymentReference: application.paymentReference,
        reviewNotes: application.reviewNotes,
        provisionedOrgId: application.provisionedOrgId,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
      'Application status retrieved'
    );
  } catch (error) {
    next(error);
  }
}
