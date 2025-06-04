import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Checkout.css';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../Context/AuthContext';
import { rentalAPI } from '../../services/api';
import defaultImage from '../Assets/calculator.jpg';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [rentedItems, setRentedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    rentDuration: '',
    message: '',
    paymentMethod: 'cash_on_delivery'
  });

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
      alert('Please enter your name');
      return;
    }
    if (!formData.contactNumber.trim()) {
      alert('Please enter your contact number');
      return;
    }
    if (!formData.rentDuration.trim()) {
      alert('Please enter rent duration');
      return;
    }
    if (rentedItems.length === 0) {
      alert('No items in cart');
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
        alert(`Checkout successful! Total: ₱${response.data.data.total_amount.toFixed(2)}`);
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
        navigate('/earnings');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <button className="login-back-button" onClick={() => navigate('/rental-section')}>
        <ArrowLeftIcon className="login-back-icon" />
      </button>

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
            <h2 className="section-title">Payment Summary</h2>
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
                Cash on Delivery
              </label>
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="gcash"
                  checked={formData.paymentMethod === 'gcash'}
                  onChange={handlePaymentMethodChange}
                />
                Gcash
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
              <p><strong>Payment Method:</strong> {formData.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Gcash'}</p>
              <p><strong>Total Amount:</strong> ₱{total.toFixed(2)}</p>
              <p><strong>Items:</strong> {rentedItems.length} item(s)</p>
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