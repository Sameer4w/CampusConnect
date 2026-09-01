import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyApplications } from "../api/applicationApi.js";

function MyApplicationsPage() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH STUDENT APPLICATIONS
  // =====================================================

  useEffect(() => {
    const fetchApplications =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getMyApplications();

          setApplications(
            data.applications || []
          );
        } catch (error) {
          setError(
            error.response?.data?.message ||
              "Failed to load your applications"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchApplications();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  // =====================================================
  // APPLICATION STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return `application-status status-${status.toLowerCase()}`;
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">

      {/* =============================================
          HEADER
      ============================================== */}

      <div className="page-header">

        <div>

          <h1>
            My Applications
          </h1>

          <p>
            Track the opportunities you have
            applied for.
          </p>

        </div>

        <Link
          to="/opportunities"
          className="btn btn-primary"
        >
          Browse Opportunities
        </Link>

      </div>

      {/* =============================================
          LOADING
      ============================================== */}

      {loading && (

        <div className="card">

          <p>
            Loading your applications...
          </p>

        </div>

      )}

      {/* =============================================
          ERROR
      ============================================== */}

      {!loading && error && (

        <div className="alert alert-error">
          {error}
        </div>

      )}

      {/* =============================================
          EMPTY STATE
      ============================================== */}

      {!loading &&
        !error &&
        applications.length === 0 && (

          <div className="card empty-state">

            <h2>
              No applications yet
            </h2>

            <p>
              You have not applied for any
              opportunities yet.
            </p>

            <Link
              to="/opportunities"
              className="btn btn-primary"
            >
              Explore Opportunities
            </Link>

          </div>

        )}

      {/* =============================================
          APPLICATION LIST
      ============================================== */}

      {!loading &&
        !error &&
        applications.length > 0 && (

          <div className="dashboard-grid">

            {applications.map(
              (application) => {

                const opportunity =
                  application.opportunity || {};

                return (

                  <div
                    key={application._id}
                    className="card"
                  >

                    {/* =====================================
                        HEADER
                    ====================================== */}

                    <div className="card-header">

                      <div>

                        <h3>
                          {opportunity.title ||
                            "Opportunity"}
                        </h3>

                        <p>
                          {opportunity.company ||
                            "Company not available"}
                        </p>

                      </div>

                      <span
                        className={getStatusClass(
                          application.status
                        )}
                      >
                        {application.status ||
                          "pending"}
                      </span>

                    </div>

                    {/* =====================================
                        OPPORTUNITY DETAILS
                    ====================================== */}

                    <p>
                      💼{" "}
                      {opportunity.type ||
                        "Type not specified"}
                    </p>

                    <p>
                      📍{" "}
                      {opportunity.location ||
                        "Location not specified"}
                    </p>

                    <p>
                      🏢{" "}
                      {opportunity.workMode ||
                        "On-site"}
                    </p>

                    <p>
                      📅 Opportunity deadline:{" "}
                      {formatDate(
                        opportunity.deadline
                      )}
                    </p>

                    <p>
                      <strong>
                        Opportunity Status:
                      </strong>{" "}

                      {opportunity.status ||
                        "Not available"}
                    </p>

                    <hr />

                    {/* =====================================
                        APPLICATION DETAILS
                    ====================================== */}

                    <p>
                      📩 Applied on:{" "}
                      {formatDate(
                        application.createdAt
                      )}
                    </p>

                    {/* =====================================
                        COVER LETTER
                    ====================================== */}

                    {application.coverLetter && (

                      <div className="application-message">

                        <strong>
                          Cover Letter:
                        </strong>

                        <p>
                          {application.coverLetter}
                        </p>

                      </div>

                    )}

                    {/* =====================================
                        RESUME
                    ====================================== */}

                    {application.resumeUrl && (

                      <p>

                        <strong>
                          Resume:
                        </strong>{" "}

                        <a
                          href={
                            application.resumeUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Resume
                        </a>

                      </p>

                    )}

                    {/* =====================================
                        ACTIONS
                    ====================================== */}

                    {opportunity._id && (

                      <div className="card-actions">

                        <Link
                          to={`/opportunities/${opportunity._id}`}
                          className="btn btn-secondary"
                        >
                          View Opportunity
                        </Link>

                      </div>

                    )}

                  </div>

                );
              }
            )}

          </div>

        )}

    </div>
  );
}

export default MyApplicationsPage;