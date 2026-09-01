const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  applyToOpportunity,
  getMyApplications,
  getMyApplicationById,
  withdrawApplication,

  // Recruiter
  getRecruiterApplications,
  getApplicationsByOpportunity,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

// =====================================================
// STUDENT APPLICATION ROUTES
// =====================================================

// -----------------------------------------------------
// APPLY TO AN OPPORTUNITY
// POST /api/applications
// -----------------------------------------------------

router.post(
  "/",
  protect,
  requireRole("student"),
  applyToOpportunity
);

// -----------------------------------------------------
// GET MY APPLICATIONS
// GET /api/applications/my
// -----------------------------------------------------

router.get(
  "/my",
  protect,
  requireRole("student"),
  getMyApplications
);

// -----------------------------------------------------
// GET MY SINGLE APPLICATION
// GET /api/applications/my/:id
// -----------------------------------------------------

router.get(
  "/my/:id",
  protect,
  requireRole("student"),
  getMyApplicationById
);

// -----------------------------------------------------
// WITHDRAW APPLICATION
// PUT /api/applications/:id/withdraw
// -----------------------------------------------------

router.put(
  "/:id/withdraw",
  protect,
  requireRole("student"),
  withdrawApplication
);

// =====================================================
// RECRUITER APPLICATION ROUTES
// =====================================================

// -----------------------------------------------------
// GET ALL APPLICATIONS FOR RECRUITER
//
// GET /api/applications/recruiter
//
// Returns applications from ALL opportunities
// created by the currently logged-in recruiter.
//
// Optional:
// ?status=pending
// ?page=1
// ?limit=10
// -----------------------------------------------------

router.get(
  "/recruiter",
  protect,
  requireRole("recruiter"),
  getRecruiterApplications
);

// -----------------------------------------------------
// GET APPLICATIONS FOR ONE OPPORTUNITY
//
// GET /api/applications/opportunity/:opportunityId
// -----------------------------------------------------

router.get(
  "/opportunity/:opportunityId",
  protect,
  requireRole("recruiter"),
  getApplicationsByOpportunity
);

// -----------------------------------------------------
// UPDATE APPLICATION STATUS
//
// PUT /api/applications/:id/status
// -----------------------------------------------------

router.put(
  "/:id/status",
  protect,
  requireRole("recruiter"),
  updateApplicationStatus
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;