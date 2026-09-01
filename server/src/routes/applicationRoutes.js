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
  getApplicationsByOpportunity,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

// =====================================================
// STUDENT APPLICATION ROUTES
// =====================================================

// -----------------------------------------------------
// APPLY TO AN OPPORTUNITY
// -----------------------------------------------------
//
// POST /api/applications
//
// Student only
//

router.post(
  "/",
  protect,
  requireRole("student"),
  applyToOpportunity
);

// -----------------------------------------------------
// GET MY APPLICATIONS
// -----------------------------------------------------
//
// GET /api/applications/my
//
// Student only
//
// Optional:
// ?status=pending
// ?page=1
// ?limit=10
//

router.get(
  "/my",
  protect,
  requireRole("student"),
  getMyApplications
);

// -----------------------------------------------------
// GET MY SINGLE APPLICATION
// -----------------------------------------------------
//
// GET /api/applications/my/:id
//
// Student only
//

router.get(
  "/my/:id",
  protect,
  requireRole("student"),
  getMyApplicationById
);

// -----------------------------------------------------
// WITHDRAW APPLICATION
// -----------------------------------------------------
//
// PUT /api/applications/:id/withdraw
//
// Student owner only
//

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
// GET APPLICATIONS FOR AN OPPORTUNITY
// -----------------------------------------------------
//
// GET /api/applications/opportunity/:opportunityId
//
// Recruiter owner only
//
// Optional:
// ?status=pending
// ?page=1
// ?limit=10
//

router.get(
  "/opportunity/:opportunityId",
  protect,
  requireRole("recruiter"),
  getApplicationsByOpportunity
);

// -----------------------------------------------------
// UPDATE APPLICATION STATUS
// -----------------------------------------------------
//
// PUT /api/applications/:id/status
//
// Recruiter owner only
//

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