import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Opportunity pages
import OpportunitiesPage from "./pages/OpportunitiesPage.jsx";
import OpportunityDetailsPage from "./pages/OpportunityDetailsPage.jsx";
import EditOpportunityPage from "./pages/EditOpportunityPage.jsx";
import PostOpportunityPage from "./pages/PostOpportunityPage.jsx";
import MyOpportunitiesPage from "./pages/MyOpportunitiesPage.jsx";

// Application pages
import MyApplicationsPage from "./pages/MyApplicationsPage.jsx";
import RecruiterApplicationsPage from "./pages/RecruiterApplicationsPage.jsx";

// Layout components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Route protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <div className="app-container">
      <Navbar />

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
              AUTHENTICATED USER ROUTES
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

          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <OpportunitiesPage />
              </ProtectedRoute>
            }
          />

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

      <Footer />
    </div>
  );
}

export default App;