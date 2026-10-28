import api from './client.js';

export const contactsApi = {
  getAll: async (params) => {
    const res = await api.get('/contacts', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/contacts/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/contacts', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/contacts/${id}`, data);
    return res.data;
  },
};

export const companiesApi = {
  getAll: async (params) => {
    const res = await api.get('/companies', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/companies/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/companies', data);
    return res.data;
  },
};
