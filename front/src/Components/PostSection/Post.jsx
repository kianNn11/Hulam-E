import owl from '../Assets/owl.png';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import './Post.css'
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { rentalAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../Common/AlertMessage';

const Post = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    description: ""
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Post submission attempt:', {
      user: user,
      isAuthenticated: !!user,
      token: localStorage.getItem('authToken') ? 'present' : 'missing',
      formData: formData,
      hasImage: !!selectedImages.length
    });
    
    if (!user) {
      showAlert('error', 'You must be logged in to create a post.');
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.price || !formData.location.trim() || !formData.description.trim()) {
      showAlert('error', 'Please fill in all required fields.');
      return;
    }

    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      showAlert('error', 'Please enter a valid price.');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('location', formData.location.trim());
      
      // Multi-image upload
      selectedImages.forEach(img => submitData.append('images[]', img));

      await rentalAPI.createRental(submitData);
      
      // Show success card instead of alert
      setShowSuccessCard(true);
      
      // Reset form
      setFormData({
        title: "",
        price: "",
        location: "",
        description: ""
      });
      setSelectedImages([]);
      setImagePreviews([]);

    } catch (error) {
      console.error('Error creating rental:', error);
      
      // Handle different types of errors
      if (error.response?.status === 403) {
        const data = error.response.data;
        
        // Handle suspended account with detailed restrictions
        if (data.error === 'Account suspended' || error.restrictionDetails?.type === 'suspended') {
          const details = error.restrictionDetails || data.restriction_details || {};
          const actionMessage = details.blocked_action || details.blockedAction || 'posting items';
          const contactInfo = details.contact_info || details.contactInfo || 'Please contact support for assistance.';
          
          showAlert('error', 
            `Account Suspended: You cannot perform this action (${actionMessage}). ${contactInfo}`
          );
        } else if (data.error === 'Account deactivated') {
          showAlert('error', 'Your account has been deactivated. Please contact support to reactivate your account.');
        } else {
          showAlert('error', data.message || 'You do not have permission to perform this action.');
        }
      } else if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          showAlert('error', errorMessage);
        } else {
          showAlert('error', errorData.message || 'Please check your input and try again.');
        }
      } else if (!error.response) {
        showAlert('error', 'Network error. Please check your internet connection and try again.');
      } else {
        showAlert('error', 'Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear alert when user starts typing
    if (alert.show) setAlert({ show: false, type: '', message: '' });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 15 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      showAlert('error', 'Some files were not valid images or exceeded 15MB.');
    }
    setSelectedImages(prev => [...prev, ...validFiles]);
    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) fileInput.value = '';
  };

  const handleViewPosts = () => {
    navigate('/profile');
  };

  if (showSuccessCard) {
    return (
      <section className="rentalPostUp">
        <div className="post-success-card">
          <div className="success-icon">✅</div>
          <h2>Post Created Successfully!</h2>
          <p>Your item is now available for rent and will appear in the rental section.</p>
          <div className="success-actions">
            <button 
              onClick={handleViewPosts} 
              className="view-posts-btn"
            >
              View Here
            </button>
            <button 
              onClick={() => setShowSuccessCard(false)} 
              className="create-another-btn"
            >
              Create Another Post
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rentalPostUp">
      <div className="post-header">
        <div className="post-logo">
          <img src={owl} alt="Create post icon" className="post-img"/>
          <h1 className="createaPost">Create a Post</h1>
        </div>
      </div>

      {alert.show && (
        <AlertMessage 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ show: false, type: '', message: '' })}
        />
      )}

      <form onSubmit={handleSubmit} className='post-form'>
        <div className="post-div3">
          <div className="post-div4">
            <div className="post-column">
              <div className="post-image">
                <div className="post-div5">
                  {imagePreviews.length > 0 ? (
                    <div className="image-preview-container-multi">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="image-preview-wrapper">
                          <img src={src} alt={`Preview ${idx+1}`} className="image-preview" />
                          <button type="button" onClick={() => removeImage(idx)} className="remove-image-btn">
                            <XMarkIcon className="remove-icon" />
                          </button>
                        </div>
                      ))}
                      <p className="image-preview-text">{imagePreviews.length} image(s) selected</p>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="imageUpload" className="frame-post">
                        <CloudArrowUpIcon className="upload-icon" aria-label="Upload icon" />
                      </label>
                      <p className="upload1Photoonly">Upload Image</p>
                    </>
                  )}
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    aria-label="Upload images"
                    multiple
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <div className="post-column2">
              <div className="post-div6">
                
                <div className="floating-input">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="post-formInput"
                    placeholder=" "
                    disabled={loading}
                  />
                  <label htmlFor="title">
                    Name of the Material <span className="requiredField">*</span>
                  </label>
                </div>

                <div className="floating-input">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="formInput"
                    placeholder=" "
                    min="0.01"
                    step="0.01"
                    disabled={loading}
                  />
                  <label htmlFor="price">
                    Price (₱) <span className="requiredField">*</span>
                  </label>
                </div>

                <div className="floating-input">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="formInput"
                    placeholder=" "
                    disabled={loading}
                  />
                  <label htmlFor="location">
                    Pickup Location <span className="requiredField">*</span>
                  </label>
                </div>

                <div className="floating-input">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="formInput"
                    placeholder=" "
                    rows="4"
                    disabled={loading}
                  />
                  <label htmlFor="description">
                    Description <span className="requiredField">*</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button 
          type="submit" 
          className="post-btn" 
          aria-label="Post rental item"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </section>
  )
}

export default Post