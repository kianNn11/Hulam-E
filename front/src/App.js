import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Footer from './Components/Footer/Footer';
import RentNow from './Pages/RentNow';
import AboutPage from './Pages/AboutPage';
import ContactPage from './Pages/ContactPage';
import LoginForm from './Pages/LoginForm';
import RegisterForm from './Pages/RegisterForm';
import AdminForm from './Pages/AdminForm';
import RentalPage from './Pages/RentalPage';
import ProfilePage from './Pages/ProfilePage';
import EarningsPage from './Pages/EarningsPage';
import RentalManagementPage from './Pages/RentalManagementPage';
import AdminPage from './Pages/AdminPage';
import AccountConfirmationPage from './Pages/AccountConfirmationPage';
import UserManagementPage from './Pages/UserManagementPage';
import UserNavbar from './Components/Navbar/UserNavbar';
import GuestNavbar from './Components/Navbar/GuestNavbar';
import AdminNavbar from './Components/Navbar/AdminNavbar';
import { useAuth } from './Context/AuthContext';
import CheckoutPage from './Pages/CheckoutPage';
import PostPage from './Pages/PostPage';
import TermsandConditionPage from './Pages/TermsandConditionPage';
import PrivacyPolicyPage from './Pages/PrivacyPolicyPage';

function Layout({ children }) {
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();

  // Admin routes where we show AdminNavbar and hide other navbars/footers
  const adminRoutes = ['/dashboard', '/account-confirmation', '/user-management'];
  const isAdminRoute = adminRoutes.includes(location.pathname);

  // Show loading spinner or placeholder while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {isAdminRoute ? (
        <AdminNavbar />
      ) : isLoggedIn ? ( // ✅ If logged in, show UserNavbar
        <UserNavbar />
      ) : (
        <GuestNavbar />
      )}

      {children}

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path='/' element={<RentNow />} />
          <Route path='/about-us' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/login' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/admin' element={<AdminForm />} />
          <Route path='/rental-section' element={<RentalPage />} />
          <Route path='/rentals' element={<RentalPage />} />
          <Route path='/dashboard' element={<AdminPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/earnings' element={<EarningsPage />} />
          <Route path='/rental-management' element={<RentalManagementPage />} />
          <Route path='/account-confirmation' element={<AccountConfirmationPage />} />
          <Route path='/user-management' element={<UserManagementPage />} />
          <Route path='/post' element={<PostPage />} />
          <Route path='/checkout' element={<CheckoutPage />} />

          <Route path='/terms-and-conditions' element={<TermsandConditionPage />} />
          <Route path='/privacy-and-security' element={<PrivacyPolicyPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
