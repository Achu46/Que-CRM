import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getContacts(req, res, next) {
  try {
    const { search, companyId } = req.query;
    const tenantId = req.user.tenantId;

    const contacts = await store.list('contacts', (contact) => {
      if (companyId && contact.companyId !== companyId) return false;
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesEmail = contact.email?.toLowerCase().includes(q);
        const matchesCompany = contact.companyName?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany) return false;
      }
      return true;
    }, tenantId);

    return sendSuccess(res, contacts, 'Contacts retrieved', 200, { total: contacts.length, tenantId });
  } catch (error) {
    next(error);
  }
}

export async function getContactById(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const contact = await store.getById('contacts', id, tenantId);
    if (!contact) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND');
    }

    const company = contact.companyId ? await store.getById('companies', contact.companyId, tenantId) : null;
    const deals = await store.list('deals', (d) => d.contactId === id || d.companyId === contact.companyId, tenantId);
    const activities = await store.list('activities', (a) => a.entityType === 'contact' && a.entityId === id, tenantId);
    const tasks = await store.list('tasks', (t) => t.entityType === 'contact' && t.entityId === id, tenantId);

    return sendSuccess(res, { ...contact, company, deals, activities, tasks }, 'Contact details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createContact(req, res, next) {
  try {
    const data = req.body;
    const tenantId = req.user.tenantId;

    let companyName = data.companyName;
    if (data.companyId && !companyName) {
      const comp = await store.getById('companies', data.companyId, tenantId);
      if (comp) companyName = comp.name;
    }

    const contact = await store.create('contacts', {
      ...data,
      companyName,
      ownerId: data.ownerId || req.user.uid,
    }, tenantId);

    await store.create('activities', {
      entityType: 'contact',
      entityId: contact.id,
      type: 'note',
      title: 'Contact Created',
      content: `Contact profile created for ${contact.firstName} ${contact.lastName}.`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    }, tenantId);

    return sendSuccess(res, contact, 'Contact created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateContact(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const existing = await store.getById('contacts', id, tenantId);
    if (!existing) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND');
    }

    const updated = await store.update('contacts', id, req.body, tenantId);
    return sendSuccess(res, updated, 'Contact updated successfully');
  } catch (error) {
    next(error);
  }
}
