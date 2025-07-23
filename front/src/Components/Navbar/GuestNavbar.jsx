import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';

const GuestNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const getActiveMenu = () => {
    switch (location.pathname) {
      case '/rental-now':
        return 'rent';
      case '/about-us':
        return 'about';
      case '/contact':
        return 'contact';
      default:
        return '';
    }
  };
  
  const activeMenu = getActiveMenu();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent immediate close
    setMenuOpen((prev) => !prev);
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
    <section className="login-navbar" ref={menuRef}>
      {/* Hamburger Menu for Small Screens */}
      <div className="login-menu" onClick={toggleMenu}>
        <Bars3Icon className="login-menu-btn" />
      </div>

      {/* Logo */}
      <div className="login-nav-logo">
        <img src={logo} alt="Logo" className="login-img" />
      </div>

      {/* Navigation Menu */}
      <ul className={`login-nav-menu ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link
            className={`login-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            to="/"
          >
            Rent Now
          </Link>
        </li>
        <li>
          <Link
            className={`login-nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}
            to="/about-us"
          >
            About Us
          </Link>
        </li>
        <li>
          <Link
            className={`login-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
            to="/contact"
          >
            Contact
          </Link>
        </li>
      </ul>

      {/* Login Button */}
      <div className="login-nav-buttons">
        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      </div>

      {/* Overlay for Menu */}
      {menuOpen && (
  <div className="login-menu-overlay" onClick={() => setMenuOpen(false)}>
    <div className="login-menu-content" onClick={(e) => e.stopPropagation()}>
      <ul className="login-menu-links">
        <li>
          <Link to="/" className={`login-nav-link ${activeMenu === 'rent-now' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Rent Now</Link>
        </li>
        <li>
          <Link to="/about-us" className={`login-nav-link ${activeMenu === 'about' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About Us</Link>
        </li>
        <li>
          <Link to="/contact" className={`login-nav-link ${activeMenu === 'contact' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contact</Link>
        </li>
      </ul>
    </div>
  </div>
)}

    </section>
  );
};

export default GuestNavbar;
