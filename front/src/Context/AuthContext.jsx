import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely parse JSON
  const safeJsonParse = (jsonString) => {
    try {
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  };

  // Helper function to validate user data structure
  const isValidUserData = (userData) => {
    return userData && 
           typeof userData === 'object' && 
           userData.id && 
           userData.email;
  };

  // Check if user is already authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    console.log('AuthContext: Initializing authentication state', {
      hasToken: !!token,
      hasStoredUserData: !!storedUserData,
      tokenLength: token ? token.length : 0
    });
    
    if (token && storedUserData) {
      const parsedUser = safeJsonParse(storedUserData);
      
      if (!isValidUserData(parsedUser)) {
        console.warn('AuthContext: Invalid user data in localStorage, clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setLoading(false);
        return;
      }
      
      console.log('AuthContext: Valid user data found in localStorage', parsedUser);
      
      // First, set the user from localStorage to show UI immediately
      setUser(parsedUser);
      setIsLoggedIn(true);
      setLoading(false);
      
      // Then, verify the token with the backend
      console.log('AuthContext: Verifying token with backend...');
      authAPI.getCurrentUser()
        .then(response => {
          console.log('AuthContext: Token verification successful', response.data);
          // Update user data with fresh data from server
          const freshUserData = response.data.user || response.data;
          
          if (isValidUserData(freshUserData)) {
            setUser(freshUserData);
            localStorage.setItem('userData', JSON.stringify(freshUserData));
          } else {
            console.warn('AuthContext: Invalid user data from server, keeping cached data');
          }
        })
        .catch(error => {
          console.warn('AuthContext: Token verification failed:', error);
          
          // Check if it's a network error vs authentication error
          if (error.response) {
            console.log('AuthContext: Response error status:', error.response.status);
            if (error.response.status === 401) {
              // Token is invalid/expired - clear everything
              console.log('AuthContext: Token expired/invalid, clearing session');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              setUser(null);
              setIsLoggedIn(false);
            }
          } else {
            // Network error - keep user logged in with cached data
            console.log('AuthContext: Network error, keeping cached session');
          }
        });
    } else {
      console.log('AuthContext: No token or user data found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login for email:', credentials.email);
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      if (!isValidUserData(user) || !token) {
        console.error('AuthContext: Invalid response from server:', { user, token });
        throw new Error('Invalid response from server');
      }
      
      console.log('AuthContext: Login successful for user:', user.id);
      localStorage.setItem('authToken', token);
      // Fetch the latest user data from the backend and update context/localStorage
      await refreshUserData();
      setIsLoggedIn(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      
      // Handle different types of errors
      if (!error.response) {
        // Network error
        return { 
          success: false, 
          message: 'Network error. Please check your internet connection and try again.' 
        };
      }
      
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return { 
            success: false, 
            message: 'Invalid email or password. Please check your credentials and try again.' 
          };
        case 403:
          // Handle suspended and deactivated accounts
          if (data.error === 'Account deactivated') {
            return {
              success: false,
              message: data.restriction_details?.contact_info 
                ? `${data.message}\n\n${data.restriction_details.contact_info}`
                : data.message || 'Your account has been deactivated. Please contact support to reactivate your account.',
              accountStatus: 'deactivated',
              restrictionDetails: data.restriction_details
            };
          }
          if (data.error === 'Account suspended') {
            return {
              success: false,
              message: data.restriction_details?.contact_info 
                ? `${data.message}\n\n${data.restriction_details.contact_info}`
                : data.message || 'Your account has been suspended. Please contact support.',
              accountStatus: 'suspended',
              restrictionDetails: data.restriction_details
            };
          }
          return {
            success: false,
            message: data.restriction_details?.contact_info 
              ? `${data.message}\n\n${data.restriction_details.contact_info}`
              : data.message || 'Access denied. Please contact support.'
          };
        case 422:
          if (data.errors) {
            return { 
              success: false, 
              message: 'Please check your input and try again.',
              errors: data.errors 
            };
          }
          return { 
            success: false, 
            message: data.message || 'Please check your input and try again.' 
          };
        case 429:
          return { 
            success: false, 
            message: 'Too many login attempts. Please wait a moment and try again.' 
          };
        case 500:
          return { 
            success: false, 
            message: 'Server error. Please try again later.' 
          };
        case 503:
          return { 
            success: false, 
            message: 'Service temporarily unavailable. Please try again later.' 
          };
        default:
          return { 
            success: false, 
            message: data.message || 'An unexpected error occurred. Please try again.' 
          };
      }
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Attempting registration for email:', userData.email);
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      if (!isValidUserData(user) || !token) {
        console.error('AuthContext: Invalid response from server:', { user, token });
        throw new Error('Invalid response from server');
      }
      
      console.log('AuthContext: Registration successful for user:', user.id);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      setUser(user);
      setIsLoggedIn(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      
      // Handle different types of errors
      if (!error.response) {
        // Network error
        return { 
          success: false, 
          message: 'Network error. Please check your internet connection and try again.',
          errors: { general: ['Network error occurred'] }
        };
      }
      
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 422:
          if (data.errors) {
            // Backend validation errors
            const processedErrors = {};
            Object.keys(data.errors).forEach(key => {
              const errorArray = data.errors[key];
              processedErrors[key] = Array.isArray(errorArray) ? errorArray : [errorArray];
            });
            
            return { 
              success: false, 
              message: 'Please correct the errors and try again.',
              errors: processedErrors 
            };
          }
          return { 
            success: false, 
            message: data.message || 'Please check your input and try again.',
            errors: { general: [data.message || 'Validation failed'] }
          };
        case 429:
          return { 
            success: false, 
            message: 'Too many registration attempts. Please wait a moment and try again.',
            errors: { general: ['Too many attempts'] }
          };
        case 500:
          return { 
            success: false, 
            message: 'Server error. Please try again later.',
            errors: { general: ['Server error occurred'] }
          };
        case 503:
          return { 
            success: false, 
            message: 'Service temporarily unavailable. Please try again later.',
            errors: { general: ['Service unavailable'] }
          };
        default:
          return { 
            success: false, 
            message: data.message || 'Registration failed. Please try again.',
            errors: { general: [data.message || 'Registration failed'] }
          };
      }
    }
  };

  const logout = async () => {
    try {
      // Try to logout from the backend, but don't fail if it doesn't work
      await authAPI.logout();
      console.log('AuthContext: Successfully logged out from backend');
    } catch (error) {
      // Log the error but don't throw it - we'll still clear local session
      console.warn('AuthContext: Backend logout failed, but continuing with local logout:', error);
      
      // If it's a network error, we still want to logout locally
      if (!error.response || error.response.status >= 500) {
        console.log('AuthContext: Network/server error during logout - clearing local session');
      }
    } finally {
      // Always clear local session regardless of API success/failure
      console.log('AuthContext: Clearing local session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const freshUserData = response.data.user || response.data;
      
      if (isValidUserData(freshUserData)) {
        setUser(freshUserData);
        localStorage.setItem('userData', JSON.stringify(freshUserData));
        return freshUserData;
      } else {
        console.warn('Invalid user data received from server');
        return null;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      user, 
      setUser, 
      loading,
      login,
      register,
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
  