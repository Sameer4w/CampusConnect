import api from "./apiClient.js";

// =====================================================
// OPPORTUNITY API
// =====================================================

// GET /api/opportunities
// Get all open opportunities
export const getOpportunities = async () => {
  const response = await api.get("/opportunities");
  return response.data;
};

// GET /api/opportunities/:id
// Get one opportunity
export const getOpportunityById = async (id) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};

// GET /api/opportunities/my
// Get opportunities created by logged-in recruiter
export const getMyOpportunities = async () => {
  const response = await api.get("/opportunities/my");
  return response.data;
};

// POST /api/opportunities
// Recruiter creates an opportunity
export const createOpportunity = async (opportunityData) => {
  const response = await api.post(
    "/opportunities",
    opportunityData
  );

  return response.data;
};

// PUT /api/opportunities/:id
// Recruiter updates own opportunity
export const updateOpportunity = async (
  id,
  opportunityData
) => {
  const response = await api.put(
    `/opportunities/${id}`,
    opportunityData
  );

  return response.data;
};

// DELETE /api/opportunities/:id
// Recruiter deletes own opportunity
export const deleteOpportunity = async (id) => {
  const response = await api.delete(
    `/opportunities/${id}`
  );

  return response.data;
};