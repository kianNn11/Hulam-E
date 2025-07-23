import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditProfileModal = ({ onClose, profileData, user, onSave, loading }) => {
  // Debug logging for data prefilling
  console.log('EditProfileModal props:', {
    profileData,
    user: user ? {
      name: user.name,
      course_year: user.course_year,
      birthday: user.birthday,
      gender: user.gender,
      social_link: user.social_link,
      contact_number: user.contact_number,
      bio: user.bio,
      profile_picture: user.profile_picture ? '[Image Data]' : null
    } : null
  });

  // Helper function to convert datetime to date format for input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
      // Handle both datetime strings and date-only strings
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      // Return in YYYY-MM-DD format required by HTML date input
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    fullName: profileData?.fullName || user?.name || '',
    courseYear: profileData?.courseYear || user?.course_year || '',
    birthday: formatDateForInput(profileData?.birthday || user?.birthday),
    gender: profileData?.gender || user?.gender || '',
    socialLink: profileData?.socialLink || user?.social_link || '',
    contactNumber: profileData?.contactNumber || user?.contact_number || '',
    bio: profileData?.bio || user?.bio || '',
    profileImage: profileData?.profileImage || user?.profile_picture || null,
  });

  const [imagePreview, setImagePreview] = useState(formData.profileImage);

  useEffect(() => {
    setFormData({
      fullName: profileData?.fullName || user?.name || '',
      courseYear: profileData?.courseYear || user?.course_year || '',
      birthday: formatDateForInput(profileData?.birthday || user?.birthday),
      gender: profileData?.gender || user?.gender || '',
      socialLink: profileData?.socialLink || user?.social_link || '',
      contactNumber: profileData?.contactNumber || user?.contact_number || '',
      bio: profileData?.bio || user?.bio || '',
      profileImage: profileData?.profileImage || user?.profile_picture || null,
    });
    
    // Set image preview, converting server paths to full URLs
    const imageSource = profileData?.profileImage || user?.profile_picture;
    if (imageSource) {
      const previewSrc = imageSource.startsWith('/storage/') 
        ? `http://localhost:8000${imageSource}`
        : imageSource;
      setImagePreview(previewSrc);
    } else {
      setImagePreview(null);
    }
  }, [profileData, user]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (!file) return;

      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validate file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        alert('File size must be less than 15MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Result = reader.result;
        console.log('Image converted to base64:', {
          size: base64Result.length,
          preview: base64Result.substring(0, 50) + '...'
        });
        
        setFormData((prev) => ({
          ...prev,
          [name]: base64Result, // base64 string
        }));
        setImagePreview(base64Result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submission data:', {
      ...formData,
      profileImage: formData.profileImage ? 
        `[Base64 Image - ${formData.profileImage.length} chars]` : 
        'null'
    });
    
    // Basic validation
    if (!formData.fullName.trim()) {
      alert('Full name is required');
      return;
    }
    
    if (formData.contactNumber && !/^[\d\-+() ]+$/.test(formData.contactNumber)) {
      alert('Please enter a valid contact number');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Edit Profile</h2>
          <div className="tooltipWrapper">
            <button className="modalCloseBtn" onClick={onClose} disabled={loading}>
              <XMarkIcon className="closeIcon" />
              <span className="tooltipText">Close</span>
            </button>
          </div>
        </div>

        <form className="editForm" onSubmit={handleSubmit}>
          <div className="formRow">
            <label>
              Full Name *
              <input 
                name="fullName" 
                type="text" 
                value={formData.fullName} 
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>
          </div>

          <div className="formRow">
            <label>
              Course & Year Level
              <input 
                name="courseYear" 
                type="text" 
                value={formData.courseYear} 
                onChange={handleChange}
                placeholder="e.g., Computer Science - 3rd Year"
                disabled={loading}
              />
            </label>
          </div>

          <div className="formRow">
            <label>
              Birthday
              <input 
                name="birthday" 
                type="date" 
                value={formData.birthday} 
                onChange={handleChange}
                disabled={loading}
              />
            </label>
            <label>
              Gender
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <div className="formRow">
            <label>
              Contact Number
              <input 
                name="contactNumber" 
                type="tel" 
                value={formData.contactNumber} 
                onChange={handleChange}
                placeholder="e.g., +63 912 345 6789"
                disabled={loading}
              />
            </label>
          </div>

          <div className="formRow">
            <label>
              Social Link
              <input 
                name="socialLink" 
                type="url" 
                value={formData.socialLink} 
                onChange={handleChange}
                placeholder="https://facebook.com/yourprofile"
                disabled={loading}
              />
            </label>
          </div>

          <div className="formRow">
            <label>
              Bio
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={500}
                disabled={loading}
              />
              <small className="charCount">{formData.bio.length}/500 characters</small>
            </label>
          </div>

          <div className="formRow profileImageRow">
            <label className="profileImageLabel">
              Profile Image
              <div 
                className="profileImageUploadArea"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('dragOver');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('dragOver');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('dragOver');
                  
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const file = files[0];
                    const mockEvent = {
                      target: {
                        name: 'profileImage',
                        type: 'file',
                        files: [file]
                      }
                    };
                    handleChange(mockEvent);
                  }
                }}
              >
                {imagePreview ? (
                  <div className="currentImagePreview">
                    <img 
                      src={imagePreview} 
                      alt="Profile preview"
                      onError={(e) => {
                        console.error('Image preview failed to load:', imagePreview);
                        // Fall back to a default or hide the image
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="imageActions">
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('profileImageInput').click()}
                        className="changeImageBtn"
                        disabled={loading}
                      >
                        Change Image
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profileImage: null }));
                          setImagePreview(null);
                        }}
                        className="removeImageBtn"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="uploadPrompt"
                    onClick={() => document.getElementById('profileImageInput').click()}
                  >
                    <div className="uploadIcon">📸</div>
                    <p className="uploadText">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="uploadSubtext">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <input 
                  id="profileImageInput"
                  type="file" 
                  name="profileImage" 
                  accept="image/*" 
                  onChange={handleChange}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </div>
            </label>
          </div>

          <div className="modalButtons">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="cancelBtn" disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;