import React, { useState, useEffect } from "react";
import './Register.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import TermsModal from "../PrivacyPolicy/TermsModal";
import { useAuth } from "../../Context/AuthContext";

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
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Clear general error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setErrors({});

    const { name, email, password, password_confirmation, acceptTerms } = formData;

    // Client-side validation
    if (!name.trim() || !email.trim() || !password || !password_confirmation) {
      setErrorMessage("All fields must be completed before submitting the form.");
      setLoading(false);
      return;
    }
    
    if (password !== password_confirmation) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    if (!acceptTerms) {
      setErrorMessage("You must accept the terms and conditions to continue.");
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        name,
        email,
        password,
        password_confirmation
      });

      if (result.success) {
        navigate('/rental-section');
      } else {
        if (result.errors) {
          setErrors(result.errors);
          // Display first error as general message
          const firstError = Object.values(result.errors)[0];
          if (firstError && firstError[0]) {
            setErrorMessage(firstError[0]);
          }
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = () => {
      if (errorMessage) {
        setErrorMessage('');
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [errorMessage]);

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

        <form onSubmit={handleSubmit}>
          <div className="register-formFields">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="register-username"
              aria-label="Full Name"
              disabled={loading}
            />
            {errors.name && (
              <p className="register-field-error">{errors.name[0]}</p>
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="register-email"
              aria-label="Email"
              disabled={loading}
            />
            {errors.email && (
              <p className="register-field-error">{errors.email[0]}</p>
            )}

            <div className="register-pass">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="register-passwordInput"
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
            {errors.password && (
              <p className="register-field-error">{errors.password[0]}</p>
            )}

            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="register-cp"
              aria-label="Confirm Password"
              disabled={loading}
            />
          </div>

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

          <p className="register-error" style={{ minHeight: '1.5em' }}>
            {errorMessage}
          </p>

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
          onAccept={() => {
            setFormData({ ...formData, acceptTerms: true });
            setShowTermsModal(false);
          }}
          onClose={() => {
            setShowTermsModal(false);
          }}
        />
      )}
    </main>
  );
};

export default Register;
