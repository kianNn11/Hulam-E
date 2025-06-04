import React, { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';
import AlertMessage from "../Common/AlertMessage";

function Admin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Admin email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password is too short';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear alerts and field errors when user starts typing
    if (alert.show) setAlert({ show: false, type: '', message: '' });
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getErrorMessage = (error) => {
    // Network errors
    if (!error.response) {
      return 'Network error. Please check your internet connection and try again.';
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        return 'Invalid admin credentials. Please check your email and password.';
      case 403:
        return 'Access denied. Admin privileges required.';
      case 422:
        if (data.errors) {
          // Handle validation errors
          const firstError = Object.values(data.errors)[0];
          return Array.isArray(firstError) ? firstError[0] : firstError;
        }
        return data.message || 'Please check your input and try again.';
      case 429:
        return 'Too many login attempts. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return data.message || 'Login failed. Please check your credentials.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Please correct the errors below.');
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data.user && response.data.user.role === 'admin') {
        // Store the token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        showAlert('success', 'Admin login successful! Redirecting to dashboard...');
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        showAlert('error', 'Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage = getErrorMessage(error);
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScreenClick = (event) => {
      // If there's an alert showing, clear it
      if (alert.show) {
        setAlert({ show: false, type: '', message: '' });
      }
    };
  
    // Add event listener
    document.addEventListener("click", handleScreenClick);
  
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("click", handleScreenClick);
    };
  }, [alert.show]);

  const handleForgotPassword = () => {
    showAlert('info', 'Please contact the system administrator for password recovery assistance.');
  };

  return (
    <main className="admin-page">
      {/* Left section - Welcome */}
      <section className="admin-left">
        <h1 className="admin-heading">Hello Admin!</h1>
        <button className="admin-back-btn" onClick={() => window.history.back()}>Back</button>
      </section>

      {/* Right section - Login form */}
      <section className="admin-right">
        <h2 className="admin-title">Admin Login</h2>

        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-formFields">
            {/* Email input */}
            <div className="admin-input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Admin Email"
                className={`admin-username ${fieldErrors.email ? 'error' : ''}`}
                aria-label="Admin Email"
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="admin-field-error">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password input with toggleable visibility */}
            <div className="admin-input-container">
              <div className="admin-pass">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`admin-passwordInput ${fieldErrors.password ? 'error' : ''}`}
                  aria-label="Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="admin-eyeButton"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="admin-eyeIcon" />
                  ) : (
                    <EyeIcon className="admin-eyeIcon" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="admin-field-error">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot Password link */}
            <div className="admin-forgotPasswordContainer">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="admin-forgotPasswordLink"
                disabled={loading}>
                Forgot password?
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="admin-credentials-info">
          <strong>Default Admin Credentials:</strong><br />
          Email: admin@hulame.com<br />
          Password: admin123
        </div>
      </section>
    </main>
  );
}

export default Admin;