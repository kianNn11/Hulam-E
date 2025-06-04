import React, { useState, useEffect } from 'react';
import './EarningsSection.css';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';

const EarningsSection = () => {
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    availableBalance: 0,
    transactionCount: 0,
    totalRentals: 0,
    activeRentals: 0,
    transactions: [],
    monthlyBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeTab = (() => {
    switch (location.pathname) {
      case '/profile': return 'post';
      case '/earnings': return 'earnings';
      default: return '';
    }
  })();

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!isLoggedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userAPI.getEarnings();
        
        if (response.data) {
          setEarningsData(response.data);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setError('Failed to load earnings data');
        // Keep default structure on error
        setEarningsData({
          totalEarnings: 0,
          pendingPayouts: 0,
          availableBalance: 0,
          transactionCount: 0,
          totalRentals: 0,
          activeRentals: 0,
          transactions: [],
          monthlyBreakdown: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [isLoggedIn, user]);

  if (loading) {
    return (
      <main className="earnings">
        <section className="earningsSection">
          <div className="earningsHeader">
            <h2 className="sectionTitle">Loading earnings...</h2>
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
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="earnings">
      <section className="earningsSection">
        <div className="earningsHeader">
          <h2 className="sectionTitle">Earnings Overview</h2>
          <div className="totalEarnings">
            <h3 className="earningsAmount">₱{earningsData.totalEarnings.toLocaleString()}</h3>
            <div className="earningsStats">
              <p>Available Balance: ₱{earningsData.availableBalance.toLocaleString()}</p>
              <p>Pending Earnings: ₱{earningsData.pendingPayouts.toLocaleString()}</p>
              <p>Total Rentals: {earningsData.totalRentals}</p>
              <p>Active Rentals: {earningsData.activeRentals}</p>
            </div>
          </div>
        </div>

        <div className="transactionHistory">
          <h3 className="sectionTitle">Transaction History ({earningsData.transactionCount} total)</h3>
          {earningsData.transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions yet. Start renting out your items to see earnings here!</p>
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
      </section>
    </main>
  );
};

export default EarningsSection;