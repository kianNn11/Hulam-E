import owl from '../Assets/owl.png';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import './Post.css'
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { rentalAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Post = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    description: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.price || !formData.location.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('location', formData.location.trim());
      
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      const response = await rentalAPI.createRental(submitData);
      
      setSuccess('Post created successfully! Your item is now available for rent.');
      
      // Reset form
      setFormData({
        title: "",
        price: "",
        location: "",
        description: ""
      });
      setSelectedImage(null);
      setImagePreview(null);

      // Redirect to rental section after a short delay
      setTimeout(() => {
        navigate('/rental-section');
      }, 2000);

    } catch (err) {
      console.error('Error creating post:', err);
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        setError(firstError[0] || 'Failed to create post. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to create post. Please try again.');
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
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError(''); // Clear any previous errors
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <section className="rentalPostUp">
      <div className="post-header">
        <div className="post-logo">
          <img src={owl} alt="Create post icon" className="post-img"/>
          <h1 className="createaPost">Create a Post</h1>
        </div>
      </div>

      {error && (
        <div className="post-error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="post-success-message">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='post-form'>
        <div className="post-div3">
          <div className="post-div4">
            <div className="post-column">
              <div className="post-image">
                <div className="post-div5">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button type="button" onClick={removeImage} className="remove-image-btn">
                        <XMarkIcon className="remove-icon" />
                      </button>
                      <p className="image-preview-text">Image selected successfully!</p>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="imageUpload" className="frame-post">
                        <CloudArrowUpIcon className="upload-icon" aria-label="Upload icon" />
                      </label>
                      <p className="upload1Photoonly">Upload 1 photo only</p>
                    </>
                  )}
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    aria-label="Upload image"
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