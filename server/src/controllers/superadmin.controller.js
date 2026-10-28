import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';
import { resendService } from '../services/resend.service.js';

/**
 * Super Admin Platform Governance Controller
 * Governs platform metrics, company onboarding approvals, tenant management, and audit logs.
 */

// 1. Platform Governance Dashboard
export async function getPlatformDashboard(req, res, next) {
  try {
    const orgs = await store.list('organizations');
    const applications = await store.list('organizationApplications');
    const auditLogs = await store.list('auditLogs');

    const totalTenants = orgs.length;
    const activeTenants = orgs.filter((o) => o.status !== 'suspended').length;
    const suspendedTenants = orgs.filter((o) => o.status === 'suspended').length;

    const pendingApplications = applications.filter((a) => a.status === 'under_review').length;
    const totalApplications = applications.length;

    // Calculate approximate Monthly Recurring Revenue (MRR)
    const planPrices = { starter: 49, pro: 149, enterprise: 499 };
    const mrr = orgs
      .filter((o) => o.status !== 'suspended')
      .reduce((sum, o) => sum + (planPrices[o.plan] || 149), 0);

    const recentApplications = [...applications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentAuditLogs = [...auditLogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return sendSuccess(
      res,
      {
        metrics: {
          totalTenants,
          activeTenants,
          suspendedTenants,
          pendingApplications,
          totalApplications,
          monthlyRecurringRevenue: mrr,
          retentionRatePercent: 96.5,
        },
        recentApplications,
        recentAuditLogs,
      },
      'Platform governance dashboard metrics retrieved'
    );
  } catch (error) {
    next(error);
  }
}

// 2. List Applications (filterable by status)
export async function listApplications(req, res, next) {
  try {
    const { status } = req.query;
    let filterFn = null;
    if (status) {
      filterFn = (app) => app.status === status;
    }

    const applications = await store.list('organizationApplications', filterFn);
    // Sort newest first
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sendSuccess(res, applications, 'Company applications retrieved successfully');
  } catch (error) {
    next(error);
  }
}

// 3. Get Application Detail
export async function getApplicationDetail(req, res, next) {
  try {
    const { id } = req.params;
    const application = await store.getById('organizationApplications', id);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    // Attach plan details
    const plans = await store.list('subscriptionPlans');
    const planDetails = plans.find((p) => p.id === application.planId) || null;

    return sendSuccess(
      res,
      {
        ...application,
        planDetails,
      },
      'Application detail retrieved'
    );
  } catch (error) {
    next(error);
  }
}

// 4. Review Application (Approve, Reject, or Request Info)
export async function reviewApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;

    const application = await store.getById('organizationApplications', id);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const reviewerEmail = req.user?.email || 'superadmin@ove.com';
    const reviewerId = req.user?.uid || 'user_super_admin_1';
    const now = new Date().toISOString();

    if (decision === 'approve') {
      if (application.status === 'approved') {
        throw new AppError('Application has already been approved and provisioned', 400, 'ALREADY_APPROVED');
      }

      // 1. Provision new Organization
      const cleanSlug = application.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const orgId = `org_${cleanSlug}_${Math.random().toString(36).substring(2, 6)}`;

      // Fetch plan limits
      const plans = await store.list('subscriptionPlans');
      const plan = plans.find((p) => p.id === application.planId);
      const limits = plan?.limits || {
        maxLeads: 10000,
        maxMembers: 10,
        geminiTier: 'pro',
        webhooksEnabled: true,
      };

      const newOrg = await store.create('organizations', {
        id: orgId,
        name: application.companyName,
        slug: cleanSlug,
        plan: application.planId || 'pro',
        status: 'active',
        statusReason: 'Approved by Super Admin',
        ownerEmail: application.workEmail,
        ownerName: application.ownerName,
        billingCycle: application.billingCycle || 'monthly',
        amountDue: application.amountDue || 149,
        limits,
      });

      // 2. Create Tenant Owner Membership
      const ownerUserId = `user_${application.workEmail.replace(/[^a-z0-9]/gi, '_')}`;
      await store.create('memberships', {
        userId: ownerUserId,
        userName: application.ownerName,
        userEmail: application.workEmail,
        tenantId: orgId,
        role: 'tenant_owner',
        isActive: true,
      });

      // 3. Mark Application as Approved
      const updatedApp = await store.update('organizationApplications', id, {
        status: 'approved',
        provisionedOrgId: orgId,
        reviewNotes: notes,
        reviewedAt: now,
        reviewedBy: reviewerEmail,
      });

      // 4. Log Immutable Audit Record
      await store.create('auditLogs', {
        action: 'application_approved',
        actorId: reviewerId,
        actorEmail: reviewerEmail,
        targetType: 'organization',
        targetId: orgId,
        details: `Super Admin approved ${application.companyName} (${application.planId} plan). Provisioned workspace ID: ${orgId}. Notes: ${notes}`,
      });

      // 5. Send Activation Email via Resend
      try {
        await resendService.sendEmail({
          to: application.workEmail,
          subject: `Welcome to OVE Solutions — Your Workspace ${application.companyName} is Active!`,
          html: `
            <div style="font-family: sans-serif; color: #273126; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E4E7DC; border-radius: 12px;">
              <h2 style="color: #30452B;">Welcome to OVE Solutions</h2>
              <p>Hello ${application.ownerName},</p>
              <p>Your subscription for <strong>${application.companyName}</strong> has been approved and your dedicated CRM workspace is now active.</p>
              <div style="background-color: #F7F8F3; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Workspace ID:</strong> <code>${orgId}</code></p>
                <p style="margin: 4px 0;"><strong>Plan Tier:</strong> ${plan?.name || 'Professional'}</p>
                <p style="margin: 4px 0;"><strong>Admin Email:</strong> ${application.workEmail}</p>
              </div>
              <p>You can now log in to manage leads, invite team members, and configure round-robin distribution.</p>
              <p style="color: #74796F; font-size: 13px; margin-top: 30px;">
                OVE Solutions • People • Process • Progress<br/>
                Internal Review Note: ${notes}
              </p>
            </div>
          `,
          text: `Welcome to OVE Solutions! Your workspace for ${application.companyName} is active. Workspace ID: ${orgId}. Plan: ${plan?.name || 'Pro'}.`,
        });
      } catch (emailErr) {
        console.warn('[Resend] Activation email delivery logged with warning:', emailErr.message);
      }

      return sendSuccess(
        res,
        {
          application: updatedApp,
          organization: newOrg,
        },
        'Application approved successfully. Workspace provisioned and activation notification dispatched.'
      );
    }

    if (decision === 'reject') {
      const updatedApp = await store.update('organizationApplications', id, {
        status: 'rejected',
        reviewNotes: notes,
        reviewedAt: now,
        reviewedBy: reviewerEmail,
      });

      await store.create('auditLogs', {
        action: 'application_rejected',
        actorId: reviewerId,
        actorEmail: reviewerEmail,
        targetType: 'application',
        targetId: id,
        details: `Super Admin rejected application for ${application.companyName}. Reason: ${notes}`,
      });

      // Dispatch rejection notice
      try {
        await resendService.sendEmail({
          to: application.workEmail,
          subject: `Update regarding your OVE Solutions application for ${application.companyName}`,
          html: `<p>Dear ${application.ownerName},</p><p>Thank you for your interest in OVE Solutions. After reviewing your registration and payment details, we were unable to approve your application at this time.</p><p><strong>Reason / Notes:</strong> ${notes}</p><p>Please contact support@ove.com if you have questions.</p>`,
          text: `Your OVE Solutions application for ${application.companyName} could not be approved. Reason: ${notes}`,
        });
      } catch (err) {
        // Continue
      }

      return sendSuccess(res, updatedApp, 'Application rejected and notice recorded');
    }

    if (decision === 'request_info') {
      const updatedApp = await store.update('organizationApplications', id, {
        status: 'info_requested',
        reviewNotes: notes,
        reviewedAt: now,
        reviewedBy: reviewerEmail,
      });

      await store.create('auditLogs', {
        action: 'application_info_requested',
        actorId: reviewerId,
        actorEmail: reviewerEmail,
        targetType: 'application',
        targetId: id,
        details: `Super Admin requested additional verification for ${application.companyName}. Note: ${notes}`,
      });

      return sendSuccess(res, updatedApp, 'Application marked as info requested');
    }

    throw new AppError('Invalid review decision', 400, 'INVALID_DECISION');
  } catch (error) {
    next(error);
  }
}

