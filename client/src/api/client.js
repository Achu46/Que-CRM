import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase Auth token if present
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('crm_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Error]:', {
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;

