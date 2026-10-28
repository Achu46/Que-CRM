import api from './client.js';

export const organizationsApi = {
  getMyOrgs: async () => {
    const res = await api.get('/organizations/my-orgs');
    return res.data;
  },
  getCurrent: async () => {
    const res = await api.get('/organizations/current');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/organizations', data);
    return res.data;
  },
};
