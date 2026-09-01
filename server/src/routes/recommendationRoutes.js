const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getJobRecommendations,
  getOpportunityRecommendations,
  getAllRecommendations,
} = require("../controllers/recommendationController");

// =====================================================
// ROUTER
// =====================================================

const router = express.Router();

// =====================================================
// GET ALL RECOMMENDATIONS
// =====================================================

// GET /api/recommendations
//
// Returns both:
// - Job recommendations
// - Opportunity recommendations
//
// Student only.
//
// Optional:
// ?limit=10

router.get(
  "/",
  protect,
  requireRole("student"),
  getAllRecommendations
);

// =====================================================
// GET JOB RECOMMENDATIONS
// =====================================================

// GET /api/recommendations/jobs
//
// Returns recommended jobs for the
// currently logged-in student.
//
// Student only.
//
// Optional:
// ?limit=10

router.get(
  "/jobs",
  protect,
  requireRole("student"),
  getJobRecommendations
);

// =====================================================
// GET OPPORTUNITY RECOMMENDATIONS
// =====================================================

// GET /api/recommendations/opportunities
//
// Returns recommended opportunities for the
// currently logged-in student.
//
// Student only.
//
// Optional:
// ?limit=10

router.get(
  "/opportunities",
  protect,
  requireRole("student"),
  getOpportunityRecommendations
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;