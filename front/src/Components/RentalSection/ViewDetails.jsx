import React, { useState } from 'react';
import './ViewDetails.css';
import calculatorImage from '../Assets/calculator.jpg';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AlertMessage from '../Common/AlertMessage';

const ViewDetails = ({ rental, onClose, getImageUrl }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  if (!rental) {
    return (
      <div className="view-details-page">
        <div className="view-loading">Loading rental details...</div>
      </div>
    );
  }

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleRentNow = () => {
    if (!isLoggedIn) {
      showAlert('warning', 'Please log in to rent this item.');
      return;
    }

    // Check if user is trying to rent their own item
    if (user && rental.user_id === user.id) {
      showAlert('error', 'You cannot rent your own item.');
      return;
    }

    // Check if user account is suspended (client-side check)
    if (user && user.verification_status === 'suspended') {
      showAlert('error', 'Account Suspended: You cannot request items to rent while your account is suspended. Please contact support for assistance.');
      return;
    }

    // Check if user account is deactivated (client-side check)
    if (user && user.verification_status === 'inactive') {
      showAlert('error', 'Your account has been deactivated. Please contact support to reactivate your account.');
      return;
    }

    // Close the modal first
    onClose();
    // Then navigate to checkout with the rental data
    navigate('/checkout', { state: { rental } });
  };

  const isOwnItem = user && rental.user_id === user.id;

  return (
    <div className="view-details-page">
      <section className="view-item-details">
        <div className="view-back-container">
          <ArrowLeftIcon className='view-back-btn' onClick={onClose}/>
        </div>

        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <div className="item-info-container">
          <div className="view-img-container">
            <div className="view-item-image">
              <img 
                src={getImageUrl(rental)} 
                alt={rental.title}
                onError={(e) => {
                  e.target.src = calculatorImage; // Fallback to default image
                }}
              />
            </div>
          </div>

          <div className="item-details-text">
            <div className="view-post-name">
              <div className="view-icon-frame">
                <UserCircleIcon className="view-profile-icon" />
              </div>
              <p className="owner-name">{rental.user?.name || 'Unknown User'}</p>
            </div>

            <div className="view-item-name">
              <h2>{rental.title}</h2>
            </div>
          
            <div className="view-item-price">
              <p className="price">₱{parseFloat(rental.price).toFixed(2)}</p>
            </div>

            <div className="info-grid">
              <span className="label">Status</span>
              <span className="info-input">{rental.status === 'available' ? 'Available for Rent' : 'Currently Unavailable'}</span>
              
              <span className="label">Location</span>
              <span className="info-input">{rental.location}</span>
              
              <span className="label">Contact Information</span>
              <span className="info-input">
                {rental.user?.email || 'Contact through platform'}
                {rental.user?.contact_number && (
                  <span><br/>{rental.user.contact_number}</span>
                )}
              </span>

              <span className="label">GCash Number</span>
              <span className="info-input">
                {rental.user?.contact_number || '09XXXXXXXXX'}
                <small style={{ display: 'block', color: '#666', marginTop: '4px' }}>
                  Use this number for GCash payments
                </small>
              </span>
              
              <span className="label">Description</span>
              <span className="info-input">{rental.description}</span>
              
              <span className="label">Posted Date</span>
              <span className="info-input">
                {new Date(rental.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {isOwnItem ? (
              <button className="rent-now-btn disabled" disabled>
                This is Your Item
              </button>
            ) : rental.status === 'available' ? (
              <button className="rent-now-btn" onClick={handleRentNow}>
                Rent Now
              </button>
            ) : (
              <button className="rent-now-btn disabled" disabled>
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewDetails;
