const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getMyJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const router = express.Router();

// =====================================================
// PUBLIC / AUTHENTICATED JOB ROUTES
// =====================================================

// GET /api/jobs
//
// Get all active jobs.
//
// Supports:
// ?search=developer
// ?jobType=internship
// ?workMode=remote
// ?location=Hyderabad
// ?skills=JavaScript,React
// ?page=1
// ?limit=10

router.get(
  "/",
  getJobs
);

// =====================================================
// RECRUITER JOB ROUTES
// =====================================================

// GET /api/jobs/my
//
// Get all jobs created by the currently logged-in recruiter.

router.get(
  "/my",
  protect,
  requireRole("recruiter"),
  getMyJobs
);

// =====================================================
// CREATE JOB
// =====================================================

// POST /api/jobs
//
// Create a new job.
//
// Recruiter only.

router.post(
  "/",
  protect,
  requireRole("recruiter"),
  createJob
);

// =====================================================
// GET RECRUITER'S SINGLE JOB
// =====================================================

// GET /api/jobs/my/:id
//
// Get one job owned by the currently logged-in recruiter.

router.get(
  "/my/:id",
  protect,
  requireRole("recruiter"),
  getMyJobById
);

// =====================================================
// UPDATE JOB
// =====================================================

// PUT /api/jobs/:id
//
// Update a job.
//
// Only the recruiter who created the job can update it.

router.put(
  "/:id",
  protect,
  requireRole("recruiter"),
  updateJob
);

// =====================================================
// DELETE JOB
// =====================================================

// DELETE /api/jobs/:id
//
// Delete a job.
//
// Only the recruiter who created the job can delete it.

router.delete(
  "/:id",
  protect,
  requireRole("recruiter"),
  deleteJob
);

// =====================================================
// GET SINGLE ACTIVE JOB
// =====================================================

// IMPORTANT:
// This route must come AFTER /my and /my/:id
// otherwise Express may treat "my" as an ID.

// GET /api/jobs/:id

router.get(
  "/:id",
  getJobById
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;