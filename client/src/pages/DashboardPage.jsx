import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function DashboardPage() {
  const { user } = useAuth();

  // =====================================================
  // USER DETAILS
  // =====================================================

  const firstName =
    user?.name?.trim()?.split(' ')[0] || 'User';

  const role =
    user?.role || '';

  const roleBadgeColor =
    {
      student: 'badge-student',
      recruiter: 'badge-recruiter',
      admin: 'badge-admin',
    }[role] || '';

  const memberSince = user?.createdAt
    ? new Date(
        user.createdAt
      ).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const welcomeSubtitle =
    {
      student:
        'Manage your profile, discover opportunities and continue your career journey.',

      recruiter:
        'Manage your opportunities and connect with talented students.',

      admin:
        'Manage and monitor your CampusConnect platform account.',
    }[role] ||
    'Manage your CampusConnect account and access your available features.';

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  const renderStudentDashboard = () => (
    <section className="dashboard-note">
      <div className="dashboard-section-heading">
        <div>
          <h2>Your Career Journey</h2>

          <p>
            Build your profile, discover opportunities
            and track your applications.
          </p>
        </div>

        <Link
          to="/opportunities"
          className="btn-primary"
        >
          Explore Opportunities →
        </Link>
      </div>

      <div className="note-grid">

        <Link
          to="/profile"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            👤
          </span>

          <h3>My Profile</h3>

          <p>
            Add your education, skills, projects,
            certifications and resume.
          </p>

          <span className="card-action">
            Edit Profile →
          </span>
        </Link>

        <Link
          to="/opportunities"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            💼
          </span>

          <h3>Opportunities</h3>

          <p>
            Discover internships, placements and jobs
            available for students.
          </p>

          <span className="card-action">
            Browse Opportunities →
          </span>
        </Link>

        <Link
          to="/applications"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            📨
          </span>

          <h3>My Applications</h3>

          <p>
            Track submitted applications and check
            their latest status.
          </p>

          <span className="card-action">
            View Applications →
          </span>
        </Link>

        <Link
          to="/opportunities"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            🎯
          </span>

          <h3>Recommendations</h3>

          <p>
            Explore opportunities that match your
            skills and career interests.
          </p>

          <span className="card-action">
            Explore Matches →
          </span>
        </Link>

      </div>
    </section>
  );

  // =====================================================
  // RECRUITER DASHBOARD
  // =====================================================

  const renderRecruiterDashboard = () => (
    <section className="dashboard-note">
      <div className="dashboard-section-heading">
        <div>
          <h2>Recruiter Workspace</h2>

          <p>
            Create opportunities, manage postings and
            review student applications.
          </p>
        </div>

        <Link
          to="/opportunities/post"
          className="btn-primary"
        >
          Post Opportunity →
        </Link>
      </div>

      <div className="note-grid">

        <Link
          to="/opportunities/post"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            ➕
          </span>

          <h3>Post Opportunity</h3>

          <p>
            Create internship, placement and job
            opportunities for students.
          </p>

          <span className="card-action">
            Create Opportunity →
          </span>
        </Link>

        <Link
          to="/my-opportunities"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            💼
          </span>

          <h3>My Opportunities</h3>

          <p>
            View, edit, open or close the opportunities
            you have posted.
          </p>

          <span className="card-action">
            Manage Opportunities →
          </span>
        </Link>

        <Link
          to="/recruiter/applications"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            📨
          </span>

          <h3>Applications</h3>

          <p>
            Review student applications and update
            application statuses.
          </p>

          <span className="card-action">
            Review Applications →
          </span>
        </Link>

        <Link
          to="/opportunities"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            🔎
          </span>

          <h3>Browse Opportunities</h3>

          <p>
            Explore opportunities currently available
            across the CampusConnect platform.
          </p>

          <span className="card-action">
            Browse All →
          </span>
        </Link>

      </div>
    </section>
  );

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  const renderAdminDashboard = () => (
    <section className="dashboard-note">
      <div className="dashboard-section-heading">
        <div>
          <h2>Platform Administration</h2>

          <p>
            Your administrator account has access to
            CampusConnect platform management features.
          </p>
        </div>
      </div>

      <div className="note-grid">

        <Link
          to="/opportunities"
          className="note-card dashboard-action-card"
        >
          <span className="dashboard-card-icon">
            💼
          </span>

          <h3>Opportunities</h3>

          <p>
            View opportunities available across
            the CampusConnect platform.
          </p>

          <span className="card-action">
            View Opportunities →
          </span>
        </Link>

        <div className="note-card">
          <span className="dashboard-card-icon">
            ⚙️
          </span>

          <h3>Administration</h3>

          <p>
            Additional administrator tools will appear
            here when admin management features are added.
          </p>
        </div>

      </div>
    </section>
  );

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* DASHBOARD HERO */}

        <section className="dashboard-hero">

          <div className="welcome-block">

            <h1>
              Welcome back, {firstName}! 👋
            </h1>

            <p className="welcome-sub">
              {welcomeSubtitle}
            </p>

            <span
              className={`role-badge ${roleBadgeColor}`}
            >
              {role.toUpperCase() || 'USER'}
            </span>

          </div>

          {/* USER SUMMARY */}

          <div className="profile-card">

            <div className="avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || 'U'}
            </div>

            <div className="profile-info">

              <h3>
                {user?.name ||
                  'CampusConnect User'}
              </h3>

              <p className="profile-email">
                {user?.email ||
                  'No email available'}
              </p>

              <p className="profile-date">
                Member since {memberSince}
              </p>

            </div>

          </div>

        </section>

        {/* ROLE BASED DASHBOARD */}

        {role === 'student' &&
          renderStudentDashboard()}

        {role === 'recruiter' &&
          renderRecruiterDashboard()}

        {role === 'admin' &&
          renderAdminDashboard()}

        {/* FALLBACK */}

        {![
          'student',
          'recruiter',
          'admin',
        ].includes(role) && (
          <section className="dashboard-note">

            <h2>
              Welcome to CampusConnect
            </h2>

            <p className="welcome-sub">
              Your account has been authenticated
              successfully. Your available features
              will appear here based on your account
              permissions.
            </p>

          </section>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;