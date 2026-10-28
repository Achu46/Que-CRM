import api from './client.js';

export const leadsApi = {
  getAll: async (params) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/leads', data);
    return res.data;
  },
  bulkImport: async (payload) => {
    const res = await api.post('/leads/bulk-import', payload);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/leads/${id}`, data);
    return res.data;
  },
  archive: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },
  convert: async (id, data) => {
    const res = await api.post(`/leads/${id}/convert`, data);
    return res.data;
  },
};
