const express = require("express");

const {
  protect,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  applyForJob,
  getMyJobApplications,
  getMyJobApplicationById,
  withdrawJobApplication,
  getJobApplications,
  getJobApplicationForRecruiter,
  updateJobApplicationStatus,
} = require("../controllers/jobApplicationController");

// =====================================================
// ROUTER
// =====================================================

const router =
  express.Router();

// =====================================================
// STUDENT ROUTES
// =====================================================

// -----------------------------------------------------
// APPLY FOR A JOB
// -----------------------------------------------------
//
// POST /api/job-applications/jobs/:jobId
//
// Student only.
//

router.post(
  "/jobs/:jobId",

  protect,

  requireRole(
    "student"
  ),

  applyForJob
);

// -----------------------------------------------------
// GET MY JOB APPLICATIONS
// -----------------------------------------------------
//
// GET /api/job-applications/my
//
// Student only.
//

router.get(
  "/my",

  protect,

  requireRole(
    "student"
  ),

  getMyJobApplications
);

// -----------------------------------------------------
// GET MY SINGLE JOB APPLICATION
// -----------------------------------------------------
//
// GET /api/job-applications/my/:id
//
// Student only.
//
// IMPORTANT:
// This route must come after "/my".
//

router.get(
  "/my/:id",

  protect,

  requireRole(
    "student"
  ),

  getMyJobApplicationById
);

// -----------------------------------------------------
// WITHDRAW MY JOB APPLICATION
// -----------------------------------------------------
//
// PUT /api/job-applications/my/:id/withdraw
//
// Student only.
//

router.put(
  "/my/:id/withdraw",

  protect,

  requireRole(
    "student"
  ),

  withdrawJobApplication
);

// =====================================================
// RECRUITER ROUTES
// =====================================================

// -----------------------------------------------------
// GET APPLICATIONS FOR MY JOB
// -----------------------------------------------------
//
// GET /api/job-applications/jobs/:jobId
//
// Recruiter owner only.
//

router.get(
  "/jobs/:jobId",

  protect,

  requireRole(
    "recruiter"
  ),

  getJobApplications
);

// -----------------------------------------------------
// GET SINGLE APPLICATION
// -----------------------------------------------------
//
// GET /api/job-applications/:id
//
// Recruiter owner only.
//

router.get(
  "/:id",

  protect,

  requireRole(
    "recruiter"
  ),

  getJobApplicationForRecruiter
);

// -----------------------------------------------------
// UPDATE APPLICATION STATUS
// -----------------------------------------------------
//
// PUT /api/job-applications/:id/status
//
// Recruiter owner only.
//

router.put(
  "/:id/status",

  protect,

  requireRole(
    "recruiter"
  ),

  updateJobApplicationStatus
);

// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;