// 5. List All Platform Tenants
export async function listTenants(req, res, next) {
  try {
    const { status } = req.query;
    let filterFn = null;
    if (status) {
      filterFn = (org) => org.status === status;
    }

    const orgs = await store.list('organizations', filterFn);
    const leads = await store.list('leads');
    const members = await store.list('memberships');

    // Augment with counts
    const augmented = orgs.map((org) => {
      const orgLeads = leads.filter((l) => l.tenantId === org.id);
      const orgMembers = members.filter((m) => m.tenantId === org.id);
      return {
        ...org,
        leadCount: orgLeads.length,
        memberCount: orgMembers.length,
      };
    });

    return sendSuccess(res, augmented, 'Platform tenants retrieved successfully');
  } catch (error) {
    next(error);
  }
}

// 6. Update Tenant Status (Suspend / Reactivate)
export async function updateTenantStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const org = await store.getById('organizations', id);
    if (!org) {
      throw new AppError('Tenant organization not found', 404, 'NOT_FOUND');
    }

    const updated = await store.update('organizations', id, {
      status,
      statusReason: reason,
    });

    await store.create('auditLogs', {
      action: status === 'suspended' ? 'tenant_suspended' : 'tenant_reactivated',
      actorId: req.user?.uid || 'user_super_admin_1',
      actorEmail: req.user?.email || 'superadmin@ove.com',
      targetType: 'organization',
      targetId: id,
      details: `Super Admin set tenant ${org.name} (${id}) status to ${status}. Reason: ${reason}`,
    });

    return sendSuccess(res, updated, `Tenant status successfully updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

// 7. List Platform Audit Logs
export async function listAuditLogs(req, res, next) {
  try {
    const logs = await store.list('auditLogs');
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendSuccess(res, logs, 'Platform audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
}
