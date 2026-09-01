const express = require("express");

const router = express.Router();

const {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  getMyOpportunities,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunityStats,
} = require("../controllers/opportunityController");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC / AUTHENTICATED OPPORTUNITY ROUTES
// =====================================================

// GET /api/opportunities
// Get all open opportunities
// Supports search, filters and pagination
router.get(
  "/",
  protect,
  getOpportunities
);

// =====================================================
// RECRUITER ROUTES
// =====================================================

// GET /api/opportunities/my
// Get opportunities created by logged-in recruiter
router.get(
  "/my",
  protect,
  requireRole("recruiter"),
  getMyOpportunities
);

// GET /api/opportunities/stats
// Get logged-in recruiter's opportunity statistics
router.get(
  "/stats",
  protect,
  requireRole("recruiter"),
  getMyOpportunityStats
);

// =====================================================
// SINGLE OPPORTUNITY
// =====================================================

// GET /api/opportunities/:id
// Get a single opportunity
router.get(
  "/:id",
  protect,
  getOpportunityById
);

// =====================================================
// RECRUITER ONLY ACTIONS
// =====================================================

// POST /api/opportunities
// Create opportunity
router.post(
  "/",
  protect,
  requireRole("recruiter"),
  createOpportunity
);

// PUT /api/opportunities/:id
// Update own opportunity
router.put(
  "/:id",
  protect,
  requireRole("recruiter"),
  updateOpportunity
);

// DELETE /api/opportunities/:id
// Delete own opportunity
router.delete(
  "/:id",
  protect,
  requireRole("recruiter"),
  deleteOpportunity
);

module.exports = router;