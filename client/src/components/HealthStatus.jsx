import { useEffect, useState } from 'react';
import { checkHealth } from '../api/healthApi.js';

function HealthStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setStatus(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to connect to backend'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="health-card health-loading">
        <div className="spinner"></div>
        <p>Connecting to backend API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-card health-error">
        <h3>❌ Backend Connection Failed</h3>

        <p className="error-text">{error}</p>

        <p className="hint">
          Unable to connect to the CampusConnect backend API.
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="health-card health-success">
      <h3>✅ Backend Connected Successfully!</h3>

      <div className="health-details">
        <p>
          <strong>Status:</strong> {status.status}
        </p>

        <p>
          <strong>Message:</strong> {status.message}
        </p>

        <p>
          <strong>Uptime:</strong>{' '}
          {Math.floor(status.uptime)} seconds
        </p>

        <p>
          <strong>Timestamp:</strong>{' '}
          {new Date(status.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default HealthStatus;