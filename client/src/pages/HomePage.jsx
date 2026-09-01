import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function HomePage() {
  const {
    isAuthenticated,
    user,
  } = useAuth();

  const firstName =
    user?.name?.trim()?.split(" ")[0] ||
    "there";

  return (
    <div className="home-page">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            <span aria-hidden="true">
              🎓
            </span>

            {" "}
            Built for Students & Recruiters
          </div>

          <h1 className="hero-title">
            Connect Talent With

            <br />

            <span className="accent">
              Great Opportunities
            </span>
          </h1>

          <p className="hero-subtitle">
            CampusConnect helps students discover
            internships, jobs, and career opportunities
            while helping recruiters connect with
            talented students.
          </p>

          <div className="hero-actions">

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn-primary"
                >
                  Go to Dashboard
                </Link>

                <Link
                  to="/opportunities"
                  className="btn-hero-secondary"
                >
                  Explore Opportunities
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="btn-hero-secondary"
                >
                  Log In
                </Link>
              </>
            )}

          </div>

          {isAuthenticated && user && (
            <p className="hero-user-message">
              Welcome back,{" "}

              <strong>
                {firstName}
              </strong>

              {" "}

              <span aria-hidden="true">
                👋
              </span>
            </p>
          )}

        </div>

      </section>

      {/* =====================================================
          FEATURES SECTION
      ===================================================== */}

      <section className="home-features-section">

        <div className="section-heading">

          <span className="section-tag">
            PLATFORM FEATURES
          </span>

          <h2>
            Everything You Need for Your

            <span className="accent">
              {" "}
              Career Journey
            </span>
          </h2>

          <p>
            Discover opportunities, build your
            professional profile, and manage your
            applications from one place.
          </p>

        </div>

        <div className="home-feature-grid">

          {/* DISCOVER */}

          <div className="home-feature-card">

            <div
              className="home-feature-icon"
              aria-hidden="true"
            >
              💼
            </div>

            <h3>
              Discover Opportunities
            </h3>

            <p>
              Explore internships, jobs, and career
              opportunities posted by recruiters.
            </p>

          </div>

          {/* PROFILE */}

          <div className="home-feature-card">

            <div
              className="home-feature-icon"
              aria-hidden="true"
            >
              📄
            </div>

            <h3>
              Build Your Profile
            </h3>

            <p>
              Showcase your education, skills,
              projects, certifications, achievements,
              and resume.
            </p>

          </div>

          {/* APPLICATIONS */}

          <div className="home-feature-card">

            <div
              className="home-feature-icon"
              aria-hidden="true"
            >
              📊
            </div>

            <h3>
              Track Applications
            </h3>

            <p>
              Keep track of your applications and
              follow their progress throughout the
              recruitment process.
            </p>

          </div>

          {/* RECRUITER MANAGEMENT */}

          <div className="home-feature-card">

            <div
              className="home-feature-icon"
              aria-hidden="true"
            >
              🎯
            </div>

            <h3>
              Manage Opportunities
            </h3>

            <p>
              Recruiters can create opportunities,
              manage their postings, and review
              student applications.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          STUDENT / RECRUITER SECTION
      ===================================================== */}

      <section className="audience-section">

        {/* STUDENT */}

        <div className="audience-card audience-student">

          <div
            className="audience-icon"
            aria-hidden="true"
          >
            🎓
          </div>

          <h2>
            For Students
          </h2>

          <p>
            Build your profile, upload your resume,
            discover opportunities, and manage your
            applications.
          </p>

          <ul>

            <li>
              Discover internships and jobs
            </li>

            <li>
              Track application status
            </li>

            <li>
              Build a professional profile
            </li>

            <li>
              Showcase skills and projects
            </li>

          </ul>

          {!isAuthenticated ? (
            <Link
              to="/register"
              className="btn-primary"
            >
              Join as Student
            </Link>
          ) : user?.role === "student" ? (
            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Student Dashboard
            </Link>
          ) : null}

        </div>

        {/* RECRUITER */}

        <div className="audience-card audience-recruiter">

          <div
            className="audience-icon"
            aria-hidden="true"
          >
            🏢
          </div>

          <h2>
            For Recruiters
          </h2>

          <p>
            Post opportunities, manage applicants,
            and connect directly with talented
            college students.
          </p>

          <ul>

            <li>
              Post job opportunities
            </li>

            <li>
              Manage applications
            </li>

            <li>
              Review student applications
            </li>

            <li>
              Manage opportunity postings
            </li>

          </ul>

          {!isAuthenticated ? (
            <Link
              to="/register"
              className="btn-primary"
            >
              Join as Recruiter
            </Link>
          ) : user?.role === "recruiter" ? (
            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Recruiter Dashboard
            </Link>
          ) : null}

        </div>

      </section>

      {/* =====================================================
          CTA SECTION
      ===================================================== */}

      <section className="home-cta-section">

        <div className="home-cta-content">

          <span
            className="cta-icon"
            aria-hidden="true"
          >
            🚀
          </span>

          <h2>
            {isAuthenticated
              ? `Continue Your Journey, ${firstName}`
              : "Start Building Your Future Today"}
          </h2>

          <p>
            {isAuthenticated
              ? "Continue exploring opportunities and managing your CampusConnect journey."
              : "Join CampusConnect and take the next step toward your academic and professional career."}
          </p>

          {!isAuthenticated ? (
            <Link
              to="/register"
              className="btn-primary"
            >
              Create Your Account
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Continue to Dashboard
            </Link>
          )}

        </div>

      </section>

    </div>
  );
}

export default HomePage;