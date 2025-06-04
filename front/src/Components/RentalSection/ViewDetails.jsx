import React from 'react';
import './ViewDetails.css';
import calculatorImage from '../Assets/calculator.jpg';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ViewDetails = ({ rental, onClose, getImageUrl }) => {
  const navigate = useNavigate();

  if (!rental) {
    return (
      <div className="view-details-page">
        <div className="view-loading">Loading rental details...</div>
      </div>
    );
  }

  const handleRentNow = () => {
    // Close the modal first
    onClose();
    // Then navigate to checkout with the rental data
    navigate('/checkout', { state: { rental } });
  };

  return (
    <div className="view-details-page">
      <section className="view-item-details">
        <div className="view-back-container">
          <ArrowLeftIcon className='view-back-btn' onClick={onClose}/>
        </div>

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

            {rental.status === 'available' ? (
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
