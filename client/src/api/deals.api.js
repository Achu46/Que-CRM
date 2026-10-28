import api from './client.js';

export const dealsApi = {
  getAll: async (params) => {
    const res = await api.get('/deals', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/deals/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/deals', data);
    return res.data;
  },
  updateStage: async (id, stage, lostReason, lostNotes) => {
    const res = await api.patch(`/deals/${id}/stage`, { stage, lostReason, lostNotes });
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/deals/${id}`, data);
    return res.data;
  },
};

