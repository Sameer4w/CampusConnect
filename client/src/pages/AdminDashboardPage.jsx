import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getAdminDashboard,
} from "../api/adminApi.js";

function AdminDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const fetchDashboard =
      async () => {
        try {
          setIsLoading(true);

          setError("");

          const data =
            await getAdminDashboard();

          setDashboard(
            data.dashboard
          );
        } catch (
          error
        ) {
          setError(
            error.response?.data?.message ||
              "Failed to load admin dashboard."
          );
        } finally {
          setIsLoading(false);
        }
      };

    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="page-container">
        <h1>
          Admin Dashboard
        </h1>

        <p>
          Loading platform statistics...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="page-container">
        <h1>
          Admin Dashboard
        </h1>

        <div
          className="alert alert-error"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">

      {/* =============================================
          HEADER
      ============================================= */}

      <div className="page-header">

        <div>

          <h1>
            Platform Administration
          </h1>

          <p>
            Monitor and manage the
            CampusConnect platform.
          </p>

        </div>

      </div>

      {/* =============================================
          USER STATISTICS
      ============================================= */}

      <h2>
        Users
      </h2>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <span>
            👥
          </span>

          <h3>
            Total Users
          </h3>

          <strong>
            {dashboard?.users?.total ?? 0}
          </strong>
        </div>

        <div className="dashboard-card">
          <span>
            🎓
          </span>

          <h3>
            Students
          </h3>

          <strong>
            {dashboard?.users?.students ?? 0}
          </strong>
        </div>

        <div className="dashboard-card">
          <span>
            💼
          </span>

          <h3>
            Recruiters
          </h3>

          <strong>
            {dashboard?.users?.recruiters ?? 0}
          </strong>
        </div>

        <div className="dashboard-card">
          <span>
            🛡️
          </span>

          <h3>
            Administrators
          </h3>

          <strong>
            {dashboard?.users?.admins ?? 0}
          </strong>
        </div>

      </div>

      {/* =============================================
          PLATFORM STATISTICS
      ============================================= */}

      <h2>
        Platform Overview
      </h2>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <span>
            💼
          </span>

          <h3>
            Total Jobs
          </h3>

          <strong>
            {dashboard?.jobs?.total ?? 0}
          </strong>

          <p>
            Active:{" "}
            {dashboard?.jobs?.active ?? 0}
          </p>
        </div>

        <div className="dashboard-card">
          <span>
            📢
          </span>

          <h3>
            Opportunities
          </h3>

          <strong>
            {dashboard?.opportunities?.total ?? 0}
          </strong>

          <p>
            Open:{" "}
            {dashboard?.opportunities?.open ?? 0}
          </p>
        </div>

        <div className="dashboard-card">
          <span>
            📨
          </span>

          <h3>
            Applications
          </h3>

          <strong>
            {dashboard?.applications?.total ?? 0}
          </strong>

          <p>
            Opportunities:{" "}
            {dashboard?.applications?.opportunities ?? 0}
          </p>

          <p>
            Jobs:{" "}
            {dashboard?.applications?.jobs ?? 0}
          </p>
        </div>

        <div className="dashboard-card">
          <span>
            📅
          </span>

          <h3>
            Events
          </h3>

          <strong>
            {dashboard?.events?.total ?? 0}
          </strong>

          <p>
            Published:{" "}
            {dashboard?.events?.published ?? 0}
          </p>
        </div>

      </div>

      {/* =============================================
          ACCOUNT STATUS
      ============================================= */}

      <h2>
        Account Status
      </h2>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <span>
            ✅
          </span>

          <h3>
            Active Users
          </h3>

          <strong>
            {dashboard?.users?.active ?? 0}
          </strong>
        </div>

        <div className="dashboard-card">
          <span>
            🚫
          </span>

          <h3>
            Inactive Users
          </h3>

          <strong>
            {dashboard?.users?.inactive ?? 0}
          </strong>
        </div>

      </div>

      {/* =============================================
          ADMIN MANAGEMENT
      ============================================= */}

      <h2>
        Administration
      </h2>

      <div className="dashboard-grid">

        <Link
          to="/admin/users"
          className="dashboard-card"
        >
          <span>
            👥
          </span>

          <h3>
            Manage Users
          </h3>

          <p>
            View users, manage roles,
            and activate or deactivate
            accounts.
          </p>
        </Link>

        <Link
          to="/admin/opportunities"
          className="dashboard-card"
        >
          <span>
            📢
          </span>

          <h3>
            Manage Opportunities
          </h3>

          <p>
            View and moderate all
            opportunities posted on
            CampusConnect.
          </p>
        </Link>

        <Link
          to="/admin/jobs"
          className="dashboard-card"
        >
          <span>
            💼
          </span>

          <h3>
            Manage Jobs
          </h3>

          <p>
            View and manage jobs
            available on the platform.
          </p>
        </Link>

        <Link
          to="/admin/events"
          className="dashboard-card"
        >
          <span>
            📅
          </span>

          <h3>
            Manage Events
          </h3>

          <p>
            View and manage platform
            events.
          </p>
        </Link>

      </div>

    </div>
  );
}

export default AdminDashboardPage;