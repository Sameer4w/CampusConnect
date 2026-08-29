const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileController");

const router = express.Router();

// =====================================================
// USER PROFILE
// =====================================================

// GET /api/users/profile
// Get the currently authenticated user's profile.
//
// Both students and admins can access the profile page because
// the frontend allows these two roles to use /profile.
router.get(
  "/profile",
  protect,
  requireRole("student", "admin"),
  getMyProfile
);

// PUT /api/users/profile
// Update the currently authenticated user's profile.
router.put(
  "/profile",
  protect,
  requireRole("student", "admin"),
  updateMyProfile
);

module.exports = router;