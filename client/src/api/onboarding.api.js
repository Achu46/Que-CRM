import api from './client';

export const onboardingApi = {
  getPlans: () => api.get('/onboarding/plans').then((res) => res.data),
  register: (payload) => api.post('/onboarding/register', payload).then((res) => res.data),
  selectPlan: (payload) => api.post('/onboarding/select-plan', payload).then((res) => res.data),
  submitPayment: (payload) => api.post('/onboarding/submit-payment', payload).then((res) => res.data),
  getStatus: (id) => api.get(`/onboarding/status/${id}`).then((res) => res.data),
};
