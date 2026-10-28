import { store } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

export async function getCompanies(req, res, next) {
  try {
    const { search, industry } = req.query;

    const companies = await store.list('companies', (comp) => {
      if (industry && industry !== 'all' && comp.industry !== industry) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!comp.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    return sendSuccess(res, companies, 'Companies retrieved', 200, { total: companies.length });
  } catch (error) {
    next(error);
  }
}

export async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const company = await store.getById('companies', id);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const contacts = await store.list('contacts', (c) => c.companyId === id);
    const deals = await store.list('deals', (d) => d.companyId === id);

    return sendSuccess(res, { ...company, contacts, deals }, 'Company details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createCompany(req, res, next) {
  try {
    const company = await store.create('companies', {
      ...req.body,
      ownerId: req.user.uid,
    });

    return sendSuccess(res, company, 'Company created successfully', 201);
  } catch (error) {
    next(error);
  }
}
