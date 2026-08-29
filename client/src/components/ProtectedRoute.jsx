import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const {
    isAuthenticated,
    user,
    isLoading,
  } = useAuth();

  const location = useLocation();

  // =========================
  // AUTHENTICATION LOADING
  // =========================

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // =========================
  // NOT AUTHENTICATED
  // =========================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // =========================
  // AUTHENTICATED BUT USER
  // DATA IS NOT AVAILABLE
  // =========================

  if (!user) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  // =========================
  // ROLE AUTHORIZATION
  // =========================

  const requiresSpecificRole = allowedRoles.length > 0;

  const hasRequiredRole =
    !requiresSpecificRole ||
    allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // =========================
  // ACCESS GRANTED
  // =========================

  return children;
}

export default ProtectedRoute;