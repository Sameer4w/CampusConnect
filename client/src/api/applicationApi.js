import api from "./apiClient.js";

// =====================================================
// APPLICATION API
// =====================================================

// POST /api/applications/:opportunityId
// Student applies for an opportunity
export const applyForOpportunity = async (
  opportunityId,
  applicationData
) => {
  const response = await api.post(
    `/applications/${opportunityId}`,
    applicationData
  );

  return response.data;
};

// GET /api/applications/my
// Get logged-in student's applications
export const getMyApplications = async () => {
  const response = await api.get("/applications/my");

  return response.data;
};

// GET /api/applications/recruiter
// Get all applications received by logged-in recruiter
export const getRecruiterApplications = async () => {
  const response = await api.get(
    "/applications/recruiter"
  );

  return response.data;
};

// GET /api/applications/opportunity/:opportunityId
// Get applications for one opportunity
export const getOpportunityApplications = async (
  opportunityId
) => {
  const response = await api.get(
    `/applications/opportunity/${opportunityId}`
  );

  return response.data;
};

// PUT /api/applications/:applicationId/status
// Recruiter updates application status
export const updateApplicationStatus = async (
  applicationId,
  status
) => {
  const response = await api.put(
    `/applications/${applicationId}/status`,
    { status }
  );

  return response.data;
};