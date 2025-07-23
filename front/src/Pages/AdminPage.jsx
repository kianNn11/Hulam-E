import React from 'react'
import AdminForm from './AdminForm';
import AdminDashboard from '../Components/AdminSection/AdminDashboard';
import { useAuth } from '../Context/AuthContext';

const AdminPage = () => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Show dashboard only if logged in and user is admin
  if (isLoggedIn && user && user.role === 'admin') {
    return <AdminDashboard />;
  }

  // Otherwise, show login form
  return <AdminForm />;
}

export default AdminPage