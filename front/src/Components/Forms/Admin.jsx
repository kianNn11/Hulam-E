import React, { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.user && response.data.user.role === 'admin') {
        // Store the token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        alert("Admin Login Successful!");
        navigate("/dashboard");
      } else {
        setError("Access denied. Admin privileges required.");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScreenClick = (event) => {
      // If there's an error showing, clear it
      if (error) {
        setError("");
      }
    };
  
    // Add event listener
    document.addEventListener("click", handleScreenClick);
  
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("click", handleScreenClick);
    };
  }, [error]);

  const handleForgotPassword = () => {
    alert("Please contact system administrator for password recovery.");
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

        <form onSubmit={handleSubmit}>
          <div className="admin-formFields">
            {/* Email input */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Admin Email"
              className="admin-username"
              aria-label="Email"
              required
            />

            {/* Password input with toggleable visibility */}
            <div className="admin-pass">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="admin-passwordInput"
                aria-label="Password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="admin-eyeButton"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="admin-eyeIcon" />
                ) : (
                  <EyeIcon className="admin-eyeIcon" />
                )}
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <p className="admin-errorMessage">
                {error}
              </p>
            )}

            {/* Forgot Password link */}
            <div className="admin-forgotPasswordContainer">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="admin-forgotPasswordLink">
                Forgot password?
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '12px' }}>
          <strong>Default Admin Credentials:</strong><br />
          Email: admin@hulame.com<br />
          Password: admin123
        </div>
      </section>
    </main>
  );
}

export default Admin;