import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    thisWeek: 0,
    totalRevenue: 0,
    thisMonth: 0,
  });

  const [users, setUsers] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
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
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch all data in parallel
        const [statsResponse, transactionsResponse, activityResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/admin/dashboard/stats', { headers }),
          axios.get('http://localhost:8000/api/admin/dashboard/transactions', { headers }),
          axios.get('http://localhost:8000/api/admin/dashboard/activity', { headers })
        ]);

        // Set stats data
        setEarnings({
          totalEarnings: statsResponse.data.revenue?.total || 0,
          totalRevenue: statsResponse.data.revenue?.total || 0,
          thisWeek: statsResponse.data.revenue?.thisWeek || 0,
          thisMonth: statsResponse.data.revenue?.thisMonth || 0,
        });

        setUsers({
          total: statsResponse.data.users?.total || 0,
          thisWeek: statsResponse.data.users?.thisWeek || 0,
          thisMonth: statsResponse.data.users?.thisMonth || 0,
        });

        // Set transactions data
        setTransactions(transactionsResponse.data.transactions || []);

        // Set activity data
        setRecentActivity(activityResponse.data.activities || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-cardGrid">
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="admin-cardGrid">
      {/* Earnings Card */}
      <article className="admin-card">
        <div className="admin-cardContent">
          <div className="admin-column2">
            <div className="admin-statContainer">
              <div className="admin-statHeader">
                <div className="admin-iconAndTitle">
                  <CurrencyDollarIcon className="admin-earningIcon" />
                  <h2 className="admin-earnings">Earnings Overview</h2>
                </div>
              </div>
              <div className="admin-statBodyGrid">
                <div className="admin-statGroup">
                  <span className="admin-subtitle">Total Earnings</span>
                  <p className="admin-statValue">₱{earnings.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="admin-statGroup">
                  <span className="admin-subtitle">Total Revenue</span>
                  <p className="admin-statValue">₱{earnings.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="admin-statGroup">
                  <span className="admin-subtitle">This Week</span>
                  <p className="admin-statValue">₱{earnings.thisWeek.toLocaleString()}</p>
                </div>
                <div className="admin-statGroup">
                  <span className="admin-subtitle">This Month</span>
                  <p className="admin-statValue">₱{earnings.thisMonth.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Users Card */}
      <article className="admin-card">
        <div className="admin-cardContent">
          <div className="admin-column2">
            <div className="admin-statContainer">
              <div className="admin-statHeader">
                <div className="admin-iconAndTitle">
                  <UserGroupIcon className="admin-earningIcon" />
                  <h2 className="admin-earnings">Users</h2>
                </div>
              </div>
              <div className="admin-statBodyUsers">
                <div className="admin-statGroup">
                  <span className="admin-subtitle">Total Users</span>
                  <p className="admin-statValue">{users.total}</p>
                </div>
                <div className="admin-statGroup">
                  <span className="admin-subtitle">This Week</span>
                  <p className="admin-statValue">{users.thisWeek}</p>
                </div>
                <div className="admin-statGroup">
                  <span className="admin-subtitle">This Month</span>
                  <p className="admin-statValue">{users.thisMonth}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Transaction History */}
      <article className="admin-card">
        <div className="admin-cardContent">
          <h2 className="admin-earnings">Transaction History</h2>
          <div className="transactionList">
            {transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <div className="transactionItem" key={index}>
                  <SafeImage
                    src={txn.image_url}
                    alt={txn.name || 'Transaction item'}
                    className="transactionImage"
                    placeholder={<div className="placeholder-content">📦</div>}
                  />
                  <div className="transactionDetails">
                    <span className="transactionName">{txn.name}</span>
                    <span className="transactionDate">{new Date(txn.date).toLocaleDateString()}</span>
                  </div>
                  <p className="transactionPrice">₱{parseFloat(txn.price).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No transactions found
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Recent Activity */}
      <article className="admin-card">
        <div className="admin-cardContent">
          <h2 className="admin-earnings">Recent Activity</h2>
          <div className="activityList">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div className="activityItem" key={index}>
                  <SafeImage
                    src={activity.profile_image_url}
                    alt={activity.user_name || 'User avatar'}
                    className="activityProfileImage"
                    placeholder={<div className="placeholder-content">👤</div>}
                  />
                  <div className="activityDetails">
                    <p className="activityMessage">
                      <strong>{activity.user_name}</strong> {activity.message}
                    </p>
                    <div className="activityMeta">
                      <span className="activityDate">{new Date(activity.date).toLocaleDateString()}</span>
                      {activity.link_url && (
                        <Link to={activity.link_url} className="seeMoreLink">
                          See more →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No recent activity found
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default AdminDashboard;  