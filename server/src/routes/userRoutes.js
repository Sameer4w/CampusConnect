const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
} = require(
  "../controllers/profileController"
);

const {
  uploadResume: uploadResumeMiddleware,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// STUDENT PROFILE ROUTES
// =====================================================

// GET /api/users/profile
// Get the currently authenticated student's profile.

router.get(
  "/profile",
  protect,
  requireRole("student"),
  getMyProfile
);

// =====================================================
// UPDATE STUDENT PROFILE
// =====================================================

// PUT /api/users/profile
// Update the currently authenticated student's profile.

router.put(
  "/profile",
  protect,
  requireRole("student"),
  updateMyProfile
);

// =====================================================
// UPLOAD STUDENT RESUME
// =====================================================

// POST /api/users/profile/resume
//
// Upload a student's resume.
//
// Validation:
// - Student authentication required
// - Student role required
// - Only PDF files allowed
// - Maximum file size: 5 MB
//
// Form-data field name:
// resume

router.post(
  "/profile/resume",
  protect,
  requireRole("student"),
  uploadResumeMiddleware.single("resume"),
  uploadResume
);

// =====================================================
// DELETE STUDENT RESUME
// =====================================================

// DELETE /api/users/profile/resume

router.delete(
  "/profile/resume",
  protect,
  requireRole("student"),
  deleteResume
);
// =====================================================
// EXPORT
// =====================================================

module.exports = router;