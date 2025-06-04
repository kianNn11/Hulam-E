import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  NoSymbolIcon,
  EyeIcon,
  LockClosedIcon, 
  UserMinusIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

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
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setNotification('Failed to load users.');
        setTimeout(() => setNotification(''), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewDetails = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const openConfirmModal = (user, actionType) => {
    setActionUser(user);
    setConfirmAction(actionType);
  };

  const closeConfirmModal = () => {
    setConfirmAction(null);
    setActionUser(null);
  };

  const handleConfirmAction = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (confirmAction === 'Delete') {
        await axios.delete(`http://localhost:8000/api/admin/users/${actionUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(prev => prev.filter(user => user.id !== actionUser.id));
        setNotification(`User ${actionUser.name} has been deleted.`);
      } else {
        // Handle status changes for Suspend/Resuspend/Deactivate/Reactivate
        let newStatus;
        switch (confirmAction) {
          case 'Suspend':
            newStatus = 'suspended';
            break;
          case 'Resuspend':
            newStatus = 'suspended';
            break;
          case 'Deactivate':
            newStatus = 'inactive';
            break;
          case 'Reactivate':
            newStatus = 'active';
            break;
          default:
            newStatus = 'active';
        }
        
        await axios.put(`http://localhost:8000/api/admin/users/${actionUser.id}/status`, {
          status: newStatus
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUsers(prev => prev.map(user => 
          user.id === actionUser.id 
            ? { ...user, status: newStatus, verification_status: newStatus }
            : user
        ));
        setNotification(`User ${actionUser.name} has been ${confirmAction.toLowerCase()}d.`);
      }
    } catch (error) {
      console.error(`Error performing ${confirmAction}:`, error);
      setNotification(`Failed to ${confirmAction.toLowerCase()} user.`);
    } finally {
      closeConfirmModal();
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'verified': 
      case 'active': 
        return <span className="badge verified">
          <CheckCircleIcon className="icon" /> Active
        </span>
      case 'pending': 
      case 'unverified':
        return <span className="badge pending">
          <ClockIcon className="icon" /> Pending
        </span>
      case 'rejected': 
      case 'suspended':
        return <span className="badge suspended">
          <XCircleIcon className="icon" /> Suspended
        </span>
      case 'inactive':
        return <span className="badge inactive">
          <NoSymbolIcon className="icon" /> Inactive
        </span>
      default: 
        return <span className="badge not-verified">
          <NoSymbolIcon className="icon" /> Not Verified
        </span>
    }
  };

  // Helper function to get action buttons based on user status
  const getActionButtons = (user) => {
    const currentStatus = user.verification_status || user.status;
    const buttons = [];

    // Always show View button
    buttons.push(
      <button key="view" className="view-button" onClick={() => handleViewDetails(user)}>
        <EyeIcon className="icon" /> View
      </button>
    );

    // Don't show action buttons for admin users
    if (user.role === 'admin') {
      return buttons;
    }

    // Suspend/Reactivate button for suspended users
    if (currentStatus === 'suspended') {
      buttons.push(
        <button key="reactivate-suspend" className="reactivate-button" onClick={() => openConfirmModal(user, 'Reactivate')}>
          <CheckCircleIcon className="icon" /> Reactivate
        </button>
      );
    } else {
      buttons.push(
        <button key="suspend" className="suspend-button" onClick={() => openConfirmModal(user, 'Suspend')}>
          <UserMinusIcon className="icon" /> Suspend
        </button>
      );
    }

    // Deactivate/Reactivate button for inactive users
    if (currentStatus === 'inactive') {
      buttons.push(
        <button key="reactivate-inactive" className="reactivate-button" onClick={() => openConfirmModal(user, 'Reactivate')}>
          <CheckCircleIcon className="icon" /> Reactivate
        </button>
      );
    } else if (currentStatus !== 'suspended') {
      // Only show deactivate if user is not already suspended
      buttons.push(
        <button key="deactivate" className="deactivate-button" onClick={() => openConfirmModal(user, 'Deactivate')}>
          <LockClosedIcon className="icon" /> Deactivate
        </button>
      );
    }

    // Always show Delete button for non-admin users
    buttons.push(
      <button key="delete" className="delete-button" onClick={() => openConfirmModal(user, 'Delete')}>
        <TrashIcon className="icon" /> Delete
      </button>
    );

    return buttons;
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="user-management">
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {notification && (
        <div className="system-notification" style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: '#4CAF50', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '4px',
          zIndex: 1000
        }}>
          {notification}
        </div>
      )}

      <div className="header-bar">
        <h1 className="page-title">User Management</h1>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm ? 'No users found matching your search.' : 'No users found.'}
        </div>
      ) : (
        filteredUsers.map((user) => (
          <div className="user-row" key={user.id}>
            <div className="user-name">
              <SafeImage 
                src={user.profile_picture_url || '/placeholder-avatar.jpg'} 
                alt="Profile" 
                className="profile-pic"
                placeholder={<div className="placeholder-content">👤</div>}
              />
              <span>{user.name}</span>
            </div>
            <div className="user-status">{renderStatusBadge(user.verification_status || user.status)}</div>
            <div className="user-actions">
              {getActionButtons(user)}
            </div>
          </div>
        ))
      )}

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>User Details</h2>

            <div className="user-profile-section">
              <SafeImage 
                src={selectedUser.profile_picture_url || '/placeholder-avatar.jpg'} 
                alt="Profile" 
                className="modal-profile-pic"
                placeholder={<div className="placeholder-content">👤</div>}
              />
            </div>

            <div className="user-info-grid">
              <p><strong>Name:</strong></p>
              <p>{selectedUser.name || 'N/A'}</p>
              <p><strong>ID:</strong></p>
              <p>{selectedUser.id}</p>
              <p><strong>Email:</strong></p>
              <p>{selectedUser.email || 'N/A'}</p>
              <p><strong>Birthday:</strong></p>
              <p>{selectedUser.birthday ? new Date(selectedUser.birthday).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Gender:</strong></p>
              <p>{selectedUser.gender || 'N/A'}</p>
              <p><strong>Contact:</strong></p>
              <p>{selectedUser.contact_number || 'N/A'}</p>
              <p><strong>Course & Year:</strong></p>
              <p>{selectedUser.course_year || 'N/A'}</p>
              <p><strong>Social Media:</strong></p>
              <p>
                {selectedUser.social_media_link ? (
                  <a href={selectedUser.social_media_link} target="_blank" rel="noreferrer">
                    {selectedUser.social_media_link}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p><strong>Verification Status:</strong></p>
              <p>{selectedUser.verification_status || 'Not verified'}</p>
              <p><strong>Account Created:</strong></p>
              <p>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>

            {selectedUser.verification_document_url ? (
              <div className="documents">
                <h3>Verification Document</h3>
                <div>
                  <SafeImage 
                    src={selectedUser.verification_document_url} 
                    alt="Verification Document" 
                    className="document-preview"
                    placeholder={<div className="placeholder-content">📄</div>}
                  />
                  <a href={selectedUser.verification_document_url} target="_blank" rel="noreferrer">
                    View Full Document
                  </a>
                </div>
              </div>
            ) : (
              <p>No verification documents uploaded.</p>
            )}
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={closeConfirmModal}>×</button>
            <h2>Confirm {confirmAction}</h2>
            <p>Are you sure you want to <strong>{confirmAction.toLowerCase()}</strong> the account of <strong>{actionUser.name}</strong>?</p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={handleConfirmAction}>
                Yes, {confirmAction}
              </button>
              <button className="cancel-button" onClick={closeConfirmModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;