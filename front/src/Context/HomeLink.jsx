// src/Components/HomeLink.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust path as needed

const HomeLink = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Link to={isLoggedIn ? '/rental-section' : '/'}>
      Home
    </Link>
  );
};

export default HomeLink;
