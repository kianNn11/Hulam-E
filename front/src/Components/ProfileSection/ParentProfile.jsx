// ParentProfile.js
import React, { useState, useEffect } from 'react';
import Profile from '../Components/ProfileSection/Profile';
import PostContent from '../Components/ProfileSection/PostContent';
import EditProfileModal from '../Components/ProfileSection/EditProfileModal';

const ParentProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    courseYear: '',
    birthday: '',
    gender: '',
    socialLink: '',
    contactNumber: '',
    certificate: null,
    profileImage: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('profileData');
    if (storedData) {
      setProfileData(JSON.parse(storedData));
    }
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveProfile = async (updatedData) => {
    setProfileData(updatedData);
    localStorage.setItem('profileData', JSON.stringify(updatedData));

    try {
      const response = await fetch('https://your-api.com/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to save profile remotely');
      console.log('Profile saved remotely!');
    } catch (err) {
      console.error('Remote save failed:', err);
    }

    handleCloseModal();
  };

  return (
    <div>
      <Profile profileData={profileData} onEditClick={handleOpenModal} />
      <PostContent profileData={profileData} />

      {isModalOpen && (
        <EditProfileModal
          profileData={profileData}
          onSave={handleSaveProfile}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ParentProfile;