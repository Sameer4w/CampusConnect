const express =
  require("express");

const {
  protect,
  requireRole,
} =
  require("../middleware/authMiddleware");

const {
  getAdminDashboard,

  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,

  getAllJobs,
  deleteJob,

  getAllOpportunities,
  deleteOpportunity,

  getAllEvents,
  deleteEvent,
} =
  require(
    "../controllers/adminController"
  );

// =====================================================
// ROUTER
// =====================================================

const router =
  express.Router();

// =====================================================
// ADMIN AUTHORIZATION
// =====================================================

// Every route below requires authentication
// and the admin role.

router.use(
  protect
);

router.use(
  requireRole(
    "admin"
  )
);

// =====================================================
// DASHBOARD
// =====================================================

// GET /api/admin/dashboard

router.get(
  "/dashboard",
  getAdminDashboard
);

// =====================================================
// USER MANAGEMENT
// =====================================================

// GET /api/admin/users

router.get(
  "/users",
  getAllUsers
);

// GET /api/admin/users/:id

router.get(
  "/users/:id",
  getUserById
);

// PUT /api/admin/users/:id/status

router.put(
  "/users/:id/status",
  updateUserStatus
);

// PUT /api/admin/users/:id/role

router.put(
  "/users/:id/role",
  updateUserRole
);

// =====================================================
// JOB MANAGEMENT
// =====================================================

// GET /api/admin/jobs

router.get(
  "/jobs",
  getAllJobs
);

// DELETE /api/admin/jobs/:id

router.delete(
  "/jobs/:id",
  deleteJob
);

// =====================================================
// OPPORTUNITY MANAGEMENT
// =====================================================

// GET /api/admin/opportunities

router.get(
  "/opportunities",
  getAllOpportunities
);

// DELETE /api/admin/opportunities/:id

router.delete(
  "/opportunities/:id",
  deleteOpportunity
);

// =====================================================
// EVENT MANAGEMENT
// =====================================================

// GET /api/admin/events

router.get(
  "/events",
  getAllEvents
);

// DELETE /api/admin/events/:id

router.delete(
  "/events/:id",
  deleteEvent
);

// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;