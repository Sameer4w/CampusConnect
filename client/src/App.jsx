import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// PUBLIC / MAIN PAGES
// =====================================================

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminOpportunitiesPage from "./pages/AdminOpportunitiesPage.jsx";
import AdminJobsPage from "./pages/AdminJobsPage.jsx";
import AdminEventsPage from "./pages/AdminEventsPage.jsx";

// =====================================================
// OPPORTUNITY PAGES
// =====================================================

import OpportunitiesPage from "./pages/OpportunitiesPage.jsx";
import OpportunityDetailsPage from "./pages/OpportunityDetailsPage.jsx";
import EditOpportunityPage from "./pages/EditOpportunityPage.jsx";
import PostOpportunityPage from "./pages/PostOpportunityPage.jsx";
import MyOpportunitiesPage from "./pages/MyOpportunitiesPage.jsx";

// =====================================================
// APPLICATION PAGES
// =====================================================

import MyApplicationsPage from "./pages/MyApplicationsPage.jsx";
import RecruiterApplicationsPage from "./pages/RecruiterApplicationsPage.jsx";

// =====================================================
// LAYOUT COMPONENTS
// =====================================================

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// =====================================================
// ROUTE PROTECTION
// =====================================================

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <div className="app-container">

      {/* =========================
          NAVBAR
      ========================== */}

      <Navbar />

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="main-content">

        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          {/* =========================
              AUTHENTICATED ROUTES
          ========================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              ADMIN ROUTES
          ========================== */}

          {/* Admin Dashboard */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Manage Users */}

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Manage Opportunities */}

          <Route
            path="/admin/opportunities"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminOpportunitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Manage Jobs */}

          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminJobsPage />
              </ProtectedRoute>
            }
          />

          {/* Manage Events */}

          <Route
            path="/admin/events"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              STUDENT ROUTES
          ========================== */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowedRoles={["student"]}
              >
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <ProtectedRoute
                allowedRoles={["student"]}
              >
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              RECRUITER ROUTES
          ========================== */}

          {/* Edit Opportunity */}

          <Route
            path="/opportunities/:id/edit"
            element={
              <ProtectedRoute
                allowedRoles={["recruiter"]}
              >
                <EditOpportunityPage />
              </ProtectedRoute>
            }
          />

          {/* Post Opportunity */}

          <Route
            path="/opportunities/post"
            element={
              <ProtectedRoute
                allowedRoles={["recruiter"]}
              >
                <PostOpportunityPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter's Opportunities */}

          <Route
            path="/my-opportunities"
            element={
              <ProtectedRoute
                allowedRoles={["recruiter"]}
              >
                <MyOpportunitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Applications */}

          <Route
            path="/recruiter/applications"
            element={
              <ProtectedRoute
                allowedRoles={["recruiter"]}
              >
                <RecruiterApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              SHARED AUTHENTICATED ROUTES
          ========================== */}

          {/* Opportunities List */}

          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <OpportunitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Opportunity Details */}

          <Route
            path="/opportunities/:id"
            element={
              <ProtectedRoute>
                <OpportunityDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              REDIRECT ROUTES
          ========================== */}

          <Route
            path="/student/profile"
            element={
              <Navigate
                to="/profile"
                replace
              />
            }
          />

          {/* =========================
              FALLBACK ROUTE
          ========================== */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />

        </Routes>

      </main>

      {/* =========================
          FOOTER
      ========================== */}

      <Footer />

    </div>
  );
}

export default App;