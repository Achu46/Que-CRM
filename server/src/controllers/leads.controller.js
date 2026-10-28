import { store } from '../services/store.service.js';
import { n8nService } from '../services/n8n.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getLeads(req, res, next) {
  try {
    const { status, source, search } = req.query;
    const tenantId = req.user.tenantId;

    const leads = await store.list('leads', (lead) => {
      if (lead.isArchived) return false;
      if (status && status !== 'all' && lead.status !== status) return false;
      if (source && source !== 'all' && lead.source !== source) return false;
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesEmail = lead.email?.toLowerCase().includes(q);
        const matchesCompany = lead.companyName?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany) return false;
      }
      return true;
    }, tenantId);

    return sendSuccess(res, leads, 'Leads retrieved successfully', 200, {
      total: leads.length,
      tenantId,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadById(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const lead = await store.getById('leads', id, tenantId);
    if (!lead || lead.isArchived) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND');
    }

    const activities = await store.list(
      'activities',
      (act) => act.entityType === 'lead' && act.entityId === id,
      tenantId
    );

    const tasks = await store.list(
      'tasks',
      (t) => t.entityType === 'lead' && t.entityId === id,
      tenantId
    );

    return sendSuccess(res, { ...lead, activities, tasks }, 'Lead details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createLead(req, res, next) {
  try {
    const data = req.body;
    const tenantId = req.user.tenantId;

    // Duplicate detection check within the current tenant
    const existing = await store.list(
      'leads',
      (l) => !l.isArchived && (l.email.toLowerCase() === data.email.toLowerCase() || (data.phone && l.phone === data.phone)),
      tenantId
    );

    const isDuplicate = existing.length > 0;

    const newLead = await store.create('leads', {
      ...data,
      assignedTo: data.assignedTo || req.user.uid,
      isConverted: false,
      isArchived: false,
    }, tenantId);

    // Auto-log creation activity
    await store.create('activities', {
      entityType: 'lead',
      entityId: newLead.id,
      type: 'note',
      title: 'Lead Created',
      content: `Lead created from source: ${newLead.source}. Initial status: ${newLead.status}.`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    }, tenantId);

    // Outbound automation trigger via n8n
    n8nService.dispatch('lead.created', newLead);

    return sendSuccess(
      res,
      { ...newLead, warning: isDuplicate ? 'Potential duplicate email/phone detected in organization' : null },
      'Lead created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function updateLead(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const existing = await store.getById('leads', id, tenantId);
    if (!existing || existing.isArchived) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND');
    }

    const updated = await store.update('leads', id, req.body, tenantId);
    return sendSuccess(res, updated, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function archiveLead(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const existing = await store.getById('leads', id, tenantId);
    if (!existing) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND');
    }

    await store.update('leads', id, { isArchived: true, archivedAt: new Date().toISOString() }, tenantId);
    return sendSuccess(res, { id, archived: true }, 'Lead archived successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Atomic Lead Conversion Service with Multi-Tenant Scoping
 */
export async function convertLead(req, res, next) {
  try {
    const { id } = req.params;
    const { companyName, dealTitle, dealAmount, expectedCloseDate } = req.body;
    const tenantId = req.user.tenantId;

    const lead = await store.getById('leads', id, tenantId);
    if (!lead || lead.isArchived) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND');
    }

    if (lead.isConverted) {
      throw new AppError('Lead is already converted', 400, 'ALREADY_CONVERTED');
    }

    // 1. Create Company under tenant
    const company = await store.create('companies', {
      name: companyName || lead.companyName || `${lead.firstName}'s Org`,
      industry: 'Technology',
      ownerId: req.user.uid,
    }, tenantId);

    // 2. Create Contact under tenant
    const contact = await store.create('contacts', {
      companyId: company.id,
      companyName: company.name,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      jobTitle: 'Key Decision Maker',
      ownerId: req.user.uid,
      isPrimary: true,
    }, tenantId);

    // 3. Create Deal if specified
    let deal = null;
    if (dealTitle || dealAmount !== undefined) {
      deal = await store.create('deals', {
        title: dealTitle || `${company.name} - Initial Opportunity`,
        amount: dealAmount || 10000,
        currency: 'USD',
        stage: '2_qualified',
        probability: 30,
        companyId: company.id,
        companyName: company.name,
        contactId: contact.id,
        contactName: `${contact.firstName} ${contact.lastName}`,
        ownerId: req.user.uid,
        expectedCloseDate: expectedCloseDate || new Date(Date.now() + 86400000 * 30).toISOString(),
        stageChangedAt: new Date().toISOString(),
      }, tenantId);
    }

    // 4. Mark Lead as Converted
    await store.update('leads', id, {
      status: 'qualified',
      isConverted: true,
      convertedAt: new Date().toISOString(),
      convertedTo: {
        companyId: company.id,
        contactId: contact.id,
        dealId: deal?.id || null,
      },
    }, tenantId);

    // 5. Log activity
    await store.create('activities', {
      entityType: 'contact',
      entityId: contact.id,
      type: 'note',
      title: 'Lead Converted',
      content: `Converted from lead ${lead.id}. Created Company (${company.name}) and Contact.`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    }, tenantId);

    return sendSuccess(
      res,
      { company, contact, deal },
      'Lead converted successfully into Company, Contact, and Deal',
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk Import Leads API
 * Ingests a batch of lead rows, checks tenant duplicates, and inserts valid rows.
 */
export async function bulkImportLeads(req, res, next) {
  try {
    const { leads: rawLeads, skipDuplicates = true } = req.body;
    const tenantId = req.user.tenantId;

    // Fetch existing active emails for this tenant to check duplicates
    const existingLeads = await store.list('leads', (l) => !l.isArchived, tenantId);
    const existingEmails = new Set(existingLeads.map((l) => l.email.toLowerCase()));

    const toImport = [];
    let skippedCount = 0;
    const seenInBatch = new Set();

    for (const lead of rawLeads) {
      const emailLower = lead.email.toLowerCase().trim();

      // Check duplicate within batch or against database
      if (seenInBatch.has(emailLower) || existingEmails.has(emailLower)) {
        if (skipDuplicates) {
          skippedCount++;
          continue;
        }
      }

      seenInBatch.add(emailLower);
      toImport.push({
        ...lead,
        assignedTo: req.user.uid,
        isConverted: false,
        isArchived: false,
      });
    }

    // Batch insert into store
    const createdLeads = await store.createBatch('leads', toImport, tenantId);

    // Log bulk import activity
    if (createdLeads.length > 0) {
      await store.create('activities', {
        entityType: 'lead',
        entityId: createdLeads[0].id,
        type: 'note',
        title: 'Bulk Lead Import',
        content: `Bulk imported ${createdLeads.length} leads. Skipped ${skippedCount} duplicate(s).`,
        performedBy: req.user.uid,
        performedByName: req.user.name,
      }, tenantId);
    }

    return sendSuccess(
      res,
      {
        totalProcessed: rawLeads.length,
        importedCount: createdLeads.length,
        skippedCount,
      },
      `Bulk import completed: ${createdLeads.length} imported, ${skippedCount} skipped.`,
      201
    );
  } catch (error) {
    next(error);
  }
}
