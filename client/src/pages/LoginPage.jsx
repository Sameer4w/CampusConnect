import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const {
    login,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // If the user was redirected to login from a protected page,
  // send them back to that page after successful login.
  const from = location.state?.from?.pathname || '/';

  // =====================================================
  // REDIRECT AFTER LOGIN
  // =====================================================

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // =====================================================
  // REGISTRATION SUCCESS MESSAGE
  // =====================================================

  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMsg('Registration successful! Please log in.');

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validate = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (error) {
      clearError();
    }

    if (successMsg) {
      setSuccessMsg('');
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await login(formData);

      // Navigation happens automatically through useEffect
      // when isAuthenticated becomes true.
    } catch (err) {
      // Error message is already handled by AuthContext.
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🎓</span>

          <h1>Welcome Back</h1>

          <p>
            Sign in to access your CampusConnect account
          </p>
        </div>

        {successMsg && (
          <div className="alert alert-success">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate
        >
          {/* EMAIL */}

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={
                validationErrors.email
                  ? 'input-error'
                  : ''
              }
            />

            {validationErrors.email && (
              <span className="field-error">
                {validationErrors.email}
              </span>
            )}
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={
                validationErrors.password
                  ? 'input-error'
                  : ''
              }
            />

            {validationErrors.password && (
              <span className="field-error">
                {validationErrors.password}
              </span>
            )}
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner spinner-sm spinner-inline" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="auth-link"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;