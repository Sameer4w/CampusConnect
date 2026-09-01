import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createOpportunity } from "../api/opportunityApi.js";

function PostOpportunityPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    type: "Internship",
    location: "",
    workMode: "On-site",
    salary: "",
    description: "",
    requiredSkills: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const skillsArray = formData.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const opportunityData = {
        title: formData.title,
        company: formData.company,
        type: formData.type,
        location: formData.location,
        workMode: formData.workMode,
        salary: formData.salary,
        description: formData.description,
        requiredSkills: skillsArray,
        deadline: formData.deadline,
      };

      await createOpportunity(opportunityData);

      setSuccess(
        "Opportunity posted successfully!"
      );

      setTimeout(() => {
        navigate("/my-opportunities");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create opportunity"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Post Opportunity</h1>

          <p>
            Create a new internship, placement, or job
            opportunity for CampusConnect students.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* TITLE */}

            <div className="form-group">
              <label htmlFor="title">
                Opportunity Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="Example: Frontend Developer Intern"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* COMPANY */}

            <div className="form-group">
              <label htmlFor="company">
                Company Name *
              </label>

              <input
                id="company"
                name="company"
                type="text"
                placeholder="Example: Google"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            {/* TYPE */}

            <div className="form-group">
              <label htmlFor="type">
                Opportunity Type *
              </label>

              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
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

            {/* LOCATION */}

            <div className="form-group">
              <label htmlFor="location">
                Location *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Example: Bangalore, India"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* WORK MODE */}

            <div className="form-group">
              <label htmlFor="workMode">
                Work Mode *
              </label>

              <select
                id="workMode"
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                required
              >
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

            {/* SALARY */}

            <div className="form-group">
              <label htmlFor="salary">
                Salary / Stipend
              </label>

              <input
                id="salary"
                name="salary"
                type="text"
                placeholder="Example: ₹20,000/month"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            {/* DEADLINE */}

            <div className="form-group">
              <label htmlFor="deadline">
                Application Deadline *
              </label>

              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>

            {/* REQUIRED SKILLS */}

            <div className="form-group">
              <label htmlFor="requiredSkills">
                Required Skills
              </label>

              <input
                id="requiredSkills"
                name="requiredSkills"
                type="text"
                placeholder="React, JavaScript, Node.js"
                value={formData.requiredSkills}
                onChange={handleChange}
              />

              <small>
                Separate skills using commas.
              </small>
            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">
            <label htmlFor="description">
              Opportunity Description *
            </label>

            <textarea
              id="description"
              name="description"
              rows="7"
              placeholder="Describe the role, responsibilities, qualifications, and other important details..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* ACTIONS */}

          <div className="card-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Posting..."
                : "Post Opportunity"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PostOpportunityPage;