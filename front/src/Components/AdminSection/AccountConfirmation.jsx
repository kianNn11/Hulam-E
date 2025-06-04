import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import './AccountConfirmation.css';

const AccountConfirmation = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);

  // Safe image component to prevent flickering
  const SafeImage = ({ src, alt, className, placeholder = null }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    if (hasError || !src) {
      return (
        <div className={`${className} placeholder-image`}>
          {placeholder || <div className="placeholder-content">👤</div>}
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    );
  };

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/admin/verification/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching pending users:', error);
        setNotification('Failed to load pending verifications.');
        setTimeout(() => setNotification(''), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:8000/api/admin/verification/${userId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove user from pending list
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotification('Account verification approved successfully.');
    } catch (error) {
      console.error('Error approving user:', error);
      setNotification('Failed to approve the account verification.');
    } finally {
      closeModal();
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleDeny = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:8000/api/admin/verification/${userId}/deny`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove user from pending list
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotification('Account verification denied.');
    } catch (error) {
      console.error('Error denying user:', error);
      setNotification('Failed to deny the account verification.');
    } finally {
      closeModal();
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="account-confirmation-admin">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading pending verifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-confirmation-admin">
      <div className="container">
        {notification && (
          <div className="system-notification">{notification}</div>
        )}

        <h1 className="page-title">Account Verification</h1>

        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No pending verifications found.
          </div>
        ) : (
          <>
            <div className="table-header">
              <div className="column-header name">Name</div>
              <div className="column-header">ID</div>
              <div className="column-header">Email</div>
              <div className="column-header">Date Submitted</div>
              <div className="column-header">Documents</div>
              <div className="column-header">Action</div>
            </div>

            {users.map((user) => (
              <div className="account-row" key={user.id}>
                <div className="account-name">
                  <SafeImage 
                    src={user.profilePic || '/placeholder-avatar.jpg'} 
                    alt="Profile" 
                    className="profile-pic"
                  />
                  <span>{user.name}</span>
                </div>
                <div className="account-id">{user.id}</div>
                <div className="account-email">{user.email}</div>
                <div className="account-date">
                  {user.date ? new Date(user.date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="account-proof">
                  {user.proof ? (
                    <a href={user.proof} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  ) : (
                    <span style={{ color: '#666' }}>No document</span>
                  )}
                </div>
                <div className="approval-buttons">
                  <button
                    className="approve-button"
                    onClick={() => openModal(user)}
                  >
                    <CheckCircleIcon className="icon"/>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {isModalOpen && selectedUser && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>&times;</button>
              <h3>Review Verification Request</h3>
              <p><strong>User:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              
              {selectedUser.proof ? (
                <div>
                  <p>Verification Document:</p>
                  <SafeImage 
                    src={selectedUser.proof} 
                    alt="Verification Document" 
                    className="proof-preview"
                    placeholder={<div className="placeholder-content">📄</div>}
                  />
                </div>
              ) : (
                <p style={{ color: '#666' }}>No verification document submitted.</p>
              )}

              <div className="modal-actions">
                <button className="confirm-button" onClick={() => handleApprove(selectedUser.id)}>
                  Approve Verification
                </button>
                <button className="deny-button" onClick={() => handleDeny(selectedUser.id)}>
                  Deny Verification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountConfirmation;