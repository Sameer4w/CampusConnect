import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import {
  getOpportunityById,
} from "../api/opportunityApi.js";

import {
  applyForOpportunity,
} from "../api/applicationApi.js";

function OpportunityDetailsPage() {
  const { id } = useParams();

  const { user, isAuthenticated } = useAuth();

  const [opportunity, setOpportunity] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [resumeUrl, setResumeUrl] =
    useState("");

  const [coverLetter, setCoverLetter] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  // =====================================================
  // FETCH OPPORTUNITY
  // =====================================================

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getOpportunityById(id);

        setOpportunity(
          data.opportunity
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load opportunity"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  // =====================================================
  // APPLY
  // =====================================================

  const handleApply = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      setError("");

      setSuccessMessage("");

      const data =
        await applyForOpportunity(id, {
          resumeUrl,
          coverLetter,
        });

      setSuccessMessage(
        "Application submitted successfully!"
      );

      // Update opportunity locally so the
      // Apply form disappears immediately
      setOpportunity((previous) => ({
        ...previous,

        userApplication:
          data.application,
      }));

      setResumeUrl("");

      setCoverLetter("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <p>
            Loading opportunity...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !opportunity) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          {error}
        </div>

        <Link
          to="/opportunities"
          className="btn btn-primary"
        >
          Back to Opportunities
        </Link>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!opportunity) {
    return (
      <div className="page-container">
        <div className="card">
          <h2>
            Opportunity not found
          </h2>

          <Link
            to="/opportunities"
            className="btn btn-primary"
          >
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // APPLICATION STATE
  // =====================================================

  const deadlinePassed =
    new Date(
      opportunity.deadline
    ) < new Date();

  const userApplication =
    opportunity.userApplication;

  const alreadyApplied =
    Boolean(userApplication);

  const canApply =
    isAuthenticated &&
    user?.role === "student" &&
    opportunity.status === "open" &&
    !deadlinePassed &&
    !alreadyApplied;

  const isOwner =
    isAuthenticated &&
    user?.role === "recruiter" &&
    opportunity.recruiter?._id ===
      user?._id;

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
            {opportunity.title}
          </h1>

          <p>
            {opportunity.company}
          </p>
        </div>

        <Link
          to="/opportunities"
          className="btn btn-secondary"
        >
          ← Back
        </Link>

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

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {/* =============================================
          OPPORTUNITY DETAILS
      ============================================== */}

      <div className="card">

        <h2>
          Opportunity Details
        </h2>

        <p>
          <strong>
            Company:
          </strong>{" "}
          {opportunity.company}
        </p>

        <p>
          <strong>
            Type:
          </strong>{" "}
          {opportunity.type}
        </p>

        <p>
          <strong>
            Location:
          </strong>{" "}
          {opportunity.location}
        </p>

        <p>
          <strong>
            Work Mode:
          </strong>{" "}
          {opportunity.workMode ||
            "On-site"}
        </p>

        {opportunity.salary && (
          <p>
            <strong>
              Salary:
            </strong>{" "}
            {opportunity.salary}
          </p>
        )}

        <p>
          <strong>
            Deadline:
          </strong>{" "}
          {formatDate(
            opportunity.deadline
          )}
        </p>

        <p>
          <strong>
            Status:
          </strong>{" "}
          {opportunity.status}
        </p>

        <hr />

        <h3>
          Description
        </h3>

        <p>
          {opportunity.description}
        </p>

        {/* REQUIRED SKILLS */}

        {opportunity.requiredSkills
          ?.length > 0 && (
          <>
            <h3>
              Required Skills
            </h3>

            <div className="skills-list">

              {opportunity.requiredSkills.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="badge"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>
          </>
        )}

      </div>

      {/* =============================================
          NOT LOGGED IN
      ============================================== */}

      {!isAuthenticated && (
        <div className="card">

          <h2>
            Interested in this opportunity?
          </h2>

          <p>
            Please log in as a student
            to apply.
          </p>

          <Link
            to="/login"
            className="btn btn-primary"
          >
            Log In to Apply
          </Link>

        </div>
      )}

      {/* =============================================
          DEADLINE PASSED
      ============================================== */}

      {opportunity.status !== "open" && (
        <div className="alert alert-error">
          This opportunity is currently closed.
        </div>
      )}

      
      {/* =============================================
          ALREADY APPLIED
      ============================================== */}

      {isAuthenticated &&
        user?.role === "student" &&
        alreadyApplied && (
          <div className="card">

            <h2>
              Application Submitted
            </h2>

            <p>
              You have already applied
              for this opportunity.
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {userApplication.status}
            </p>

            <Link
              to="/applications"
              className="btn btn-primary"
            >
              View My Applications
            </Link>

          </div>
        )}

      {/* =============================================
          APPLY FORM
      ============================================== */}

      {canApply && (
        <div className="card">

          <h2>
            Apply for this Opportunity
          </h2>

          <form
            onSubmit={handleApply}
          >

            {/* RESUME */}

            <div className="form-group">

              <label htmlFor="resumeUrl">
                Resume URL
              </label>

              <input
                id="resumeUrl"
                type="url"
                placeholder="https://example.com/my-resume.pdf"
                value={resumeUrl}
                onChange={(event) =>
                  setResumeUrl(
                    event.target.value
                  )
                }
              />

            </div>

            {/* COVER LETTER */}

            <div className="form-group">

              <label htmlFor="coverLetter">
                Cover Letter
              </label>

              <textarea
                id="coverLetter"
                rows="8"
                placeholder="Tell the recruiter why you are a good fit..."
                value={coverLetter}
                onChange={(event) =>
                  setCoverLetter(
                    event.target.value
                  )
                }
                maxLength="3000"
              />

            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Apply Now"}
            </button>

          </form>

        </div>
      )}

      {/* =============================================
          RECRUITER OWNER VIEW
      ============================================== */}

      {isOwner && (
        <div className="card">

          <h2>
            Manage Opportunity
          </h2>

          <p>
            <strong>
              Applications:
            </strong>{" "}
            {opportunity.applicationCount || 0}
          </p>

          <Link
            to={`/recruiter/applications?opportunity=${opportunity._id}`}
            className="btn btn-primary"
          >
            View Applications
          </Link>

        </div>
      )}

      {/* =============================================
          OTHER RECRUITER VIEW
      ============================================== */}

      {isAuthenticated &&
        user?.role === "recruiter" &&
        !isOwner && (
          <div className="card">

            <h2>
              Recruiter View
            </h2>

            <p>
              Recruiters cannot apply
              for opportunities.
            </p>

          </div>
        )}

    </div>
  );
}

export default OpportunityDetailsPage;