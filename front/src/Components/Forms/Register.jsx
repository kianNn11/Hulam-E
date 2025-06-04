import React, { useState, useEffect } from "react";
import './Register.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import TermsModal from "../PrivacyPolicy/TermsModal";
import { useAuth } from "../../Context/AuthContext";
import AlertMessage from "../Common/AlertMessage";

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordChecks = validatePassword(formData.password);
      if (!passwordChecks.minLength) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!passwordChecks.hasUpperCase || !passwordChecks.hasLowerCase) {
        errors.password = 'Password must contain both uppercase and lowercase letters';
      } else if (!passwordChecks.hasNumber) {
        errors.password = 'Password must contain at least one number';
      }
    }
    
    // Password confirmation validation
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    // Terms validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Clear general alert message
    if (alert.show) {
      setAlert({ show: false, type: '', message: '' });
    }
  };

  const getErrorMessage = (error) => {
    // Network errors
    if (!error.response) {
      return 'Network error. Please check your internet connection and try again.';
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 422:
        if (data.errors) {
          // Handle specific validation errors
          if (data.errors.email) {
            return 'This email is already registered. Please use a different email or try logging in.';
          }
          if (data.errors.password) {
            return Array.isArray(data.errors.password) ? data.errors.password[0] : data.errors.password;
          }
          // Get first error message
          const firstError = Object.values(data.errors)[0];
          return Array.isArray(firstError) ? firstError[0] : firstError;
        }
        return data.message || 'Please check your input and try again.';
      case 429:
        return 'Too many registration attempts. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return data.message || 'Registration failed. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Please correct the errors below before submitting.');
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    const { name, email, password, password_confirmation } = formData;

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation
      });

      if (result.success) {
        showAlert('success', 'Registration successful! Redirecting...');
        setTimeout(() => navigate('/rental-section'), 1500);
      } else {
        if (result.errors) {
          // Handle backend validation errors
          const backendErrors = {};
          Object.keys(result.errors).forEach(key => {
            const errorArray = result.errors[key];
            backendErrors[key] = Array.isArray(errorArray) ? errorArray[0] : errorArray;
          });
          setFieldErrors(backendErrors);
          
          // Show specific error message
          if (result.errors.email) {
            showAlert('error', 'This email is already registered. Please use a different email or try logging in.');
          } else {
            const firstError = Object.values(result.errors)[0];
            const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            showAlert('error', errorMessage);
          }
        } else {
          showAlert('error', 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      showAlert('error', errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = () => {
      if (alert.show) {
        setAlert({ show: false, type: '', message: '' });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [alert.show]);

  const handleTermsAcceptance = () => {
    setFormData({ ...formData, acceptTerms: true });
    setShowTermsModal(false);
    if (fieldErrors.acceptTerms) {
      setFieldErrors(prev => ({ ...prev, acceptTerms: undefined }));
    }
  };

  return (
    <main className="register-page">
      <section className="register-left">
        <p className="register-greetings">Hello, Welcome!</p>
        <p className="register-question">Already have an account?</p>
        <Link to="/login">
          <button className="register-login-btn">Login</button>
        </Link>
      </section>

      <section className="register-form">
        <p className="register-title">Register</p>

        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-formFields">
            <div className="register-input-container">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className={`register-username ${fieldErrors.name ? 'error' : ''}`}
                aria-label="Full Name"
                disabled={loading}
              />
              {fieldErrors.name && (
                <p className="register-field-error">{fieldErrors.name}</p>
              )}
            </div>

            <div className="register-input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`register-email ${fieldErrors.email ? 'error' : ''}`}
                aria-label="Email"
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="register-field-error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="register-input-container">
              <div className="register-pass">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`register-passwordInput ${fieldErrors.password ? 'error' : ''}`}
                  aria-label="Password"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="register-eyeButton" 
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (<EyeSlashIcon className="register-eyeIcon" />) :
                  (<EyeIcon className="register-eyeIcon" />)}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="register-field-error">{fieldErrors.password}</p>
              )}
            </div>

            <div className="register-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`register-cp ${fieldErrors.password_confirmation ? 'error' : ''}`}
                aria-label="Confirm Password"
                disabled={loading}
              />
              {fieldErrors.password_confirmation && (
                <p className="register-field-error">{fieldErrors.password_confirmation}</p>
              )}
            </div>
          </div>

          <div className="register-terms-container">
            <label className="register-terms">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setFormData({ ...formData, acceptTerms: false });
                  } else {
                    e.preventDefault(); // Prevent auto-check
                    setShowTermsModal(true);
                  }
                }}
                className="register-text"
                aria-label="Accept terms and conditions"
                disabled={loading}
              />
              <span className="register-text2">
                I agree to the Terms and Conditions
              </span>
            </label>
            {fieldErrors.acceptTerms && (
              <p className="register-field-error">{fieldErrors.acceptTerms}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="register-register-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

        </form>

        <div className="register-adminButtonContainer">
          <Link to="/admin">
            <button className="register-adminButton" aria-label="Admin access">
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

      {showTermsModal && (
        <TermsModal 
          onClose={() => setShowTermsModal(false)} 
          onAccept={handleTermsAcceptance}
        />
      )}
    </main>
  );
};

export default Register;
