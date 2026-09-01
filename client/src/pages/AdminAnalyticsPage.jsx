import {
  useEffect,
  useState,
} from "react";

import {
  getAdminAnalytics,
} from "../api/adminApi.js";

function AdminAnalyticsPage() {
  const [
    analytics,
    setAnalytics,
  ] =
    useState(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    const fetchAnalytics =
      async () => {
        try {
          setIsLoading(true);

          const data =
            await getAdminAnalytics();

          setAnalytics(
            data.analytics
          );
        } catch (
          error
        ) {
          setError(
            error.response
              ?.data
              ?.message ||
              "Failed to load analytics."
          );
        } finally {
          setIsLoading(false);
        }
      };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div
        className="page-container"
      >
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="page-container"
      >
        <div
          className="alert alert-error"
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-container"
    >
      <div
        className="page-header"
      >
        <div>
          <h1>
            Platform Analytics
          </h1>

          <p>
            Insights into
            CampusConnect platform
            activity.
          </p>
        </div>
      </div>

      <section
        className="analytics-section"
      >
        <h2>
          Users by Role
        </h2>

        <div
          className="analytics-grid"
        >
          {analytics
            ?.usersByRole
            ?.map(
              (item) => (
                <div
                  key={item._id}
                  className="stat-card"
                >
                  <h3>
                    {item._id}
                  </h3>

                  <strong>
                    {item.count}
                  </strong>
                </div>
              )
            )}
        </div>
      </section>

      <section
        className="analytics-section"
      >
        <h2>
          Most Active Recruiters
        </h2>

        {analytics
          ?.topRecruiters
          ?.length === 0 ? (
          <p>
            No recruiter data
            available.
          </p>
        ) : (
          <div
            className="admin-users-list"
          >
            {analytics
              ?.topRecruiters
              ?.map(
                (item) => (
                  <div
                    key={item._id}
                    className="admin-user-card"
                  >
                    <div>
                      <h3>
                        {
                          item
                            .recruiter
                            ?.name
                        }
                      </h3>

                      <p>
                        {
                          item
                            .recruiter
                            ?.email
                        }
                      </p>
                    </div>

                    <strong>
                      {
                        item.count
                      }{" "}
                      Opportunities
                    </strong>
                  </div>
                )
              )}
          </div>
        )}
      </section>

    </div>
  );
}

export default AdminAnalyticsPage;