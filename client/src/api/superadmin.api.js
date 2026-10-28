import api from './client';

export const superAdminApi = {
  getDashboard: () => api.get('/super-admin/dashboard').then((res) => res.data),
  getApplications: (status) =>
    api.get('/super-admin/applications', { params: status ? { status } : {} }).then((res) => res.data),
  getApplication: (id) => api.get(`/super-admin/applications/${id}`).then((res) => res.data),
  reviewApplication: (id, payload) =>
    api.post(`/super-admin/applications/${id}/review`, payload).then((res) => res.data),
  getTenants: (status) =>
    api.get('/super-admin/tenants', { params: status ? { status } : {} }).then((res) => res.data),
  updateTenantStatus: (id, payload) =>
    api.patch(`/super-admin/tenants/${id}/status`, payload).then((res) => res.data),
  getAuditLogs: () => api.get('/super-admin/audit-logs').then((res) => res.data),
};
