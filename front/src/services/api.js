import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData (for file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Let browser set it with boundary
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/user'),
};

// User endpoints
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserRentals: (userId) => api.get(`/users/${userId}/rentals`),
  verifyStudent: (verificationData) => api.post('/users/verify-student', verificationData),
  getEarnings: () => api.get('/user/earnings'),
};

// Rental endpoints
export const rentalAPI = {
  getRentals: (queryString = '') => api.get(`/rentals${queryString}`),
  getRental: (id) => api.get(`/rentals/${id}`),
  createRental: (rentalData) => api.post('/rentals', rentalData),
  updateRental: (id, rentalData) => api.put(`/rentals/${id}`, rentalData),
  deleteRental: (id) => api.delete(`/rentals/${id}`),
  contactRental: (contactData) => api.post('/contact-rental', contactData),
  checkout: (checkoutData) => api.post('/checkout', checkoutData),
};

// Admin endpoints
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTransactions: () => api.get('/admin/transactions'),
  updateTransaction: (id, transactionData) => api.put(`/admin/transactions/${id}`, transactionData),
  getNotifications: () => api.get('/admin/notifications'),
};

export default api; 