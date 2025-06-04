import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Checkout.css';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../Context/AuthContext';
import { rentalAPI } from '../../services/api';
import defaultImage from '../Assets/calculator.jpg';
import AlertMessage from '../Common/AlertMessage';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [rentedItems, setRentedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    rentDuration: '',
    message: '',
    paymentMethod: 'cash_on_delivery'
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('rentedItems')) || [];
    
    // Check if there's a rental item passed via router state
    const passedRental = location.state?.rental;
    
    if (passedRental) {
      // Transform rental object to match the expected format
      const rentalItem = {
        id: passedRental.id,
        name: passedRental.title,
        price: parseFloat(passedRental.price),
        image: passedRental.image ? 
          (passedRental.image.startsWith('http') ? 
            passedRental.image : 
            `http://localhost:8000/storage/${passedRental.image}`) : 
          defaultImage
      };
      
      console.log('Adding rental item to cart:', rentalItem); // Debug log
      
      // Check if item is already in cart
      const existingItemIndex = storedItems.findIndex(item => item.id === rentalItem.id);
      
      if (existingItemIndex === -1) {
        // Add new item to cart
        const updatedItems = [...storedItems, rentalItem];
        setRentedItems(updatedItems);
        localStorage.setItem('rentedItems', JSON.stringify(updatedItems));
        console.log('Item added to cart. Total items:', updatedItems.length); // Debug log
      } else {
        // Item already exists, just set the stored items
        setRentedItems(storedItems);
        console.log('Item already in cart'); // Debug log
      }
    } else {
      setRentedItems(storedItems);
      console.log('No rental passed via state. Using stored items:', storedItems.length); // Debug log
    }
    
    // Auto-fill user information if logged in
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        contactNumber: user.contact_number || ''
      }));
    }
  }, [isLoggedIn, user, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (e) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: e.target.value
    }));
  };

  const removeItem = (id) => {
    const updatedItems = rentedItems.filter((item) => item.id !== id);
    setRentedItems(updatedItems);
    localStorage.setItem('rentedItems', JSON.stringify(updatedItems));
  };

  const subTotal = rentedItems.reduce((acc, item) => acc + item.price, 0);
  const platformFee = 10;
  const total = subTotal + platformFee;

  const handleCompleteRental = () => {
    // Validate form
    if (!formData.name.trim()) {
      showAlert('error', 'Please enter your name');
      return;
    }
    if (!formData.contactNumber.trim()) {
      showAlert('error', 'Please enter your contact number');
      return;
    }
    if (!formData.rentDuration.trim()) {
      showAlert('error', 'Please enter rent duration');
      return;
    }
    if (rentedItems.length === 0) {
      showAlert('error', 'No items in cart');
      return;
    }
    
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  const confirmRental = async () => {
    setLoading(true);
    try {
      const checkoutData = {
        items: rentedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price
        })),
        renter_name: formData.name,
        renter_email: user?.email || 'guest@example.com',
        contact_number: formData.contactNumber,
        rent_duration: formData.rentDuration,
        message: formData.message,
        payment_method: formData.paymentMethod,
        renter_id: user?.id || null
      };

      const response = await rentalAPI.checkout(checkoutData);
      
      if (response.data.success) {
        const { data } = response.data;
        
        if (data.earnings_updated) {
          showAlert('success', `Payment successful! Total: ₱${data.total_amount.toFixed(2)}\n\nYour earnings have been updated immediately. Check your earnings page to see the new balance.`);
        } else {
          showAlert('success', `Checkout successful! Total: ₱${data.total_amount.toFixed(2)}\n\nYour rental request has been sent. You'll earn money once the owner approves and completes the transaction.`);
        }
        
        // Clear cart and form
        setRentedItems([]);
        localStorage.removeItem('rentedItems');
        setFormData({
          name: user?.name || '',
          contactNumber: user?.contact_number || '',
          rentDuration: '',
          message: '',
          paymentMethod: 'cash_on_delivery'
        });
        setShowModal(false);
        
        // Navigate to earnings page if payment was completed
        setTimeout(() => {
          if (data.earnings_updated) {
            navigate('/rentals');
          } else {
            navigate('/rentals');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle different types of errors with detailed messages
      if (error.response?.status === 403) {
        const data = error.response.data;
        
        // Handle suspended account with detailed restrictions
        if (data.error === 'Account suspended' || error.restrictionDetails?.type === 'suspended') {
          const details = error.restrictionDetails || data.restriction_details || {};
          const actionMessage = details.blocked_action || details.blockedAction || 'checking out items';
          const contactInfo = details.contact_info || details.contactInfo || 'Please contact support for assistance.';
          
          showAlert('error', 
            `Account Suspended: You cannot perform this action (${actionMessage}). ${contactInfo}`
          );
        } else if (data.error === 'Account deactivated') {
          showAlert('error', 'Your account has been deactivated. Please contact support to reactivate your account.');
        } else {
          showAlert('error', data.message || 'You do not have permission to perform this checkout.');
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
      } else if (error.response?.status === 400) {
        showAlert('error', error.response.data.message || 'Invalid checkout request. Please check your items and try again.');
      } else if (!error.response) {
        showAlert('error', 'Network error. Please check your internet connection and try again.');
      } else {
        showAlert('error', 'Checkout failed. Please try again or contact support if the problem persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <button className="login-back-button" onClick={() => navigate('/rental-section')}>
        <ArrowLeftIcon className="login-back-icon" />
      </button>

      {alert.show && (
        <AlertMessage 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ show: false, type: '', message: '' })}
          className="fixed-alert"
        />
      )}

      <div className="main-content">
        <div className="left-section">
          <div className="card item-card">
            <h2 className="item-rented-title">Item Rented</h2>
            {rentedItems.length === 0 ? (
              <p className="empty-message">No rented items yet.</p>
            ) : (
              rentedItems.map((item) => (
                <div key={item.id} className="rented-item">
                  <div className="image-wrapper">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = defaultImage; // Fallback to default image
                      }}
                    />
                    <p className="item-name">{item.name}</p>
                  </div>
                  <div className="item-details">
                    <div className="price-info">
                      <div>
                        <p>Price</p>
                        <p>₱{item.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p>Sub Total</p>
                        <p>₱{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <button className="remove-button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card form-card">
            <h2 className="section-title">Renter Information</h2>
            <form className="input-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                name="name"
                placeholder="Name*" 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="text" 
                name="contactNumber"
                placeholder="Contact Number*" 
                value={formData.contactNumber}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="text" 
                name="rentDuration"
                placeholder="Rent Duration*" 
                value={formData.rentDuration}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="text" 
                name="message"
                placeholder="Message (optional)" 
                value={formData.message}
                onChange={handleInputChange}
              />
            </form>
            {isLoggedIn && user && (
              <p className="auto-fill-notice">
                ✓ Name and contact information auto-filled from your profile
              </p>
            )}
          </div>
        </div>

        <div className="right-section">
          <div className="card summary-card">
            <h2 className="section-title">Rental Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Sub Total</span>
                <span>₱{subTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Platform Fee</span>
                <span>₱{platformFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="section-subtitle">Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === 'cash_on_delivery'}
                  onChange={handlePaymentMethodChange}
                />
                <div>
                  <strong>Cash on Delivery</strong>
                  <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
                    Payment pending - Requires owner approval before earning
                  </p>
                </div>
              </label>
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="gcash"
                  checked={formData.paymentMethod === 'gcash'}
                  onChange={handlePaymentMethodChange}
                />
                <div>
                  <strong>GCash</strong>
                  <p style={{ fontSize: '12px', color: '#059669', margin: '2px 0 0 0' }}>
                    ✓ Pay using GCash number shown in item details
                  </p>
                </div>
              </label>
            </div>

            <button 
              className="primary-button" 
              onClick={handleCompleteRental}
              disabled={loading || rentedItems.length === 0}
            >
              {loading ? 'Processing...' : 'Complete Rental'}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="back-button" onClick={closeModal}>
              <ArrowLeftIcon className="back-icon" />
            </button>
            <h3>Confirm Rental</h3>
            <div className="modal-details">
              <p><strong>Renter:</strong> {formData.name}</p>
              <p><strong>Contact:</strong> {formData.contactNumber}</p>
              <p><strong>Duration:</strong> {formData.rentDuration}</p>
              <p><strong>Payment Method:</strong> {formData.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash'}</p>
              <p><strong>Total Amount:</strong> ₱{total.toFixed(2)}</p>
              <p><strong>Items:</strong> {rentedItems.length} item(s)</p>
              {formData.paymentMethod === 'gcash' && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <p style={{ margin: '0', fontSize: '14px', color: '#1e40af' }}>
                    <strong>Note:</strong> For GCash payment, use the GCash number shown in the item details. 
                    After payment, contact the owner to confirm the transaction.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-buttons">
              <button 
                className="confirm-button" 
                onClick={confirmRental}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;