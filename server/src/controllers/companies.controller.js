import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getCompanies(req, res, next) {
  try {
    const { search, industry } = req.query;
    const tenantId = req.user.tenantId;

    const companies = await store.list('companies', (comp) => {
      if (industry && industry !== 'all' && comp.industry !== industry) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!comp.name.toLowerCase().includes(q)) return false;
      }
      return true;
    }, tenantId);

    return sendSuccess(res, companies, 'Companies retrieved', 200, { total: companies.length, tenantId });
  } catch (error) {
    next(error);
  }
}

export async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const company = await store.getById('companies', id, tenantId);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const contacts = await store.list('contacts', (c) => c.companyId === id, tenantId);
    const deals = await store.list('deals', (d) => d.companyId === id, tenantId);

    return sendSuccess(res, { ...company, contacts, deals }, 'Company details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createCompany(req, res, next) {
  try {
    const tenantId = req.user.tenantId;
    const company = await store.create('companies', {
      ...req.body,
      ownerId: req.user.uid,
    }, tenantId);

    return sendSuccess(res, company, 'Company created successfully', 201);
  } catch (error) {
    next(error);
  }
}
