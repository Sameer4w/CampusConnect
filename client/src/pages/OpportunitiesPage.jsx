import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOpportunities } from "../api/opportunityApi.js";
import { useAuth } from "../context/AuthContext.jsx";

function OpportunitiesPage() {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [workModeFilter, setWorkModeFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH OPPORTUNITIES
  // =====================================================

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOpportunities();

        setOpportunities(data.opportunities || []);
        setFilteredOpportunities(data.opportunities || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load opportunities"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // =====================================================
  // FILTER OPPORTUNITIES
  // =====================================================

  useEffect(() => {
    let filtered = [...opportunities];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      filtered = filtered.filter((opportunity) => {
        return (
          opportunity.title
            ?.toLowerCase()
            .includes(searchValue) ||
          opportunity.company
            ?.toLowerCase()
            .includes(searchValue) ||
          opportunity.location
            ?.toLowerCase()
            .includes(searchValue) ||
          opportunity.requiredSkills?.some((skill) =>
            skill.toLowerCase().includes(searchValue)
          )
        );
      });
    }

    if (typeFilter !== "All") {
      filtered = filtered.filter(
        (opportunity) =>
          opportunity.type === typeFilter
      );
    }

    if (workModeFilter !== "All") {
      filtered = filtered.filter(
        (opportunity) =>
          opportunity.workMode === workModeFilter
      );
    }

    setFilteredOpportunities(filtered);
  }, [
    search,
    typeFilter,
    workModeFilter,
    opportunities,
  ]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString();
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Opportunities</h1>

          <p>
            Explore internships, jobs, and career
            opportunities.
          </p>
        </div>

        {user?.role === "recruiter" && (
          <Link
            to="/opportunities/post"
            className="btn btn-primary"
          >
            + Post Opportunity
          </Link>
        )}
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Search</label>

            <input
              type="text"
              placeholder="Search title, company, skills..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Opportunity Type</label>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="All">All Types</option>

              <option value="Internship">
                Internship
              </option>

              <option value="Full-time">
                Full-time
              </option>

              <option value="Part-time">
                Part-time
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Work Mode</label>

            <select
              value={workModeFilter}
              onChange={(event) =>
                setWorkModeFilter(event.target.value)
              }
            >
              <option value="All">All Work Modes</option>

              <option value="On-site">
                On-site
              </option>

              <option value="Remote">
                Remote
              </option>

              <option value="Hybrid">
                Hybrid
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="card">
          <p>Loading opportunities...</p>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {!loading && !error && (
        <>
          <div className="page-header">
            <h2>
              Available Opportunities (
              {filteredOpportunities.length})
            </h2>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="card empty-state">
              <h3>No opportunities found</h3>

              <p>
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {filteredOpportunities.map(
                (opportunity) => (
                  <div
                    key={opportunity._id}
                    className="card"
                  >
                    <div className="card-header">
                      <div>
                        <h3>
                          {opportunity.title}
                        </h3>

                        <p>
                          {opportunity.company}
                        </p>
                      </div>

                      <span className="badge">
                        {opportunity.type}
                      </span>
                    </div>

                    <p>
                      📍 {opportunity.location}
                    </p>

                    <p>
                      💼{" "}
                      {opportunity.workMode ||
                        "On-site"}
                    </p>

                    {opportunity.salary && (
                      <p>
                        💰 {opportunity.salary}
                      </p>
                    )}

                    <p>
                      📅 Apply before:{" "}
                      {formatDate(
                        opportunity.deadline
                      )}
                    </p>

                    {opportunity.requiredSkills
                      ?.length > 0 && (
                      <div className="skills-list">
                        {opportunity.requiredSkills
                          .slice(0, 5)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="badge"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="card-actions">
                      <Link
                        to={`/opportunities/${opportunity._id}`}
                        className="btn btn-primary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OpportunitiesPage;