const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getAdminDashboard,

  // Users
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,

  // Jobs
  getAllJobs,
  deleteJob,

  // Opportunities
  getAllOpportunities,
  deleteOpportunity,

  // Events
  getAllEvents,
  deleteEvent,
} = require(
  "../controllers/adminController"
);

// =====================================================
// ROUTER
// =====================================================

const router = express.Router();

// =====================================================
// ADMIN AUTHORIZATION
// =====================================================

// Every route below requires authentication
router.use(protect);

// Every route below requires admin role
router.use(
  requireRole("admin")
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
// Query:
// ?page=1
// ?limit=20
// ?search=name
// ?role=student
// ?isActive=true

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
// Query:
// ?page=1
// ?limit=20
// ?status=active

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
// Query:
// ?page=1
// ?limit=20
// ?status=open

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
// Query:
// ?page=1
// ?limit=20
// ?status=published

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

module.exports = router;