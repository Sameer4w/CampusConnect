import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.name?.trim()?.split(' ')[0] || 'User';

  const roleBadgeColor =
    {
      student: 'badge-student',
      recruiter: 'badge-recruiter',
      admin: 'badge-admin',
    }[user?.role] || '';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'Recently';

  const renderStudentDashboard = () => (
    <section className="dashboard-note">
      <div className="dashboard-section-heading">
        <div>
          <h2>Your Career Journey</h2>
          <p>
            Complete your profile and get ready for upcoming opportunities.
          </p>
        </div>

        <Link to="/profile" className="btn-primary">
          Complete Profile →
        </Link>
      </div>

      <div className="note-grid">
        <Link to="/profile" className="note-card dashboard-action-card">
          <span className="dashboard-card-icon">👤</span>

          <h3>My Profile</h3>

          <p>
            Add your education, skills, projects, certifications and resume.
          </p>

          <span className="card-action">Edit Profile →</span>
        </Link>

        <div className="note-card">
          <span className="dashboard-card-icon">💼</span>

          <h3>Opportunities</h3>

          <p>
            Discover internships, placements and jobs matched to your profile.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">🎯</span>

          <h3>Recommendations</h3>

          <p>
            Receive personalized recommendations based on your skills.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">📅</span>

          <h3>Campus Events</h3>

          <p>
            Stay updated with workshops, hackathons and campus events.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>
      </div>
    </section>
  );

  const renderRecruiterDashboard = () => (
    <section className="dashboard-note">
      <div className="dashboard-section-heading">
        <div>
          <h2>Recruiter Workspace</h2>

          <p>
            Manage opportunities and connect with talented students.
          </p>
        </div>
      </div>

      <div className="note-grid">
        <div className="note-card">
          <span className="dashboard-card-icon">➕</span>

          <h3>Post Opportunity</h3>

          <p>
            Create internship, placement and job opportunities.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">👨‍🎓</span>

          <h3>Student Profiles</h3>

          <p>
            Discover students based on skills and qualifications.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">📨</span>

          <h3>Applications</h3>

          <p>
            Review and manage applications from students.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">📊</span>

          <h3>Analytics</h3>

          <p>
            Track opportunity performance and applications.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>
      </div>
    </section>
  );

  const renderAdminDashboard = () => (
    <section className="dashboard-note">
      <div className="dashboard-section-heading">
        <div>
          <h2>Platform Administration</h2>

          <p>
            Monitor and manage the CampusConnect platform.
          </p>
        </div>
      </div>

      <div className="note-grid">
        <div className="note-card">
          <span className="dashboard-card-icon">👥</span>

          <h3>User Management</h3>

          <p>
            Manage students, recruiters and administrator accounts.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">💼</span>

          <h3>Opportunities</h3>

          <p>
            Monitor and moderate opportunities across the platform.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">📊</span>

          <h3>Platform Analytics</h3>

          <p>
            View activity and growth insights for CampusConnect.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>

        <div className="note-card">
          <span className="dashboard-card-icon">⚙️</span>

          <h3>System Settings</h3>

          <p>
            Configure platform-wide settings and moderation tools.
          </p>

          <span className="card-coming">Coming Soon</span>
        </div>
      </div>
    </section>
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* =========================
            DASHBOARD HERO
        ========================== */}
        <section className="dashboard-hero">
          <div className="welcome-block">
            <h1>
              Welcome back, {firstName}! 👋
            </h1>

            <p className="welcome-sub">
              Welcome to your CampusConnect workspace. Manage your account and
              explore everything the platform has to offer.
            </p>

            <span className={`role-badge ${roleBadgeColor}`}>
              {user?.role?.toUpperCase() || 'USER'}
            </span>
          </div>

          {/* USER SUMMARY CARD */}
          <div className="profile-card">
            <div className="avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="profile-info">
              <h3>
                {user?.name || 'CampusConnect User'}
              </h3>

              <p className="profile-email">
                {user?.email || 'No email available'}
              </p>

              <p className="profile-date">
                Member since {memberSince}
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            ROLE BASED DASHBOARD
        ========================== */}

        {user?.role === 'student' &&
          renderStudentDashboard()}

        {user?.role === 'recruiter' &&
          renderRecruiterDashboard()}

        {user?.role === 'admin' &&
          renderAdminDashboard()}

        {/* =========================
            FALLBACK DASHBOARD
        ========================== */}

        {!['student', 'recruiter', 'admin'].includes(user?.role) && (
          <section className="dashboard-note">
            <h2>Welcome to CampusConnect</h2>

            <p className="welcome-sub">
              Your account is authenticated successfully. More dashboard
              features will appear here as your account permissions are
              configured.
            </p>
          </section>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;