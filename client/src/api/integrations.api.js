import api from './client.js';

export const dashboardApi = {
  getMetrics: async () => {
    const res = await api.get('/dashboard/metrics');
    return res.data;
  },
};

export const emailApi = {
  send: async (payload) => {
    const res = await api.post('/emails/send', payload);
    return res.data;
  },
};

export const aiApi = {
  summarize: async (payload) => {
    const res = await api.post('/ai/summarize', payload);
    return res.data;
  },
  draftEmail: async (payload) => {
    const res = await api.post('/ai/draft-email', payload);
    return res.data;
  },
  extractLead: async (payload) => {
    const res = await api.post('/ai/extract-lead', payload);
    return res.data;
  },
};

