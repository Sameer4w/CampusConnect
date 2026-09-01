import {
  useState,
  useEffect,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const {
    login,
    user,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [
    validationErrors,
    setValidationErrors,
  ] = useState({});

  const [
    successMsg,
    setSuccessMsg,
  ] = useState("");

  // =====================================================
  // CLEAR OLD AUTH ERRORS
  // =====================================================

  useEffect(() => {
    clearError();
  }, [clearError]);

  // =====================================================
  // REDIRECT AFTER LOGIN
  // =====================================================

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      !isLoading
    ) {
      // If user was redirected to login
      // from a protected page, return there.
      if (location.state?.from) {
        navigate(
          location.state.from,
          {
            replace: true,
          }
        );

        return;
      }

      // Role-based default redirects
      if (user.role === "admin") {
        navigate(
          "/admin",
          {
            replace: true,
          }
        );

        return;
      }

      if (user.role === "recruiter") {
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // Default student dashboard
      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    navigate,
    location.state,
  ]);

  // =====================================================
  // REGISTRATION SUCCESS MESSAGE
  // =====================================================

  useEffect(() => {
    if (
      location.state?.registered
    ) {
      setSuccessMsg(
        "Registration successful! Please log in."
      );

      navigate(
        location.pathname,
        {
          replace: true,
          state: {},
        }
      );
    }
  }, [
    location.state,
    location.pathname,
    navigate,
  ]);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validate = () => {
    const errors = {};

    const email =
      formData.email.trim();

    if (!email) {
      errors.email =
        "Email is required";
    } else if (
      !/\S+@\S+\.\S+/.test(email)
    ) {
      errors.email =
        "Invalid email format";
    }

    if (!formData.password) {
      errors.password =
        "Password is required";
    } else if (
      formData.password.length < 6
    ) {
      errors.password =
        "Password must be at least 6 characters";
    }

    setValidationErrors(
      errors
    );

    return (
      Object.keys(errors).length === 0
    );
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (
      validationErrors[name]
    ) {
      setValidationErrors(
        (previous) => ({
          ...previous,
          [name]: undefined,
        })
      );
    }

    if (error) {
      clearError();
    }

    if (successMsg) {
      setSuccessMsg("");
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      await login({
        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,
      });

    } catch {
      // Error is handled by AuthContext
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <span
            className="auth-logo"
            aria-hidden="true"
          >
            🎓
          </span>

          <h1>
            Welcome Back
          </h1>

          <p>
            Sign in to access your
            CampusConnect account
          </p>

        </div>

        {successMsg && (
          <div
            className="alert alert-success"
            role="status"
          >
            {successMsg}
          </div>
        )}

        {error && (
          <div
            className="alert alert-error"
            role="alert"
          >
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
              maxLength={254}
              aria-invalid={
                Boolean(
                  validationErrors.email
                )
              }
              aria-describedby={
                validationErrors.email
                  ? "email-error"
                  : undefined
              }
              className={
                validationErrors.email
                  ? "input-error"
                  : ""
              }
            />

            {validationErrors.email && (
              <span
                id="email-error"
                className="field-error"
                role="alert"
              >
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
              aria-invalid={
                Boolean(
                  validationErrors.password
                )
              }
              aria-describedby={
                validationErrors.password
                  ? "password-error"
                  : undefined
              }
              className={
                validationErrors.password
                  ? "input-error"
                  : ""
              }
            />

            {validationErrors.password && (
              <span
                id="password-error"
                className="field-error"
                role="alert"
              >
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
              "Sign In"
            )}
          </button>

        </form>

        <div className="auth-footer">

          <p>
            Don't have an account?{" "}

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