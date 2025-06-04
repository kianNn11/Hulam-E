import React, { useState, useEffect } from 'react';
import './Profile.css';
import { PencilSquareIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import StudentVerificationModal from './StudentVerificationModal';
import PostContent from './PostContent';
import EarningsContent from './EarningsSection';
import RentalManagement from './RentalManagement';
import { useAuth } from '../../Context/AuthContext';
import { userAPI } from '../../services/api';
import AlertMessage from '../Common/AlertMessage';

const Profile = () => {
  const location = useLocation();
  const { user, setUser, isLoggedIn } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Use user data from AuthContext instead of localStorage
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    courseYear: user?.course_year || '',
    birthday: user?.birthday || '',
    gender: user?.gender || '',
    socialLink: user?.social_link || '',
    contactNumber: user?.contact_number || '',
    bio: user?.bio || '',
    profileImage: user?.profile_picture || null,
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.name || '',
        courseYear: user.course_year || '',
        birthday: user.birthday || '',
        gender: user.gender || '',
        socialLink: user.social_link || '',
        contactNumber: user.contact_number || '',
        bio: user.bio || '',
        profileImage: user.profile_picture || null,
      });
    }
  }, [user]);

  const handleSave = async (data) => {
    if (!isLoggedIn) {
      showAlert('error', 'Please log in to update your profile');
      return;
    }

    // Check if user account is suspended (client-side check)
    if (user && user.verification_status === 'suspended') {
      showAlert('error', 'Account Suspended: You cannot update your profile while your account is suspended. Please contact support for assistance.');
      return;
    }

    // Check if user account is deactivated (client-side check)
    if (user && user.verification_status === 'inactive') {
      showAlert('error', 'Your account has been deactivated. Please contact support to reactivate your account.');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const updateData = {
        name: data.fullName,
        course_year: data.courseYear,
        birthday: data.birthday,
        gender: data.gender,
        social_link: data.socialLink,
        contact_number: data.contactNumber,
        bio: data.bio,
        profile_picture: data.profileImage,
      };

      // Remove empty values to avoid validation errors
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });

      console.log('Sending update data:', {
        ...updateData,
        profile_picture: updateData.profile_picture ? 
          `[Base64 Image - ${updateData.profile_picture.length} chars]` : 
          'null'
      });

      // Call API to update profile
      const response = await userAPI.updateProfile(updateData);
      
      console.log('API Response:', response.data);
      
      if (response.data.success || response.data.user) {
        // Get the updated user data from response
        const returnedUser = response.data.user;
        
        console.log('Returned user profile_picture:', returnedUser?.profile_picture ? 
          `[${returnedUser.profile_picture.length} chars]` : 'null');
        
        // Update local profileData state with the form data (immediate update)
        const updatedProfileData = {
          fullName: data.fullName,
          courseYear: data.courseYear,
          birthday: data.birthday,
          gender: data.gender,
          socialLink: data.socialLink,
          contactNumber: data.contactNumber,
          bio: data.bio,
          // Use the returned profile picture if available, otherwise use the submitted one
          profileImage: returnedUser?.profile_picture || data.profileImage
        };
        
        console.log('Setting profile data:', {
          ...updatedProfileData,
          profileImage: updatedProfileData.profileImage ? 
            `[${updatedProfileData.profileImage.length} chars]` : 'null'
        });
        
        setProfileData(updatedProfileData);
        
        // Update user in AuthContext - ensure proper field mapping
        const updatedUser = {
          ...user,
          ...returnedUser,
          // Ensure profile_picture is properly set
          profile_picture: returnedUser?.profile_picture || data.profileImage
        };
        
        console.log('Setting user data:', {
          ...updatedUser,
          profile_picture: updatedUser.profile_picture ? 
            `[${updatedUser.profile_picture.length} chars]` : 'null'
        });
        
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        showAlert('success', 'Profile updated successfully!');
        setIsModalOpen(false);
        
        // Force re-render by updating state
        setProfileData(prev => ({ ...prev }));
        
      } else {
        throw new Error('Profile update failed - no success response');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle different types of errors with detailed messages
      if (error.response?.status === 403) {
        const data = error.response.data;
        
        // Handle suspended account with detailed restrictions
        if (data.error === 'Account suspended' || error.restrictionDetails?.type === 'suspended') {
          const details = error.restrictionDetails || data.restriction_details || {};
          const actionMessage = details.blocked_action || details.blockedAction || 'updating your profile';
          const contactInfo = details.contact_info || details.contactInfo || 'Please contact support for assistance.';
          
          showAlert('error', 
            `Account Suspended: You cannot perform this action (${actionMessage}). ${contactInfo}`
          );
        } else if (data.error === 'Account deactivated') {
          showAlert('error', 'Your account has been deactivated. Please contact support to reactivate your account.');
        } else {
          showAlert('error', data.message || 'You do not have permission to update your profile.');
        }
      } else if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          showAlert('error', `Validation Error: ${errorMessage}`);
        } else {
          showAlert('error', errorData.message || 'Please check your input and try again.');
        }
      } else if (!error.response) {
        showAlert('error', 'Network error. Please check your internet connection and try again.');
      } else {
        showAlert('error', error.response?.data?.message || error.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVerificationModal = () => {
    setIsVerificationModalOpen(false);
  };

  const handleVerificationButtonClick = () => {
    if (!user) return;

    if (user.verified) {
      // Already verified - show verified message
      setShowVerificationMessage(true);
      setTimeout(() => setShowVerificationMessage(false), 3000);
    } else if (user.verification_status === 'pending') {
      // Verification pending - show pending message
      setShowVerificationMessage(true);
      setTimeout(() => setShowVerificationMessage(false), 5000);
    } else {
      // Unverified (includes 'unverified', null, undefined, or any other status) - open upload modal
      setIsVerificationModalOpen(true);
    }
  };

  const handleUpload = async (file) => {
    if (!isLoggedIn || !user) {
      showAlert('error', 'Please log in to submit verification documents');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('verificationData', JSON.stringify({
        fileName: file.name,
        submittedAt: new Date().toISOString()
      }));
      formData.append('document', file);

      // Call the verification API
      const response = await userAPI.verifyStudent(formData);
      
      if (response.data.success) {
        showAlert('success', 'Verification document submitted successfully! Your request is now pending admin review.');
        
        // Update user verification status in context
        const updatedUser = { 
          ...user, 
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        showAlert('error', 'Failed to submit verification document. Please try again.');
      }
    } catch (error) {
      console.error('Verification submission error:', error);
      showAlert('error', error.response?.data?.error || error.response?.data?.message || 'Failed to submit verification document. Please try again.');
    } finally {
      setLoading(false);
      setIsVerificationModalOpen(false);
    }
  };

  const activeTab = (() => {
    switch (location.pathname) {
      case '/profile': return 'post';
      case '/earnings': return 'earnings';
      case '/rental-management': return 'rentals';
      default: return '';
    }
  })();

  // Show login message if not authenticated
  if (!isLoggedIn) {
    return (
      <main className='profile'>
        <div className="profile-login-message">
          <h2>Please log in to view your profile</h2>
          <Link to="/login" className="login-link">Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className='profile'>
      {alert.show && (
        <AlertMessage 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ show: false, type: '', message: '' })}
          className="fixed-alert"
        />
      )}
      
      <section className="profile-section">
        <div className="profile-background">
          <div className="profile-header" />

          <div className="profile-name-container">
            <div className="icon-and-name-wrapper">
              <div className="profile-image-section">
                <div 
                  className="profile-image-container"
                  onClick={() => setIsModalOpen(true)}
                  title="Click to change profile picture"
                >
                  {profileData.profileImage ? (
                    <div className="profile-image-wrapper">
                      <img
                        src={profileData.profileImage.startsWith('/storage/') 
                          ? `http://localhost:8000${profileData.profileImage}`
                          : profileData.profileImage
                        }
                        alt="Profile"
                        className="profile-image"
                      />
                    </div>
                  ) : (
                    <UserCircleIcon className="profile-default-icon" />
                  )}
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="profile-edit-button"
                  disabled={loading}
                  title="Edit Profile"
                >
                  <PencilSquareIcon className='edit-icon' />
                </button>
              </div>

              <div className="profile-name-section">
                <h1 className="profile-name">{profileData.fullName || user?.name || 'Your Name'}</h1>
                <p className="profile-course">{profileData.courseYear || 'Course & Year'}</p>
                <div className="profile-verification-status">
                  {user?.verified ? (
                    <div className="verification-status-container">
                      <span className="verification-verified">✓ Verified Student</span>
                      {showVerificationMessage && (
                        <div className="verification-message verified-message">
                          You are a verified student! 🎉
                        </div>
                      )}
                    </div>
                  ) : user?.verification_status === 'pending' ? (
                    <div className="verification-status-container">
                      <button 
                        className="verification-pending-button"
                        onClick={handleVerificationButtonClick}
                        disabled={loading}
                      >
                        ⏳ Verification Pending
                      </button>
                      {showVerificationMessage && (
                        <div className="verification-message pending-message">
                          Your verification is in progress. Please wait for the admin to confirm it.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="verification-status-container">
                      <button 
                        className="verification-button unverified"
                        onClick={handleVerificationButtonClick}
                        disabled={loading}
                      >
                        📋 Verify Student Status
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-nav">
            <Link 
              to="/profile" 
              className={`profile-tab ${activeTab === 'post' ? 'active' : ''}`}
            >
              Post
            </Link>
            <Link 
              to="/earnings" 
              className={`profile-tab ${activeTab === 'earnings' ? 'active' : ''}`}
            >
              Earnings
            </Link>
            <Link 
              to="/rental-management" 
              className={`profile-tab ${activeTab === 'rentals' ? 'active' : ''}`}
            >
              Rentals
            </Link>
          </div>

          {activeTab === 'post' && <PostContent profileData={profileData} user={user} />}
          {activeTab === 'earnings' && <EarningsContent />}
          {activeTab === 'rentals' && <RentalManagement />}
        </div>
      </section>

      {isModalOpen && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          profileData={profileData}
          user={user}
          loading={loading}
        />
      )}

      {isVerificationModalOpen && (
        <StudentVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={handleCloseVerificationModal}
          onUpload={handleUpload}
          loading={loading}
        />
      )}
    </main>
  );
};

export default Profile;