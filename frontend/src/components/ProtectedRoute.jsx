import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, initialLoading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If not allowed, redirect to generic dashboard which will route them to correct one
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
