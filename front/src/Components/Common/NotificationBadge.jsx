import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';

const NotificationBadge = ({ className = '' }) => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/transactions', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { role: 'owner', status: 'pending' }
        });
        
        const pendingTransactions = (response.data.data || []).filter(
          t => t.owner_id === user.id && t.status === 'pending'
        );
        
        setPendingCount(pendingTransactions.length);
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (pendingCount === 0) return null;

  return (
    <span className={`notification-badge ${className}`}>
      {pendingCount}
    </span>
  );
};

export default NotificationBadge; 