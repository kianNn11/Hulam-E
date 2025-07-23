import React, { useState } from 'react';
import './ViewDetails.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AlertMessage from '../Common/AlertMessage';
import SafeImage from '../Common/SafeImage';
import { XMarkIcon } from "@heroicons/react/24/outline";

const ViewDetails = ({ rental, onClose, getImageUrl }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

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

    // Clear previous rentedItems to avoid stale images/data
    localStorage.removeItem('rentedItems');
    // Close the modal first
    onClose();
    // Then navigate to checkout with the rental data
    navigate('/checkout', { state: { rental } });
  };

  const isOwnItem = user && rental.user_id === user.id;

  // Helper to get the correct image URL (mimic profile modal logic)
  const getRentalImageUrl = (rental) => {
    if (rental.images_url && Array.isArray(rental.images_url) && rental.images_url.length > 0) {
      // If the image is a full URL, use as is; otherwise, prefix with backend URL
      const img = rental.images_url[0];
      if (img.startsWith('http')) return img;
      if (img.startsWith('/storage/')) return `http://localhost:8000${img}`;
      return `http://localhost:8000/storage/${img}`;
    }
    // Fallback to getImageUrl prop or default
    if (getImageUrl) return getImageUrl(rental);
    return '/default-rental-image.jpg';
  };

  // Modal overlay and content (match profile modal)
  return (
    <div className="rental-modal-overlay" onClick={onClose}>
      <div className="rental-modal-content" onClick={e => e.stopPropagation()}>
        <div className="rental-modal-header">
          <h3>Rental Details</h3>
          <button className="rental-modal-close" onClick={onClose}>
            <XMarkIcon className="close-icon" />
          </button>
        </div>
        <div className="rental-modal-body">
          <div className="rental-modal-image">
            <SafeImage src={getRentalImageUrl(rental)} alt={rental.title} className="rental-modal-image-img" />
            <div className={`modal-status-badge status-${rental.status}`}>
              {rental.status}
            </div>
          </div>
          <div className="rental-modal-details">
            <h2 className="modal-title">{rental.title}</h2>
            <p className="modal-price">₱{parseFloat(rental.price).toFixed(2)}</p>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-label">Status</span>
                <span className="modal-value">{rental.status === 'available' ? 'Available for Rent' : rental.status === 'rented' ? 'Currently Rented' : 'Unavailable'}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-label">Location</span>
                <span className="modal-value">{rental.location}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-label">Contact Information</span>
                <span className="modal-value">
                  {rental.user?.email || 'Contact through platform'}
                  {rental.user?.contact_number && (
                    <span><br/>{rental.user.contact_number}</span>
                  )}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="modal-label">GCash Number</span>
                <span className="modal-value">
                  {rental.user?.contact_number || '09XXXXXXXXX'}
                  <small style={{ display: 'block', color: '#666', marginTop: '4px' }}>
                    Use this number for GCash payments
                  </small>
                </span>
              </div>
              <div className="modal-info-item modal-description">
                <span className="modal-label">Description</span>
                <p className="modal-value modal-description-text">{rental.description}</p>
              </div>
              <div className="modal-info-item">
                <span className="modal-label">Posted Date</span>
                <span className="modal-value">
                  {new Date(rental.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            {/* Rent Now button logic remains, but styled below modal info */}
            {isOwnItem ? (
              <button className="rent-now-btn disabled" disabled>
                This is Your Item
              </button>
            ) : rental.status === 'available' ? (
              <button 
                className={`rent-now-btn${loading ? ' loading' : ''}`} 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    handleRentNow();
                  }, 600); // Simulate loading for UX
                }}
                disabled={loading}
                style={{
                  boxShadow: '0 4px 20px rgba(79,70,229,0.15)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px',
                  padding: '14px 100px',
                  background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                  transition: 'transform 0.15s cubic-bezier(.4,2,.6,1)',
                  transform: loading ? 'scale(0.98)' : 'scale(1)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span className="spinner" style={{width:'20px',height:'20px',border:'3px solid #fff',borderTop:'3px solid #6366f1',borderRadius:'50%',animation:'spin 1s linear infinite'}}></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    <span style={{fontSize:'1.2em',verticalAlign:'middle'}}></span>
                    Rent Now
                  </>
                )}
              </button>
            ) : (
              <button className="rent-now-btn disabled" disabled>
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
        {alert.show && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}
      </div>
    </div>
  );
};

export default ViewDetails;
