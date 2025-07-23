import React, { useState, useEffect } from 'react';
import './EarningsSection.css';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { Tooltip } from '@mui/material';

const EarningsSection = () => {
  const { user, isLoggedIn } = useAuth();

  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    availableBalance: 0,
    transactionCount: 0,
    totalRentals: 0,
    activeRentals: 0,
    transactions: [],
    borrowedItems: [],
    borrowedStats: {
      totalBorrowed: 0,
      activeBorrowed: 0,
      totalSpent: 0
    },
    monthlyBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!isLoggedIn || !user) {
        setLoading(false);
        setDebugInfo('User not logged in or user data not available');
        return;
      }

      try {
        setLoading(true);
        setDebugInfo(`Fetching earnings for user: ${user.name} (ID: ${user.id})`);
        
        const response = await userAPI.getEarnings();
        
        console.log('Earnings API Response:', response);
        setDebugInfo(`API call successful. Response status: ${response.status}`);
        
        if (response.data) {
          setEarningsData(response.data);
          setError(null);
          setDebugInfo(`Earnings loaded successfully. Transactions: ${response.data.transactionCount || 0}`);
        } else {
          setError('No data received from server');
          setDebugInfo('API response was successful but contained no data');
        }
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        
        let errorMessage = 'Failed to load earnings data';
        let debugMessage = 'Unknown error occurred';
        
        if (error.response) {
          // Server responded with error status
          errorMessage = `Server error: ${error.response.status}`;
          debugMessage = `Server response: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`;
          
          if (error.response.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
            debugMessage = 'Authentication failed - user may need to log in again';
          } else if (error.response.status === 403) {
            errorMessage = 'Access denied. You may not have permission to view this data.';
            debugMessage = 'Access forbidden - insufficient permissions';
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'Network error. Please check your connection.';
          debugMessage = 'Network error - server may be unreachable';
        } else {
          // Other error
          errorMessage = error.message || 'Unknown error occurred';
          debugMessage = `Client error: ${error.message}`;
        }
        
        setError(errorMessage);
        setDebugInfo(debugMessage);
        
        // Keep default structure on error
        setEarningsData({
          totalEarnings: 0,
          pendingPayouts: 0,
          availableBalance: 0,
          transactionCount: 0,
          totalRentals: 0,
          activeRentals: 0,
          transactions: [],
          borrowedItems: [],
          borrowedStats: {
            totalBorrowed: 0,
            activeBorrowed: 0,
            totalSpent: 0
          },
          monthlyBreakdown: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [isLoggedIn, user]);

  // Add a refresh button for testing
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Refreshing...');
    // Trigger re-fetch by updating a dependency
    window.location.reload();
  };

  if (loading) {
    return (
      <main className="earnings">
        <section className="earningsSection">
          <div className="earningsHeader">
            <h2 className="sectionTitle">Loading earnings...</h2>
            {debugInfo && (
              <div className="debug-info">
                Debug: {debugInfo}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="earnings">
        <section className="earningsSection">
          <div className="earningsHeader">
            <h2 className="sectionTitle">Earnings Overview</h2>
            <div className="error-message">
              <p>{error}</p>
              <button 
                onClick={handleRefresh}
                className="retry-button"
              >
                Retry
              </button>
            </div>
            {debugInfo && (
              <div className="debug-info-detailed">
                Debug: {debugInfo}
                <br />
                User: {user ? `${user.name} (ID: ${user.id})` : 'Not logged in'}
                <br />
                Auth Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="earnings">
      <section className="earningsSection">
        <div className="earningsHeader formal-header">
          <div>
            <h2 className="sectionTitle">Earnings Overview</h2>
            <p className="sectionSubtitle">Track your rental income and borrowing activity</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="refresh-button"
            title="Refresh earnings data"
          >
            Refresh
          </button>
        </div>
        <div className="earningsSummaryCards">
          <div className="summaryCard">
            <Tooltip title="Total amount you've earned from rentals" placement="top">
              <div>
                <div className="summaryLabel">Total Earnings</div>
                <div className="summaryValue total">₱{earningsData.totalEarnings.toLocaleString()}</div>
              </div>
            </Tooltip>
          </div>
          <div className="summaryCard">
            <Tooltip title="Available balance you can withdraw" placement="top">
              <div>
                <div className="summaryLabel">Available Balance</div>
                <div className="summaryValue">₱{earningsData.availableBalance.toLocaleString()}</div>
              </div>
            </Tooltip>
          </div>
          <div className="summaryCard">
            <Tooltip title="Earnings that are pending payout" placement="top">
              <div>
                <div className="summaryLabel">Pending Earnings</div>
                <div className="summaryValue">₱{earningsData.pendingPayouts.toLocaleString()}</div>
              </div>
            </Tooltip>
          </div>
          <div className="summaryCard">
            <Tooltip title="Total number of rentals you've completed" placement="top">
              <div>
                <div className="summaryLabel">Total Rentals</div>
                <div className="summaryValue">{earningsData.totalRentals}</div>
              </div>
            </Tooltip>
          </div>
          <div className="summaryCard">
            <Tooltip title="Number of rentals currently active" placement="top">
              <div>
                <div className="summaryLabel">Active Rentals</div>
                <div className="summaryValue">{earningsData.activeRentals}</div>
              </div>
            </Tooltip>
          </div>
        </div>
        {/* Transaction History */}
        <div className="transactionHistory formal-card">
          <h3 className="sectionTitle">Transaction History <span className="count">({earningsData.transactionCount} total)</span></h3>
          {earningsData.transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions yet. Start renting out your items to see earnings here!</p>
              {earningsData.transactionCount === 0 && (
                <p>
                  Check if you have completed any successful rental transactions. Earnings only show from completed rentals.
                </p>
              )}
            </div>
          ) : (
            <ul className="transactionList">
              {earningsData.transactions.map(transaction => (
                <li key={transaction.id} className="transactionItem">
                  <div className="transactionDetails">
                    <div className="transactionDate">
                      <CalendarIcon className="calendarIcon" />
                      <p>{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="transactionInfo">
                      <p className="transactionDescription">{transaction.description}</p>
                      <p className="transactionRental">Item: {transaction.rentalTitle}</p>
                      <span className={`transactionStatus status-${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="transactionAmount">
                    <p>₱{transaction.amount.toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Borrowed Items Section */}
        <div className="borrowedItemsSection formal-card">
          <div className="borrowedHeader">
            <h3 className="sectionTitle">Your Borrowed Items <span className="count">({earningsData.borrowedStats.totalBorrowed} total)</span></h3>
            <div className="borrowedStats">
              <p>Total Spent: <span className="bold">₱{earningsData.borrowedStats.totalSpent.toLocaleString()}</span></p>
              <p>Active Rentals: <span className="bold">{earningsData.borrowedStats.activeBorrowed}</span></p>
            </div>
          </div>
          {earningsData.borrowedItems.length === 0 ? (
            <div className="no-borrowed-items">
              <p>No borrowed items yet. Start renting items from other users!</p>
            </div>
          ) : (
            <div className="borrowedItemsList">
              {earningsData.borrowedItems.map(item => (
                <div key={item.id} className="borrowedItem">
                  <div className="borrowedItemImage">
                    {item.rentalImage ? (
                      <img 
                        src={item.rentalImage.startsWith('http') ? item.rentalImage : `http://localhost:8000/storage/${item.rentalImage}`}
                        alt={item.rentalTitle}
                        onError={(e) => {
                          e.target.src = '/default-rental-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  <div className="borrowedItemDetails">
                    <h4 className="borrowedItemTitle">{item.rentalTitle}</h4>
                    <p className="borrowedItemOwner">From: {item.ownerName}</p>
                    <p className="borrowedItemAmount">₱{item.amount.toLocaleString()}</p>
                    <div className="borrowedItemDates">
                      <span className="borrowedDate">
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`borrowedStatus status-${item.status}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="borrowedItemMeta">
                    <CalendarIcon className="calendarIcon" />
                    <p>{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default EarningsSection;