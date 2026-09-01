import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const {
    isAuthenticated,
    user,
    logout,
    isLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    setIsMenuOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // =====================================================
  // ROLE BADGE
  // =====================================================

  const roleBadgeColor =
    {
      student: "badge-student",
      recruiter: "badge-recruiter",
      admin: "badge-admin",
    }[user?.role] || "";

  // =====================================================
  // NAV LINK CLASS
  // =====================================================

  const getNavLinkClass = ({ isActive }) =>
    `nav-link ${
      isActive
        ? "nav-link-active"
        : ""
    }`;

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LOGO */}
        <Link
          to="/"
          className="nav-logo"
          onClick={closeMenu}
        >
          <span className="logo-icon">
            🎓
          </span>

          <span className="logo-text">
            CampusConnect
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`nav-toggle ${
            isMenuOpen
              ? "nav-toggle-active"
              : ""
          }`}
          onClick={() =>
            setIsMenuOpen((previous) =>
              !previous
            )
          }
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION */}
        <div
          className={`nav-links ${
            isMenuOpen
              ? "nav-links-open"
              : ""
          }`}
        >

          {/* HOME */}
          <NavLink
            to="/"
            className={getNavLinkClass}
            onClick={closeMenu}
            end
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>

              {/* COMMON */}
              <NavLink
                to="/dashboard"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/opportunities"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Opportunities
              </NavLink>

              {/* STUDENT */}
              {user?.role === "student" && (
                <>
                  <NavLink
                    to="/profile"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    Profile
                  </NavLink>

                  <NavLink
                    to="/applications"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    My Applications
                  </NavLink>
                </>
              )}

              {/* RECRUITER */}
              {user?.role === "recruiter" && (
                <>
                  <NavLink
                    to="/opportunities/post"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    Post Opportunity
                  </NavLink>

                  <NavLink
                    to="/my-opportunities"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    My Opportunities
                  </NavLink>

                  <NavLink
                    to="/recruiter/applications"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    Applications
                  </NavLink>
                </>
              )}

              {/* ADMIN */}
              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={getNavLinkClass}
                  onClick={closeMenu}
                >
                  Admin
                </NavLink>
              )}

              {/* USER / LOGOUT */}
              <div className="nav-user">
                <span
                  className={`role-badge role-badge-sm ${roleBadgeColor}`}
                >
                  {user?.name
                    ?.split(" ")[0] ||
                    "User"}

                  {" · "}

                  {user?.role}
                </span>

                <button
                  type="button"
                  className="btn-logout"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Please wait..."
                    : "Logout"}
                </button>
              </div>

            </>
          ) : (
            <>
              {/* PUBLIC */}
              <NavLink
                to="/login"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Log In
              </NavLink>

              <NavLink
                to="/register"
                className="nav-link nav-link-cta"
                onClick={closeMenu}
              >
                Sign Up
              </NavLink>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;