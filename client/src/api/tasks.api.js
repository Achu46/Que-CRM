import api from './client.js';

export const tasksApi = {
  getAll: async (params) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },
  complete: async (id) => {
    const res = await api.patch(`/tasks/${id}/complete`);
    return res.data;
  },
};

export const activitiesApi = {
  getAll: async (params) => {
    const res = await api.get('/activities', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/activities', data);
    return res.data;
  },
};

