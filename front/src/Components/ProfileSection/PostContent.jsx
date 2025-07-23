import React, { useState, useEffect, useCallback } from 'react';
import './PostContent.css';
import { PhoneIcon, AcademicCapIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { Venus, Cake, User } from "lucide-react";
import { LinkIcon, EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from 'react-router-dom';
import { rentalAPI } from '../../services/api';
import AlertMessage from '../Common/AlertMessage';
import SafeImage from '../Common/SafeImage';

const PostContent = ({ profileData, user }) => {
  const [userRentals, setUserRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [selectedRental, setSelectedRental] = useState(null);
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Use user data as fallback for profileData
  const displayData = {
    fullName: profileData?.fullName || user?.name || 'Not provided',
    courseYear: profileData?.courseYear || user?.course_year || 'Not provided',
    birthday: profileData?.birthday || user?.birthday || 'Not provided',
    gender: profileData?.gender || user?.gender || 'Not provided',
    socialLink: profileData?.socialLink || user?.social_link || '',
    contactNumber: profileData?.contactNumber || user?.contact_number || 'Not provided',
    bio: profileData?.bio || user?.bio || 'Not provided',
    profileImage: profileData?.profileImage || user?.profile_picture || null,
    email: user?.email || 'Not provided'
  };

  const showAlert = useCallback((type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  }, []);

  const fetchUserRentals = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await rentalAPI.getRentals(`?user_id=${user.id}`);
      setUserRentals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      showAlert('error', 'Failed to load your rental posts.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showAlert]);

  useEffect(() => {
    fetchUserRentals();
  }, [fetchUserRentals]);

  // Format birthday for better display
  const formatBirthday = (birthday) => {
    if (!birthday || birthday === 'Not provided') return 'Not provided';
    try {
      const date = new Date(birthday);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return birthday;
    }
  };

  const getImageUrl = (rental) => {
    if (rental.image) {
      if (rental.image.startsWith('http')) {
        return rental.image;
      }
      if (rental.image.startsWith('/storage/')) {
        return `http://localhost:8000${rental.image}`;
      }
      // If it's a relative path like 'rentals/filename.jpg'
      return `http://localhost:8000/storage/${rental.image}`;
    }
    return '/default-rental-image.jpg';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewRental = (rental) => {
    setSelectedRental(rental);
    setShowRentalModal(true);
  };

  const closeRentalModal = () => {
    setShowRentalModal(false);
    setSelectedRental(null);
  };

  return (
    <main className="postContent">
      <section className="contentSection">
        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <div className="contentColumns">

          {/* About Section */}
          <div className="column">
            <div className="aboutContainer">
              <div className="aboutColumns">

                {/* Main About Info */}
                <div className="aboutMainColumn">
                  <div className="aboutContent">
                    <h2 className="sectionTitle">About</h2>
                    
                    {/* Bio Section */}
                    {displayData.bio && displayData.bio !== 'Not provided' && (
                      <div className="bioSection">
                        <p className="bioText">{displayData.bio}</p>
                      </div>
                    )}

                    <div className="personalInfo">

                      <div className="infoItem">
                        <div className="infoRow">
                          <User className="icon" />
                          <div>
                            <h3 className="infoLabel">Full Name</h3>
                            <p className="infoValue">{displayData.fullName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <EnvelopeIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Email</h3>
                            <p className="infoValue">{displayData.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <AcademicCapIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Course & Year Level</h3>
                            <p className="infoValue">{displayData.courseYear}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <Cake className="icon" />
                          <div>
                            <h3 className="infoLabel">Birthday</h3>
                            <p className="infoValue">{formatBirthday(displayData.birthday)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <Venus className="icon" />
                          <div>
                            <h3 className="infoLabel">Gender</h3>
                            <p className="infoValue">{displayData.gender}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <PhoneIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Contact Number</h3>
                            <p className="infoValue">{displayData.contactNumber}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <LinkIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Social Link</h3>
                            {displayData.socialLink ? (
                              <a
                                href={displayData.socialLink}
                                className="socialLink"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {displayData.socialLink}
                              </a>
                            ) : (
                              <p className="infoValue">Not provided</p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="postsColumn">
            <div className="postsContainer">
              <div className="posts-header">
                <h2 className="sectionTitle">Your Rental Posts ({userRentals.length})</h2>
                <Link to="/post" className="add-post-btn">+ Add New Post</Link>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading your posts...</p>
                </div>
              ) : userRentals.length > 0 ? (
                <div className="rentals-list">
                  {userRentals.map((rental) => (
                    <div key={rental.id} className="rental-list-item">
                      <div className="rental-mini-image">
                        <SafeImage src={getImageUrl(rental)} alt={rental.title} className="rental-mini-image-img" />
                        <div className={`mini-status-badge status-${rental.status}`}>
                          {rental.status === 'available' ? '✓' : rental.status === 'rented' ? '✗' : '⏸'}
                        </div>
                      </div>
                      
                      <div className="rental-list-content">
                        <h4 className="rental-list-title">{rental.title}</h4>
                        <div className="rental-list-details">
                          <span className="rental-list-price">₱{parseFloat(rental.price).toFixed(2)}</span>
                          <span className="rental-list-date">{formatDate(rental.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="rental-list-actions">
                        <button 
                          onClick={() => handleViewRental(rental)}
                          className="mini-view-btn"
                          title="View rental details"
                        >
                          <EyeIcon className="mini-action-icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No rental posts yet</h3>
                  <p>You haven't posted any items for rent yet. Start sharing your items with fellow students!</p>
                  <Link to="/post" className="create-post-btn">Create Your First Post</Link>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Rental Details Modal */}
      {showRentalModal && selectedRental && (
        <div className="rental-modal-overlay" onClick={closeRentalModal}>
          <div className="rental-modal-content" onClick={e => e.stopPropagation()}>
            <div className="rental-modal-header">
              <h3>Rental Details</h3>
              <button className="rental-modal-close" onClick={closeRentalModal}>
                <XMarkIcon className="close-icon" />
              </button>
            </div>
            <div className="rental-modal-body">
              <div className="rental-modal-image">
                <SafeImage src={getImageUrl(selectedRental)} alt={selectedRental.title} className="rental-modal-image-img" />
                <div className={`modal-status-badge status-${selectedRental.status}`}>
                  {selectedRental.status}
                </div>
              </div>
              <div className="rental-modal-details">
                <h2 className="modal-title">{selectedRental.title}</h2>
                <p className="modal-price">₱{parseFloat(selectedRental.price).toFixed(2)}</p>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-label">Status</span>
                    <span className="modal-value">{selectedRental.status === 'available' ? 'Available for Rent' : selectedRental.status === 'rented' ? 'Currently Rented' : 'Unavailable'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-label">Location</span>
                    <span className="modal-value">{selectedRental.location}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-label">Posted Date</span>
                    <span className="modal-value">
                      {new Date(selectedRental.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="modal-info-item modal-description">
                    <span className="modal-label">Description</span>
                    <p className="modal-value modal-description-text">{selectedRental.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PostContent;