import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const designsAPI = {
  getAll: (params) => api.get('/designs', { params }),
  getById: (id) => api.get(`/designs/${id}`),
  create: (data) => api.post('/designs', data),
  update: (id, data) => api.put(`/designs/${id}`, data),
  publish: (id) => api.put(`/designs/${id}/publish`),
  delete: (id) => api.delete(`/designs/${id}`),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),
  review: (id, data) => api.post(`/orders/${id}/review`, data),
};

export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  addMeasurement: (data) => api.post('/customer/measurements', data),
  updateMeasurement: (id, data) => api.put(`/customer/measurements/${id}`, data),
  deleteMeasurement: (id) => api.delete(`/customer/measurements/${id}`),
  addAddress: (data) => api.post('/customer/addresses', data),
  updateAddress: (id, data) => api.put(`/customer/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/customer/addresses/${id}`),
  addFavorite: (designId) => api.post(`/customer/favorites/${designId}`),
  removeFavorite: (designId) => api.delete(`/customer/favorites/${designId}`),
  getFavorites: () => api.get('/customer/favorites'),
  getOrders: (params) => api.get('/customer/orders', { params }),
};

export const shopAPI = {
  onboard: (data) => api.post('/shop/onboard', data),
  getProfile: () => api.get('/shop/profile'),
  updateProfile: (data) => api.put('/shop/profile', data),
  getDashboard: () => api.get('/shop/dashboard'),
  getDesigns: (params) => api.get('/shop/designs', { params }),
  getOrders: (params) => api.get('/shop/orders', { params }),
  getAnalytics: (params) => api.get('/shop/analytics', { params }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingCertifications: () => api.get('/admin/certifications/pending'),
  approveCertification: (shopId, data) => api.put(`/admin/certifications/${shopId}/approve`, data),
  rejectCertification: (shopId, data) => api.put(`/admin/certifications/${shopId}/reject`, data),
  getOrders: (params) => api.get('/admin/orders', { params }),
  overrideOrder: (id, data) => api.put(`/admin/orders/${id}/override`, data),
  getShops: (params) => api.get('/admin/shops', { params }),
  getPricingRules: (params) => api.get('/admin/pricing', { params }),
  createPricingRule: (data) => api.post('/admin/pricing', data),
  updatePricingRule: (id, data) => api.put(`/admin/pricing/${id}`, data),
  deletePricingRule: (id) => api.delete(`/admin/pricing/${id}`),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  getPerformanceReport: (params) => api.get('/admin/reports/performance', { params }),
};

export const deliveryAPI = {
  getJobs: (params) => api.get('/delivery/jobs', { params }),
  getJobById: (id) => api.get(`/delivery/jobs/${id}`),
  getZones: () => api.get('/delivery/zones'),
};

export const paymentAPI = {
  initialize: (data) => api.post('/payments/initialize', data),
  getMethods: () => api.get('/payments/methods'),
  getStatus: (orderId) => api.get(`/payments/status/${orderId}`),
};

export default api;
