import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getContacts(req, res, next) {
  try {
    const { search, companyId } = req.query;

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
    });

    return sendSuccess(res, contacts, 'Contacts retrieved', 200, { total: contacts.length });
  } catch (error) {
    next(error);
  }
}

export async function getContactById(req, res, next) {
  try {
    const { id } = req.params;
    const contact = await store.getById('contacts', id);
    if (!contact) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND');
    }

    const company = contact.companyId ? await store.getById('companies', contact.companyId) : null;
    const deals = await store.list('deals', (d) => d.contactId === id || d.companyId === contact.companyId);
    const activities = await store.list('activities', (a) => a.entityType === 'contact' && a.entityId === id);
    const tasks = await store.list('tasks', (t) => t.entityType === 'contact' && t.entityId === id);

    return sendSuccess(res, { ...contact, company, deals, activities, tasks }, 'Contact details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createContact(req, res, next) {
  try {
    const data = req.body;

    let companyName = data.companyName;
    if (data.companyId && !companyName) {
      const comp = await store.getById('companies', data.companyId);
      if (comp) companyName = comp.name;
    }

    const contact = await store.create('contacts', {
      ...data,
      companyName,
      ownerId: data.ownerId || req.user.uid,
    });

    await store.create('activities', {
      entityType: 'contact',
      entityId: contact.id,
      type: 'note',
      title: 'Contact Created',
      content: `Contact profile created for ${contact.firstName} ${contact.lastName}.`,
      performedBy: req.user.uid,
      performedByName: req.user.name,
    });

    return sendSuccess(res, contact, 'Contact created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateContact(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await store.getById('contacts', id);
    if (!existing) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND');
    }

    const updated = await store.update('contacts', id, req.body);
    return sendSuccess(res, updated, 'Contact updated successfully');
  } catch (error) {
    next(error);
  }
}

