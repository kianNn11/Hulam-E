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
        // For Suspend/Deactivate, update user status
        const newStatus = confirmAction === 'Suspend' ? 'suspended' : 'inactive';
        await axios.put(`http://localhost:8000/api/admin/users/${actionUser.id}/status`, {
          status: newStatus
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUsers(prev => prev.map(user => 
          user.id === actionUser.id 
            ? { ...user, status: newStatus }
            : user
        ));
        setNotification(`User ${actionUser.name} has been ${confirmAction.toLowerCase()}ed.`);
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
          <CheckCircleIcon className="icon" /> Verified
        </span>
      case 'pending': 
      case 'unverified':
        return <span className="badge pending">
          <ClockIcon className="icon" /> Pending
        </span>
      case 'rejected': 
      case 'suspended':
        return <span className="badge rejected">
          <XCircleIcon className="icon" /> Rejected
        </span>
      case 'inactive':
        return <span className="badge not-verified">
          <NoSymbolIcon className="icon" /> Inactive
        </span>
      default: 
        return <span className="badge not-verified">
          <NoSymbolIcon className="icon" /> Not Verified
        </span>
    }
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
              <img 
                src={user.profile_picture_url || '/placeholder-avatar.jpg'} 
                alt="Profile" 
                className="profile-pic"
                onError={(e) => {
                  e.target.src = '/placeholder-avatar.jpg';
                }}
              />
              <span>{user.name}</span>
            </div>
            <div className="user-status">{renderStatusBadge(user.verification_status || user.status)}</div>
            <div className="user-actions">
              <button className="view-button" onClick={() => handleViewDetails(user)}>
                <EyeIcon className="icon" /> View
              </button>
              {user.role !== 'admin' && (
                <>
                  <button className="suspend-button" onClick={() => openConfirmModal(user, 'Suspend')}>
                    <UserMinusIcon className="icon" /> Suspend
                  </button>
                  <button className="deactivate-button" onClick={() => openConfirmModal(user, 'Deactivate')}>
                    <LockClosedIcon className="icon" /> Deactivate
                  </button>
                  <button className="delete-button" onClick={() => openConfirmModal(user, 'Delete')}>
                    <TrashIcon className="icon" /> Delete
                  </button>
                </>
              )}
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
              <img 
                src={selectedUser.profile_picture_url || '/placeholder-avatar.jpg'} 
                alt="Profile" 
                className="modal-profile-pic"
                onError={(e) => {
                  e.target.src = '/placeholder-avatar.jpg';
                }}
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
                  <img 
                    src={selectedUser.verification_document_url} 
                    alt="Verification Document" 
                    className="document-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none', padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>
                    Document could not be loaded
                  </div>
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