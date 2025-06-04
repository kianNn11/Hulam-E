import React, { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom'; 
import './Login.css'
import { useAuth } from "../../Context/AuthContext";
import AlertMessage from "../Common/AlertMessage";

const ForgotPasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleChange = (e) => {
    setAlert({ show: false, type: '', message: '' });
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const { username, newPassword, confirmPassword } = formData;

    if (!username.trim()) {
      showAlert('error', 'Username is required.');
      return false;
    }
    
    if (!newPassword) {
      showAlert('error', 'New password is required.');
      return false;
    }
    
    if (newPassword.length < 8) {
      showAlert('error', 'Password must be at least 8 characters long.');
      return false;
    }
    
    if (!confirmPassword) {
      showAlert('error', 'Please confirm your new password.');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      showAlert('error', 'Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { username, newPassword } = formData;
    const savedUserData = JSON.parse(localStorage.getItem('userData'));
    
    if (!savedUserData || savedUserData.username !== username) {
      showAlert('error', 'Username not found. Please check your username.');
      return;
    }

    // Update password in localStorage
    const updatedUserData = { ...savedUserData, password: newPassword };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));

    showAlert('success', 'Password updated successfully! You can now login.');
    setFormData({ username: '', newPassword: '', confirmPassword: '' });

    // Close modal after delay
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <h2>Reset Password</h2>
        
        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            autoFocus
          />
          <div className="modal-password-field-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              className="modal-password-input"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="modal-eye-button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="modal-eye-icon" />
              ) : (
                <EyeIcon className="modal-eye-icon" />
              )}
            </button>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="modal-password-input"
          />

          <div className="modal-buttons">
            <button type="submit" className="modal-submit-btn">Update Password</button>
            <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
      errors.email = 'Email is required';
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
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
        return 'Invalid email or password. Please check your credentials and try again.';
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
        return data.message || 'An unexpected error occurred. Please try again.';
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
      const result = await login(formData);
      
      if (result.success) {
        showAlert('success', 'Login successful! Redirecting...');
        setTimeout(() => navigate('/rental-section'), 1000);
      } else {
        const errorMessage = result.message || 'Login failed. Please try again.';
        showAlert('error', errorMessage);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showAlert('error', errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScreenClick = () => {
      if (alert.show) setAlert({ show: false, type: '', message: '' });
    };
    document.addEventListener('click', handleScreenClick);
    return () => document.removeEventListener('click', handleScreenClick);
  }, [alert.show]);

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  return (
    <main className='login-page'>
      <section className="login-left-side">
        <h1 className='login-greetings'>Welcome Back!</h1>
        <p className="login-question">Don't have an account?</p>
        <Link to="/register">
          <button className='login-reg-btn'>Register</button>
        </Link>
      </section>

      <section className="login-logo-container">
        <p className="login-login-title">Login</p>

        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="formFields">
            <div className="login-input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`login-username ${fieldErrors.email ? 'error' : ''}`}
                aria-label="Email"
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="login-field-error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="login-input-container">
              <div className='login-password'>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`login-passwordInput ${fieldErrors.password ? 'error' : ''}`}
                  aria-label="Password"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className='login-eyeButton'
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className='login-eyeIcon' />
                  ) : (
                    <EyeIcon className='login-eyeIcon' />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="login-field-error">{fieldErrors.password}</p>
              )}
            </div>

            <div className="forgotPasswordContainer">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="login-forgotPasswordLink"
                disabled={loading}>
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className='login-login-btn'
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="login-adminButtonContainer">
          <Link to="/admin">
            <button className="login-adminButton" aria-label="Admin access">
              {/* SVG Admin Button */}
              <svg width="128" height="44" viewBox="0 0 128 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="127" height="43" rx="21.5" fill="white" stroke="#E5E7EB" />
                <path fillRule="evenodd" clipRule="evenodd" d="M32 19.6C33.364 19.6 34.6721 19.0943 35.6365 18.1941C36.601 17.2939 37.1429 16.073 37.1429 14.8C37.1429 13.527 36.601 12.3061 35.6365 11.4059C34.6721 10.5057 33.364 10 32 10C30.636 10 29.3279 10.5057 28.3635 11.4059C27.399 12.3061 26.8571 13.527 26.8571 14.8C26.8571 16.073 27.399 17.2939 28.3635 18.1941C29.3279 19.0943 30.636 19.6 32 19.6ZM20 34C20 32.5292 20.3104 31.0728 20.9134 29.7139C21.5165 28.3551 22.4004 27.1204 23.5147 26.0804C24.629 25.0404 25.9519 24.2154 27.4078 23.6525C28.8637 23.0897 30.4241 22.8 32 22.8C33.5759 22.8 35.1363 23.0897 36.5922 23.6525C38.0481 24.2154 39.371 25.0404 40.4853 26.0804C41.5996 27.1204 42.4835 28.3551 43.0866 29.7139C43.6896 31.0728 44 32.5292 44 34H20Z" fill="black" />
                <text fill="black" style={{ whiteSpace: "pre" }} fontFamily="Poppins" fontSize="16" fontWeight="500" letterSpacing="0em">
                  <tspan x="54" y="27.6">Admin</tspan>
                </text>
              </svg>
            </button>
          </Link>
        </div>

      </section>

      {showForgotPasswordModal && (
        <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />
      )}
    </main>
  )
}

export default Login;