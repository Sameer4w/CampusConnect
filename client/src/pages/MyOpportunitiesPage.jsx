import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyOpportunities,
  deleteOpportunity,
  updateOpportunity,
} from "../api/opportunityApi.js";

function MyOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH OPPORTUNITIES
  // =====================================================

  const fetchMyOpportunities = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOpportunities();

      setOpportunities(data.opportunities || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load your opportunities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOpportunities();
  }, []);

  // =====================================================
  // DELETE OPPORTUNITY
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this opportunity? This will also delete all applications for this opportunity."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      await deleteOpportunity(id);

      setOpportunities((previousOpportunities) =>
        previousOpportunities.filter(
          (opportunity) => opportunity._id !== id
        )
      );

      setMessage("Opportunity deleted successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete opportunity"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // OPEN / CLOSE OPPORTUNITY
  // =====================================================

  const handleStatusChange = async (opportunity) => {
    const currentStatus = opportunity.status || "open";

    const newStatus =
      currentStatus === "open"
        ? "closed"
        : "open";

    try {
      setUpdatingId(opportunity._id);

      setError("");
      setMessage("");

      await updateOpportunity(
        opportunity._id,
        {
          status: newStatus,
        }
      );

      setOpportunities((previousOpportunities) =>
        previousOpportunities.map((item) =>
          item._id === opportunity._id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      setMessage(
        `Opportunity ${
          newStatus === "open"
            ? "opened"
            : "closed"
        } successfully.`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update opportunity status"
      );
    } finally {
      setUpdatingId(null);
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
  // PAGE
  // =====================================================

  return (
    <div className="page-container">

      <div className="page-header">

        <div>
          <h1>
            My Opportunities
          </h1>

          <p>
            Manage the internships and jobs
            you have posted.
          </p>
        </div>

        <Link
          to="/opportunities/post"
          className="btn btn-primary"
        >
          + Post Opportunity
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="card">
          <p>
            Loading your opportunities...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        opportunities.length === 0 && (
          <div className="card empty-state">

            <h2>
              No opportunities posted yet
            </h2>

            <p>
              Start connecting with students
              by posting your first opportunity.
            </p>

            <Link
              to="/opportunities/post"
              className="btn btn-primary"
            >
              Post Your First Opportunity
            </Link>

          </div>
        )}

      {/* OPPORTUNITIES */}

      {!loading &&
        opportunities.length > 0 && (
          <div className="dashboard-grid">

            {opportunities.map(
              (opportunity) => {

                const status =
                  opportunity.status || "open";

                const isUpdating =
                  updatingId ===
                  opportunity._id;

                const isDeleting =
                  deletingId ===
                  opportunity._id;

                return (
                  <div
                    key={opportunity._id}
                    className="card"
                  >

                    {/* HEADER */}

                    <div className="card-header">

                      <div>
                        <h3>
                          {opportunity.title}
                        </h3>

                        <p>
                          {opportunity.company}
                        </p>
                      </div>

                      <span
                        className={`application-status status-${status}`}
                      >
                        {status}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <p>
                      💼{" "}
                      {opportunity.type}
                    </p>

                    <p>
                      📍{" "}
                      {opportunity.location}
                    </p>

                    <p>
                      🏢{" "}
                      {opportunity.workMode ||
                        "On-site"}
                    </p>

                    {opportunity.salary && (
                      <p>
                        💰{" "}
                        {opportunity.salary}
                      </p>
                    )}

                    <p>
                      📅 Deadline:{" "}
                      {formatDate(
                        opportunity.deadline
                      )}
                    </p>

                    {/* SKILLS */}

                    {opportunity.requiredSkills
                      ?.length > 0 && (
                      <div className="skills-list">

                        {opportunity.requiredSkills
                          .slice(0, 5)
                          .map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={index}
                                className="badge"
                              >
                                {skill}
                              </span>
                            )
                          )}

                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="card-actions">

                      <Link
                        to={`/opportunities/${opportunity._id}`}
                        className="btn btn-secondary"
                      >
                        View
                      </Link>

                      <Link
                        to={`/opportunities/${opportunity._id}/edit`}
                        className="btn btn-primary"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={
                          isUpdating ||
                          isDeleting
                        }
                        onClick={() =>
                          handleStatusChange(
                            opportunity
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : status === "open"
                          ? "Close"
                          : "Open"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={
                          isDeleting ||
                          isUpdating
                        }
                        onClick={() =>
                          handleDelete(
                            opportunity._id
                          )
                        }
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </div>
  );
}

export default MyOpportunitiesPage;