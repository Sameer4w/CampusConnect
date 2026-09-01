import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import {
  getOpportunityById,
  updateOpportunity,
} from "../api/opportunityApi.js";

function EditOpportunityPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  // =====================================================
  // FORM STATE
  // =====================================================

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

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [authorized, setAuthorized] = useState(false);

  // =====================================================
  // FETCH OPPORTUNITY
  // =====================================================

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOpportunityById(id);

        const opportunity = data?.opportunity;

        if (!opportunity) {
          throw new Error(
            "Opportunity not found"
          );
        }

        // ===============================================
        // CHECK OWNERSHIP
        // ===============================================

        const recruiterId =
          opportunity.recruiter?._id ||
          opportunity.recruiter;

        const currentUserId =
          user?._id ||
          user?.id;

        const isOwner =
          recruiterId &&
          currentUserId &&
          String(recruiterId) ===
            String(currentUserId);

        setAuthorized(isOwner);

        // Don't populate form for unauthorized users
        if (!isOwner) {
          return;
        }

        // ===============================================
        // POPULATE FORM
        // ===============================================

        setFormData({
          title:
            opportunity.title || "",

          company:
            opportunity.company || "",

          type:
            opportunity.type ||
            "Internship",

          location:
            opportunity.location || "",

          workMode:
            opportunity.workMode ||
            "On-site",

          salary:
            opportunity.salary || "",

          description:
            opportunity.description || "",

          requiredSkills:
            Array.isArray(
              opportunity.requiredSkills
            )
              ? opportunity.requiredSkills.join(
                  ", "
                )
              : "",

          deadline:
            opportunity.deadline
              ? new Date(
                  opportunity.deadline
                )
                  .toISOString()
                  .split("T")[0]
              : "",
        });

      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load opportunity"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchOpportunity();
    }
  }, [
    id,
    user?._id,
    user?.id,
  ]);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =====================================================
  // PROCESS REQUIRED SKILLS
  // =====================================================

  const getRequiredSkills = () => {
    const skills = formData.requiredSkills
      .split(",")
      .map((skill) =>
        skill.trim()
      )
      .filter(
        (skill) =>
          skill.length > 0
      );

    // Remove duplicate skills
    return [
      ...new Map(
        skills.map((skill) => [
          skill.toLowerCase(),
          skill,
        ])
      ).values(),
    ];
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (saving || !authorized) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const requiredSkills =
        getRequiredSkills();

      const payload = {
        title:
          formData.title.trim(),

        company:
          formData.company.trim(),

        type:
          formData.type,

        location:
          formData.location.trim(),

        workMode:
          formData.workMode,

        salary:
          formData.salary.trim(),

        description:
          formData.description.trim(),

        requiredSkills,

        deadline:
          formData.deadline,
      };

      await updateOpportunity(
        id,
        payload
      );

      navigate(
        "/my-opportunities",
        {
          replace: true,
        }
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update opportunity"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="card auth-loading">
          <div className="spinner" />

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

  if (error) {
    return (
      <div className="page-container">

        <div className="alert alert-error">
          {error}
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            navigate(
              "/my-opportunities"
            )
          }
        >
          ← Back to My Opportunities
        </button>

      </div>
    );
  }

  // =====================================================
  // ACCESS DENIED
  // =====================================================

  if (!authorized) {
    return (
      <div className="page-container">

        <div className="card">

          <h2>
            Access Denied
          </h2>

          <p>
            You are not authorized to
            edit this opportunity.
          </p>

          <div className="card-actions">

            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                navigate(
                  "/my-opportunities"
                )
              }
            >
              Back to My Opportunities
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>
            Edit Opportunity
          </h1>

          <p>
            Update the details of your
            opportunity.
          </p>

        </div>

      </div>

      <div className="card">

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* TITLE */}

            <div className="form-group">

              <label htmlFor="title">
                Opportunity Title *
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
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
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                maxLength={200}
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
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                maxLength={200}
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
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. ₹20,000/month"
              />

            </div>

            {/* DEADLINE */}

            <div className="form-group">

              <label htmlFor="deadline">
                Application Deadline *
              </label>

              <input
                id="deadline"
                type="date"
                name="deadline"
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
                type="text"
                name="requiredSkills"
                value={
                  formData.requiredSkills
                }
                onChange={handleChange}
                maxLength={500}
                placeholder="React, Java, MongoDB"
              />

              <small className="field-hint">
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
              rows={8}
              value={
                formData.description
              }
              onChange={handleChange}
              maxLength={5000}
              required
            />

          </div>

          {/* ACTIONS */}

          <div className="card-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                navigate(
                  "/my-opportunities"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner spinner-sm spinner-inline" />
                  {" "}
                  Saving...
                </>
              ) : (
                "💾 Save Changes"
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditOpportunityPage;