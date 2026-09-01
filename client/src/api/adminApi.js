import api from "./apiClient.js";

// =====================================================
// ADMIN DASHBOARD
// =====================================================

// GET /api/admin/dashboard

export const getAdminDashboard =
  async () => {

    const response =
      await api.get(
        "/admin/dashboard"
      );

    return response.data;
  };

// =====================================================
// USER MANAGEMENT
// =====================================================

// GET /api/admin/users

export const getAllUsers =
  async (
    params = {}
  ) => {

    const response =
      await api.get(
        "/admin/users",
        {
          params,
        }
      );

    return response.data;
  };

// GET /api/admin/users/:id

export const getUserById =
  async (
    userId
  ) => {

    const response =
      await api.get(
        `/admin/users/${userId}`
      );

    return response.data;
  };

// PUT /api/admin/users/:id/status

export const updateUserStatus =
  async (
    userId,
    isActive
  ) => {

    const response =
      await api.put(
        `/admin/users/${userId}/status`,
        {
          isActive,
        }
      );

    return response.data;
  };

// PUT /api/admin/users/:id/role

export const updateUserRole =
  async (
    userId,
    role
  ) => {

    const response =
      await api.put(
        `/admin/users/${userId}/role`,
        {
          role,
        }
      );

    return response.data;
  };

// =====================================================
// JOB MANAGEMENT
// =====================================================

// GET /api/admin/jobs

export const getAllJobs =
  async (
    params = {}
  ) => {

    const response =
      await api.get(
        "/admin/jobs",
        {
          params,
        }
      );

    return response.data;
  };

// DELETE /api/admin/jobs/:id

export const deleteJob =
  async (
    jobId
  ) => {

    const response =
      await api.delete(
        `/admin/jobs/${jobId}`
      );

    return response.data;
  };

// =====================================================
// OPPORTUNITY MANAGEMENT
// =====================================================

// GET /api/admin/opportunities

export const getAllAdminOpportunities =
  async (
    params = {}
  ) => {

    const response =
      await api.get(
        "/admin/opportunities",
        {
          params,
        }
      );

    return response.data;
  };

// DELETE /api/admin/opportunities/:id

export const deleteAdminOpportunity =
  async (
    opportunityId
  ) => {

    const response =
      await api.delete(
        `/admin/opportunities/${opportunityId}`
      );

    return response.data;
  };

// =====================================================
// EVENT MANAGEMENT
// =====================================================

// GET /api/admin/events

export const getAllEvents =
  async (
    params = {}
  ) => {

    const response =
      await api.get(
        "/admin/events",
        {
          params,
        }
      );

    return response.data;
  };

// DELETE /api/admin/events/:id

export const deleteEvent =
  async (
    eventId
  ) => {

    const response =
      await api.delete(
        `/admin/events/${eventId}`
      );

    return response.data;
  };