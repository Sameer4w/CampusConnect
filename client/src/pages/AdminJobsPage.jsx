import {
  useEffect,
  useState,
} from "react";

import {
  getAllJobs,
  deleteJob,
} from "../api/adminApi.js";

function AdminJobsPage() {

  const [
    jobs,
    setJobs,
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

  const fetchJobs =
    async () => {

      try {

        setIsLoading(true);
        setError("");

        const params = {
          page: 1,
          limit: 100,
        };

        if (status) {
          params.status =
            status;
        }

        const data =
          await getAllJobs(
            params
          );

        setJobs(
          data.jobs || []
        );

      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Failed to load jobs."
        );

      } finally {

        setIsLoading(false);

      }

    };

  useEffect(() => {

    fetchJobs();

  }, []);

  const handleDelete =
    async (
      jobId,
      title
    ) => {

      const confirmed =
        window.confirm(
          `Delete "${title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeletingId(jobId);

        await deleteJob(jobId);

        setJobs(
          (previous) =>
            previous.filter(
              (job) =>
                job._id !==
                jobId
            )
        );

      } catch (error) {

        alert(
          error.response?.data?.message ||
          "Failed to delete job."
        );

      } finally {

        setDeletingId("");

      }

    };

  if (isLoading) {

    return (
      <div className="page-container">

        <h1>
          Manage Jobs
        </h1>

        <p>
          Loading jobs...
        </p>

      </div>
    );

  }

  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>
            Manage Jobs
          </h1>

          <p>
            View and manage all
            jobs posted on CampusConnect.
          </p>

        </div>

      </div>

      {error && (

        <div
          className="alert alert-error"
        >
          {error}
        </div>

      )}

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

          <option value="active">
            Active
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
            fetchJobs
          }
        >
          Filter
        </button>

      </div>

      <p>
        Total jobs:{" "}

        <strong>
          {jobs.length}
        </strong>
      </p>

      {jobs.length === 0 ? (

        <div className="empty-state">

          <h3>
            No jobs found
          </h3>

        </div>

      ) : (

        <div className="admin-list">

          {jobs.map(
            (job) => (

              <div
                key={job._id}
                className="admin-item-card"
              >

                <div>

                  <h3>
                    {job.title ||
                      "Untitled Job"}
                  </h3>

                  {job.company && (

                    <p>
                      Company:{" "}

                      <strong>
                        {job.company}
                      </strong>
                    </p>

                  )}

                  <p>
                    Status:{" "}

                    <strong>
                      {job.status ||
                        "Unknown"}
                    </strong>
                  </p>

                  {job.location && (

                    <p>
                      Location:{" "}

                      {job.location}
                    </p>

                  )}

                  {job.recruiter && (

                    <p>
                      Posted by:{" "}

                      <strong>
                        {
                          job.recruiter
                            .name
                        }
                      </strong>

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
                      job._id
                    }
                    onClick={() =>
                      handleDelete(
                        job._id,
                        job.title ||
                          "this job"
                      )
                    }
                  >

                    {deletingId ===
                    job._id
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

export default AdminJobsPage;