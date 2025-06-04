import React, { useState, useEffect, useRef } from 'react';
import './UserNavbar.css';
import logo from '../Assets/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';
import {
  ShoppingBagIcon,
  UserCircleIcon,
  ArrowLeftEndOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../Context/AuthContext';

const UserNavbar = () => {
  const { logout } = useAuth(); 

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);

const closeModal = () => {
  setIsModalOpen(false);
};


const getActiveMenu = () => {
  switch (location.pathname) {
    case '/rental-section':
      return 'rental-section';
    case '/post':
      return 'post';
    case '/about-us':
      return 'about';
    case '/contact':
      return 'contact';
    case '/profile':
      return 'profile';
    default:
      return '';
  }
};

const activeMenu = getActiveMenu();


  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to home even if logout API fails
      navigate('/');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <section className="user-navbar" ref={menuRef}>
      <div className="user-login-menu">
        <Bars3Icon className="login-menu-btn" onClick={toggleMenu} />
      </div>

      <div className="user-nav-logo">
        <img src={logo} alt="Hulam-e Logo" className="user-img" />
      </div>

      <ul className={`user-nav-menu ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link
            className={`user-nav-link ${location.pathname === '/rental-section' ? 'active' : ''}`}
            to="/rental-section"
          >
            Rental Section
          </Link>
        </li>
        <li>
          <Link
            className={`user-nav-link ${location.pathname === '/post' ? 'active' : ''}`}
            to="/post"
          >
            Post
          </Link>
        </li>
        <li>
          <Link
            className={`user-nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}
            to="/about-us"
          >
            About Us
          </Link>
        </li>
        <li>
          <Link
            className={`user-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
            to="/contact"
          >
            Contact
          </Link>
        </li>
      </ul>

      <div className="user-iconGroup">

  <Link to="/profile">
    <button
      className={`user-iconButton ${
        location.pathname === '/profile' ? 'active' : ''
      }`}
      aria-label="Profile"
    >
      <UserCircleIcon className="user-heroIcon" />
    </button>
  </Link>

  <button
    className="user-iconButton"
    aria-label="Logout"
    onClick={() => setShowLogoutModal(true)}
  >
    <ArrowLeftEndOnRectangleIcon className="user-heroIcon" />
  </button>
</div>


      {/* 🔐 Logout Modal */}
      {showLogoutModal && (
        <div className="user-modal-overlay">
          <div className="user-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="user-modal-buttons">
              <button onClick={confirmLogout} className="user-confirm-btn">
                Logout
              </button>
              <button onClick={cancelLogout} className="user-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}




{menuOpen && (
  <div className="user-menu-overlay">
    <div className="user-menu-content">
      <ul className="user-menu-links">
        <li>
          <Link to="/rental-section" className={`user-nav-link ${activeMenu === 'rent' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Rentals</Link>
        </li>
        <li>
          <Link to="/post" className={`user-nav-link ${activeMenu === 'post' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Post</Link>
        </li>
        <li>
          <Link to="/about-us" className={`user-nav-link ${activeMenu === 'about' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About Us</Link>
        </li>
        <li>
          <Link to="/contact" className={`user-nav-link ${activeMenu === 'contact' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contact</Link>
        </li>
        <li>
          <Link to="/cart" className="user-nav-link" onClick={() => setMenuOpen(false)}>Cart</Link>
        </li>
        <li>
          <Link to="/profile" className="user-nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
        </li>
        <li>
          <Link to="#" className="user-nav-link" onClick={() => {
            setMenuOpen(false);
            setShowLogoutModal(true);
          }}>Logout</Link>
        </li>
      </ul>
    </div>
  </div>
)}



    </section>
  );
};

export default UserNavbar;
