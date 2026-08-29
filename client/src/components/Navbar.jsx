import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const roleBadgeColor =
    {
      student: 'badge-student',
      recruiter: 'badge-recruiter',
      admin: 'badge-admin',
    }[user?.role] || '';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">CampusConnect</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>

              {/* Profile - Student only */}
              {user?.role === 'student' && (
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
              )}

              <div className="nav-user">
                <span
                  className={`role-badge role-badge-sm ${roleBadgeColor}`}
                >
                  {user?.name?.split(' ')[0]} · {user?.role}
                </span>

                <button
                  type="button"
                  className="btn-logout"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log In
              </Link>

              <Link
                to="/register"
                className="nav-link nav-link-cta"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;