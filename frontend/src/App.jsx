import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/authSlice';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchListings from './pages/SearchListings';
import ListingDetail from './pages/ListingDetail';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import CreateEditListing from './pages/CreateEditListing';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import VerifyEmail from './pages/VerifyEmail';
import PublicProfile from './pages/PublicProfile';

const App = () => {
  const dispatch = useDispatch();
  const { initialLoading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dashboard routing logic based on role
  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'landlord') return <Navigate to="/dashboard/landlord" />;
    return <TenantDashboard />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchListings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/users/:id" element={<PublicProfile />} />

          {/* Protected Routes - Any authenticated user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {getDashboardComponent()}
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Landlord */}
          <Route
            path="/dashboard/landlord"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/new"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <CreateEditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <CreateEditListing />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
