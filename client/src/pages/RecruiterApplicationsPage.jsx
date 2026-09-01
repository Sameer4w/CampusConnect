import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  getRecruiterApplications,
  getOpportunityApplications,
  updateApplicationStatus,
} from "../api/applicationApi.js";

function RecruiterApplicationsPage() {
  const [searchParams] = useSearchParams();

  const opportunityId =
    searchParams.get("opportunity");

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState("");

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        let data;

        // If opportunity ID exists in URL,
        // fetch applications only for that opportunity
        if (opportunityId) {
          data =
            await getOpportunityApplications(
              opportunityId
            );
        } else {
          // Otherwise fetch all recruiter applications
          data =
            await getRecruiterApplications();
        }

        setApplications(
          data.applications || []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load applications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [opportunityId]);

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const handleStatusChange = async (
  applicationId,
  status
) => {
  const currentApplication =
    applications.find(
      (application) =>
        application._id === applicationId
    );

  if (
    currentApplication?.status === status
  ) {
    return;
  }

  try {
    setUpdatingId(applicationId);

    setError("");
    setMessage("");

    const data =
      await updateApplicationStatus(
        applicationId,
        status
      );

    setApplications(
      (previousApplications) =>
        previousApplications.map(
          (application) =>
            application._id === applicationId
              ? {
                  ...application,
                  status:
                    data.application.status,
                }
              : application
        )
    );

    setMessage(
      "Application status updated successfully."
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to update application status"
    );
  } finally {
    setUpdatingId("");
  }
};

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
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return `application-status status-${status.toLowerCase()}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <p>
            Loading applications...
          </p>
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
      ============================================== */}

      <div className="page-header">

        <div>
          <h1>
            Applications
          </h1>

          <p>
            {opportunityId
              ? "Review applications for this opportunity."
              : "Review and manage student applications for your opportunities."}
          </p>
        </div>

        {opportunityId && (
          <Link
            to="/recruiter/applications"
            className="btn btn-secondary"
          >
            View All Applications
          </Link>
        )}

      </div>

      {/* =============================================
          ERROR
      ============================================== */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* =============================================
          SUCCESS
      ============================================== */}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* =============================================
          EMPTY STATE
      ============================================== */}

      {applications.length === 0 && (
        <div className="card empty-state">

          <h2>
            No applications found
          </h2>

          <p>
            There are currently no student
            applications to display.
          </p>

          <Link
            to="/my-opportunities"
            className="btn btn-primary"
          >
            View My Opportunities
          </Link>

        </div>
      )}

      {/* =============================================
          APPLICATION LIST
      ============================================== */}

      {applications.length > 0 && (

        <div className="dashboard-grid">

          {applications.map(
            (application) => {

              const student =
                application.student || {};

              const opportunity =
                application.opportunity || {};

              return (

                <div
                  key={application._id}
                  className="card"
                >

                  {/* =====================================
                      STUDENT HEADER
                  ====================================== */}

                  <div className="card-header">

                    <div>

                      <h3>
                        {student.name ||
                          "Student"}
                      </h3>

                      <p>
                        {student.email ||
                          "Email not available"}
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
                      OPPORTUNITY
                  ====================================== */}

                  <div className="application-message">

                    <strong>
                      Applied Opportunity:
                    </strong>

                    <p>
                      {opportunity.title ||
                        "Opportunity"}
                    </p>

                    <p>
                      {opportunity.company ||
                        ""}
                    </p>

                  </div>

                  {/* =====================================
                      STUDENT INFO
                  ====================================== */}

                  <p>
                    📅 Applied on:{" "}
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
                      STATUS UPDATE
                  ====================================== */}

                  <div className="form-group">

                    <label>
                      Application Status
                    </label>

                    <select
                      value={
                        application.status ||
                        "pending"
                      }
                      disabled={
                        updatingId ===
                        application._id
                      }
                      onChange={(event) =>
                        handleStatusChange(
                          application._id,
                          event.target.value
                        )
                      }
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="reviewing">
                        Reviewing
                      </option>

                      <option value="shortlisted">
                        Shortlisted
                      </option>

                      <option value="accepted">
                        Accepted
                      </option>

                      <option value="rejected">
                        Rejected
                      </option>

                    </select>

                  </div>

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

export default RecruiterApplicationsPage;