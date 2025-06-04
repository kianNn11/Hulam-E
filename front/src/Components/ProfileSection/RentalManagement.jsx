import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import './RentalManagement.css';

const RentalManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // incoming, outgoing, history
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8000/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showAlert('error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleApprove = async (transactionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:8000/api/transactions/${transactionId}/approve`,
        { response: 'Rental request approved' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Rental request approved successfully!');
        fetchTransactions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      showAlert('error', error.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async (transactionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:8000/api/transactions/${transactionId}/reject`,
        { response: reason },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Rental request rejected');
        fetchTransactions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      showAlert('error', error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleComplete = async (transactionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:8000/api/transactions/${transactionId}/complete`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showAlert('success', 'Rental marked as completed!');
        fetchTransactions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      showAlert('error', error.response?.data?.error || 'Failed to complete transaction');
    }
  };

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    if (!transactions.length) return [];

    switch (activeTab) {
      case 'incoming':
        // Requests I received as owner (pending approval)
        return transactions.filter(t => 
          t.owner_id === user?.id && t.status === 'pending'
        );
      case 'outgoing':
        // Requests I sent as renter (pending only)
        return transactions.filter(t => 
          t.renter_id === user?.id && t.status === 'pending'
        );
      case 'history':
        // All approved/completed/rejected transactions
        return transactions.filter(t => 
          (t.owner_id === user?.id || t.renter_id === user?.id) && 
          ['approved', 'completed', 'rejected'].includes(t.status)
        );
      default:
        return [];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#059669';
      case 'completed': return '#2563eb';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="rental-management">
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="rental-management-header">
        <h2>Rental Management</h2>
        <p>Manage your rental requests and track transactions</p>
      </div>

      <div className="rental-tabs">
        <button
          className={`tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          <ClockIcon className="tab-icon" />
          Pending Requests
          {transactions.filter(t => t.owner_id === user?.id && t.status === 'pending').length > 0 && (
            <span className="notification-badge">
              {transactions.filter(t => t.owner_id === user?.id && t.status === 'pending').length}
            </span>
          )}
        </button>
        
        <button
          className={`tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          <UserIcon className="tab-icon" />
          My Requests
        </button>
        
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <CalendarIcon className="tab-icon" />
          History
        </button>
      </div>

      <div className="transactions-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No transactions found</h3>
            <p>
              {activeTab === 'incoming' && "You don't have any pending rental requests"}
              {activeTab === 'outgoing' && "You don't have any pending rental requests"}
              {activeTab === 'history' && "No transaction history yet"}
            </p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-header">
                  <div className="transaction-title">
                    <h4>{transaction.rental?.title || 'Item'}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(transaction.status) }}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div className="transaction-amount">
                    <CurrencyDollarIcon className="currency-icon" />
                    ₱{transaction.total_amount?.toLocaleString()}
                  </div>
                </div>

                <div className="transaction-details">
                  <div className="detail-item">
                    <CalendarIcon className="detail-icon" />
                    <span>{formatDate(transaction.start_date)} - {formatDate(transaction.end_date)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <UserIcon className="detail-icon" />
                    <span>
                      {activeTab === 'incoming' ? (
                        `Renter: ${transaction.renter?.name || 'Unknown'}`
                      ) : (
                        `Owner: ${transaction.owner?.name || 'Unknown'}`
                      )}
                    </span>
                  </div>

                  {transaction.renter_message && (
                    <div className="message-section">
                      <p className="message-label">Message:</p>
                      <p className="message-text">"{transaction.renter_message}"</p>
                    </div>
                  )}

                  {transaction.owner_response && (
                    <div className="message-section">
                      <p className="message-label">Owner Response:</p>
                      <p className="message-text">"{transaction.owner_response}"</p>
                    </div>
                  )}
                </div>

                {activeTab === 'incoming' && transaction.status === 'pending' && (
                  <div className="transaction-actions">
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleApprove(transaction.id)}
                    >
                      <CheckCircleIcon className="action-icon" />
                      Approve
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleReject(transaction.id)}
                    >
                      <XCircleIcon className="action-icon" />
                      Reject
                    </button>
                  </div>
                )}

                {transaction.status === 'approved' && (
                  <div className="transaction-actions">
                    <button
                      className="action-btn complete-btn"
                      onClick={() => handleComplete(transaction.id)}
                    >
                      <CheckCircleIcon className="action-icon" />
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalManagement; 