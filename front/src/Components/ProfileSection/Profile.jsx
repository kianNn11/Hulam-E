import React, { useState, useEffect } from 'react';
import './Profile.css';
import { PencilSquareIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import StudentVerificationModal from './StudentVerificationModal';
import PostContent from './PostContent';
import EarningsContent from './EarningsSection';
import { useAuth } from '../../Context/AuthContext';
import { userAPI } from '../../services/api';

const Profile = () => {
  const location = useLocation();
  const { user, setUser, isLoggedIn } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerificationClicked, setIsVerificationClicked] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      alert('Please log in to update your profile');
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

      // Call API to update profile
      const response = await userAPI.updateProfile(updateData);
      
      if (response.data.success || response.data.user) {
        // Update local state
        setProfileData(data);
        
        // Update user in AuthContext
        const updatedUser = response.data.user || { ...user, ...updateData };
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        alert('Profile updated successfully!');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVerificationModal = () => {
    setIsVerificationClicked(false);
    setIsVerificationModalOpen(false);
  };

  const handleUpload = async (file) => {
    if (!isLoggedIn || !user) {
      alert('Please log in to submit verification documents');
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
        alert('Verification document submitted successfully! Your request is now pending admin review.');
        
        // Update user verification status in context
        const updatedUser = { 
          ...user, 
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        alert('Failed to submit verification document. Please try again.');
      }
    } catch (error) {
      console.error('Verification submission error:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to submit verification document. Please try again.');
    } finally {
      setLoading(false);
      setIsVerificationModalOpen(false);
      setIsVerificationClicked(false);
    }
  };

  const activeTab = (() => {
    switch (location.pathname) {
      case '/profile': return 'post';
      case '/earnings': return 'earnings';
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
      <section className="profile-section">
        <div className="profile-background">
          <div className="profile-header" />

          <div className="profile-name-container">
            <button
              onClick={() => setIsModalOpen(true)}
              className="profile-edit-profile-button"
              disabled={loading}
            >
              <PencilSquareIcon className='profile-editIcon' />
            </button>

            <div className="icon-and-name-wrapper">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="profile-userImage"
                />
              ) : (
                <UserCircleIcon className="profile-userIcon" />
              )}

              <div className="name-verification-row">
                <h1 className="profile-name">{profileData.fullName || user?.name || "Your Name"}</h1>
                <p
                  className={`profile-verificationStatus ${isVerificationClicked ? 'clicked' : ''} ${user?.verified ? 'verified' : 'unverified'}`}
                  onClick={() => {
                    if (!user?.verified) {
                      setIsVerificationClicked(true);
                      setIsVerificationModalOpen(true);
                    }
                  }}
                >
                  {user?.verified ? '✓ Verified' : '*Unverified'}
                </p>
              </div>
            </div>
          </div>

          {/* Bio section */}
          {profileData.bio && (
            <div className="profile-bio">
              <p>{profileData.bio}</p>
            </div>
          )}
        </div>

        <nav className="profile-profileNavigation">
          <ul className="profile-nav-items">
            <li>
              <Link to="/profile" className={`profile-navItem ${activeTab === 'post' ? 'active' : ''}`}>
                Post
              </Link>
            </li>
            <li>
              <Link to="/earnings" className={`profile-navItem ${activeTab === 'earnings' ? 'active' : ''}`}>
                Earnings
              </Link>
            </li>
          </ul>
        </nav>
      </section>

      {/* Conditionally render content based on activeTab */}
      {activeTab === 'post' && <PostContent profileData={profileData} user={user} />}
      {activeTab === 'earnings' && <EarningsContent />}

      {/* Modals */}
      {isModalOpen && (
        <EditProfileModal
          profileData={profileData}
          user={user}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          loading={loading}
        />
      )}

      {isVerificationModalOpen && (
        <StudentVerificationModal
          onClose={handleCloseVerificationModal}
          onUpload={handleUpload}
        />
      )}
    </main>
  );
};

export default Profile;