import HealthStatus from '../components/HealthStatus.jsx';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="accent">CampusConnect</span>
          </h1>
          <p className="hero-subtitle">
            Your Social Learning Platform for College Campuses
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span>Study Groups</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Peer Connections</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Smart Recommendations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span>Campus Events</span>
            </div>
          </div>
        </div>
      </section>

      <section className="api-test-section">
        <h2>🔌 Frontend ↔ Backend Connection Test</h2>
        <p className="section-subtitle">
          Verifying that the React frontend can communicate with the Express backend API
        </p>
        <HealthStatus />
      </section>
    </div>
  );
}

export default HomePage;
