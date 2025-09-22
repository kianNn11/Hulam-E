import React, { useState, useEffect, useCallback } from 'react';
import banner from '../Assets/banner.jpg';
import './RentalSection.css';
import { EyeIcon } from "@heroicons/react/24/outline";
import ViewDetails from './ViewDetails';
import { rentalAPI } from '../../services/api';
import SafeImage from '../Common/SafeImage';

const RentalSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    location: ''
  });

  const fetchRentals = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        ...params,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.min_price && { min_price: filters.min_price }),
        ...(filters.max_price && { max_price: filters.max_price }),
        ...(filters.location && { location: filters.location })
      });
      const response = await rentalAPI.getRentals(`?${queryParams}`);
      setRentals(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setError('Failed to load rentals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRentals();
  };

  const openModal = (rental) => {
    setSelectedRental(rental);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRental(null);
  };

  const getImageUrl = (rental) => {
    // Prefer images_url (array) if present and non-empty
    if (rental.images_url && Array.isArray(rental.images_url) && rental.images_url.length > 0) {
      return rental.images_url[0];
    }
    // Fallback to image_url if present
    if (rental.image_url) {
      return rental.image_url;
    }
    // Fallback to old logic for legacy data
    if (rental.image) {
      if (rental.image.startsWith('http')) {
        return rental.image;
      }
      if (rental.image.startsWith('data:image/')) {
        return rental.image;
      }
      if (rental.image.startsWith('/storage/')) {
        return `http://localhost:8000${rental.image}`;
      }
      if (rental.image.startsWith('rentals/')) {
        return `http://localhost:8000/storage/${rental.image}`;
      }
      return `http://localhost:8000/storage/rentals/${rental.image}`;
    }
    // Only use the default image if there is truly no uploaded image
    return '';
  };

  return (
    <main className="rentalSection">
      <section className="rental-section">
        <img src={banner} alt="Banner" className="rental-bannerImage" />
        <div className="rental-bannerContent">
          <p className="rental-bannerTitle">Rental Section</p>
          <p className="rental-bannerSubtitle">
            Affordable Learning Resources at Your Fingertips!
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="rental-search-section">
          <form onSubmit={handleSearch} className="rental-search-form">
            <div className="rental-search-inputs">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rental-search-input"
              />
              <input
                type="number"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={(e) => setFilters(prev => ({...prev, min_price: e.target.value}))}
                className="rental-filter-input"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={(e) => setFilters(prev => ({...prev, max_price: e.target.value}))}
                className="rental-filter-input"
              />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                className="rental-filter-input"
              />
              <button type="submit" className="rental-search-btn">Search</button>
            </div>
          </form>
        </div>

        {/* Content Area */}
        <div className="rental-content-area">
          {/* Loading State */}
          {loading && (
            <div className="rental-loading">
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f4f6', 
                borderTop: '4px solid #3b82f6', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              <p>Loading amazing rental items...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rental-error">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p>{error}</p>
              <button onClick={() => fetchRentals()} className="rental-retry-btn">
                Try Again
              </button>
            </div>
          )}

          {/* Rentals Grid or No Results */}
          {!loading && !error && (
            <>
              {rentals.length === 0 ? (
                <div className="rental-no-results">
                  <p>No rental items available at the moment.</p>
                </div>
              ) : (
                <div className="rental-grid">
                  {rentals.map((rental) => (
                    <article key={rental.id} className="rental-card">
                      <div className="rental-image-container">
                        <SafeImage src={getImageUrl(rental)} alt={rental.title} className="rental-image" />
                      </div>

                      <div className="rental-card-content">
                        <p className="rental-price">₱{parseFloat(rental.price).toFixed(2)}</p>
                        <h3 className="rental-material-name">{rental.title}</h3>
                        <p className="rental-location">{rental.location}</p>
                        <button 
                          className="rental-view-details-button" 
                          onClick={() => openModal(rental)}
                        >
                          <span className="rental-eye-icon">
                            <EyeIcon />
                          </span>
                          <span className="rental-view-details-text">
                            View Details
                          </span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ViewDetails Modal */}
      {isModalOpen && selectedRental && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ViewDetails 
              rental={selectedRental} 
              onClose={closeModal}
              getImageUrl={getImageUrl}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default RentalSection;
