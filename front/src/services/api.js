import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Track if we're currently redirecting to avoid multiple redirects
let isRedirecting = false;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    console.log('API Request interceptor:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      isFormData: config.data instanceof FormData,
      headers: config.headers
    });
    
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Only redirect to login if we have a token (meaning it's expired/invalid)
      // Don't redirect if there's no token (user might be on a public page)
      const token = localStorage.getItem('authToken');
      if (token && !isRedirecting) {
        console.warn('Authentication failed, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register') &&
            !window.location.pathname === '/') {
          isRedirecting = true;
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 errors (suspended/deactivated accounts)
    if (error.response?.status === 403) {
      const data = error.response.data;
      
      // Handle deactivated accounts - force logout
      if (data.error === 'Account deactivated' || data.force_logout) {
        console.warn('Account deactivated, forcing logout');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        if (!isRedirecting) {
          isRedirecting = true;
          // Show detailed alert and redirect to login
          const message = data.restriction_details?.contact_info 
            ? `${data.message}\n\n${data.restriction_details.contact_info}`
            : data.message || 'Your account has been deactivated. Please contact support.';
          
          alert(message);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      // Handle suspended accounts - show specific error but don't force logout
      if (data.error === 'Account suspended') {
        console.warn('Account suspended, blocking operation:', data.restriction_details?.blocked_action || 'unknown action');
        
        // Add detailed restriction info to error for components to use
        error.restrictionDetails = {
          type: 'suspended',
          blockedAction: data.restriction_details?.blocked_action || 'this action',
          contactInfo: data.restriction_details?.contact_info || 'Please contact support.',
          message: data.message
        };
        
        // The component will handle displaying the error message
        return Promise.reject(error);
      }
      
      // Handle other 403 errors with detailed messages
      if (data.restriction_type) {
        error.restrictionDetails = {
          type: data.restriction_type,
          blockedAction: data.restriction_details?.blocked_action || 'this action',
          contactInfo: data.restriction_details?.contact_info || 'Please contact support.',
          message: data.message
        };
        return Promise.reject(error);
      }
    }
    
    // Handle network errors with retry logic for non-auth requests
    if (!error.response && !originalRequest._retry && 
        !originalRequest.url.includes('/auth/') && 
        !originalRequest.url.includes('/user')) {
      originalRequest._retry = true;
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await api.request(originalRequest);
      } catch (retryError) {
        console.warn('Retry failed:', retryError);
        return Promise.reject(retryError);
      }
    }
    
    // Reset redirecting flag after some time
    if (isRedirecting) {
      setTimeout(() => {
        isRedirecting = false;
      }, 2000);
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
  healthCheck: () => api.get('/test'), // Simple health check endpoint
};

// User endpoints
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserRentals: (userId) => api.get(`/users/${userId}/rentals`),
  verifyStudent: (verificationData) => {
    // If FormData, do not set Content-Type, let Axios handle it
    return api.post('/users/verify-student', verificationData);
  },
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