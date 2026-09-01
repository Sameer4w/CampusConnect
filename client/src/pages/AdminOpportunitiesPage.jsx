import {
  useEffect,
  useState,
} from "react";

import {
  getAllAdminOpportunities,
  deleteAdminOpportunity,
} from "../api/adminApi.js";

function AdminOpportunitiesPage() {

  const [
    opportunities,
    setOpportunities,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  // =============================
  // FETCH OPPORTUNITIES
  // =============================

  const fetchOpportunities =
    async () => {

      try {

        setIsLoading(true);
        setError("");

        const params = {
          page: 1,
          limit: 100,
        };

        if (status) {
          params.status = status;
        }

        const data =
          await getAllAdminOpportunities(
            params
          );

        setOpportunities(
          data.opportunities || []
        );

      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Failed to load opportunities."
        );

      } finally {

        setIsLoading(false);

      }

    };

  useEffect(() => {

    fetchOpportunities();

  }, []);

  // =============================
  // DELETE
  // =============================

  const handleDelete =
    async (
      opportunityId,
      title
    ) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeletingId(
          opportunityId
        );

        await deleteAdminOpportunity(
          opportunityId
        );

        setOpportunities(
          (previous) =>
            previous.filter(
              (opportunity) =>
                opportunity._id !==
                opportunityId
            )
        );

      } catch (error) {

        alert(
          error.response?.data?.message ||
          "Failed to delete opportunity."
        );

      } finally {

        setDeletingId("");

      }

    };

  // =============================
  // LOADING
  // =============================

  if (isLoading) {

    return (
      <div className="page-container">

        <h1>
          Manage Opportunities
        </h1>

        <p>
          Loading opportunities...
        </p>

      </div>
    );

  }

  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>
            Manage Opportunities
          </h1>

          <p>
            View and manage all
            opportunities on CampusConnect.
          </p>

        </div>

      </div>

      {error && (

        <div
          className="alert alert-error"
          role="alert"
        >
          {error}
        </div>

      )}

      {/* FILTER */}

      <div className="filter-bar">

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >

          <option value="">
            All Statuses
          </option>

          <option value="open">
            Open
          </option>

          <option value="closed">
            Closed
          </option>

          <option value="draft">
            Draft
          </option>

        </select>

        <button
          type="button"
          className="btn-primary"
          onClick={
            fetchOpportunities
          }
        >
          Filter
        </button>

      </div>

      <p>
        Total opportunities:{" "}

        <strong>
          {opportunities.length}
        </strong>
      </p>

      {/* LIST */}

      {opportunities.length === 0 ? (

        <div className="empty-state">

          <h3>
            No opportunities found
          </h3>

          <p>
            Try changing the filter.
          </p>

        </div>

      ) : (

        <div className="admin-list">

          {opportunities.map(
            (opportunity) => (

              <div
                key={
                  opportunity._id
                }
                className="admin-item-card"
              >

                <div>

                  <h3>
                    {opportunity.title ||
                      "Untitled Opportunity"}
                  </h3>

                  {opportunity.company && (

                    <p>
                      Company:{" "}

                      <strong>
                        {opportunity.company}
                      </strong>
                    </p>

                  )}

                  <p>
                    Status:{" "}

                    <strong>
                      {opportunity.status ||
                        "Unknown"}
                    </strong>
                  </p>

                  {opportunity.location && (

                    <p>
                      Location:{" "}

                      {opportunity.location}
                    </p>

                  )}

                  {opportunity.recruiter && (

                    <p>

                      Posted by:{" "}

                      <strong>

                        {
                          opportunity.recruiter
                            .name
                        }

                      </strong>

                      {" "}(
                        {
                          opportunity.recruiter
                            .email
                        }
                      )

                    </p>

                  )}

                </div>

                <div
                  className="admin-user-actions"
                >

                  <button
                    type="button"
                    className="btn-danger"
                    disabled={
                      deletingId ===
                      opportunity._id
                    }
                    onClick={() =>
                      handleDelete(
                        opportunity._id,
                        opportunity.title ||
                          "this opportunity"
                      )
                    }
                  >

                    {deletingId ===
                    opportunity._id
                      ? "Deleting..."
                      : "Delete"}

                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
}

export default AdminOpportunitiesPage;