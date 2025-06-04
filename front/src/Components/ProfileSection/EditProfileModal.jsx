import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditProfileModal = ({ onClose, profileData, user, onSave, loading }) => {
  const [formData, setFormData] = useState({
    fullName: profileData?.fullName || user?.name || '',
    courseYear: profileData?.courseYear || user?.course_year || '',
    birthday: profileData?.birthday || user?.birthday || '',
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
      birthday: profileData?.birthday || user?.birthday || '',
      gender: profileData?.gender || user?.gender || '',
      socialLink: profileData?.socialLink || user?.social_link || '',
      contactNumber: profileData?.contactNumber || user?.contact_number || '',
      bio: profileData?.bio || user?.bio || '',
      profileImage: profileData?.profileImage || user?.profile_picture || null,
    });
    setImagePreview(profileData?.profileImage || user?.profile_picture || null);
  }, [profileData, user]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [name]: reader.result, // base64 string
        }));
        setImagePreview(reader.result);
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
    
    // Basic validation
    if (!formData.fullName.trim()) {
      alert('Full name is required');
      return;
    }
    
    if (formData.contactNumber && !/^[\d\-\+\(\)\s]+$/.test(formData.contactNumber)) {
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

          <div className="formRow">
            <label>
              Profile Image
              <input 
                type="file" 
                name="profileImage" 
                accept="image/*" 
                onChange={handleChange}
                disabled={loading}
              />
              <small>Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
            </label>
            {imagePreview && (
              <div className="imagePreview">
                <img src={imagePreview} alt="Profile preview" />
                <button 
                  type="button" 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, profileImage: null }));
                    setImagePreview(null);
                  }}
                  className="removeImageBtn"
                  disabled={loading}
                >
                  Remove Image
                </button>
              </div>
            )}
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