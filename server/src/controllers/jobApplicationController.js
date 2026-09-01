const asyncHandler =
  require("express-async-handler");

const Job =
  require("../models/Job");

const JobApplication =
  require("../models/JobApplication");

const StudentProfile =
  require("../models/StudentProfile");

// =====================================================
// CONSTANTS
// =====================================================

const RECRUITER_STATUSES = [
  "reviewing",
  "shortlisted",
  "accepted",
  "rejected",
];

const MAX = {
  coverLetter: 3000,
  recruiterNote: 2000,
  statusNote: 500,
};

// =====================================================
// HELPERS
// =====================================================

const hasOwn = (
  object,
  key
) =>
  Object.prototype.hasOwnProperty.call(
    object,
    key
  );

const validateString = (
  value,
  fieldName,
  maxLength,
  required = false
) => {
  if (
    value === undefined ||
    value === null
  ) {
    if (required) {
      throw new Error(
        `${fieldName} is required`
      );
    }

    return "";
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      `${fieldName} must be a string`
    );
  }

  const trimmed =
    value.trim();

  if (
    required &&
    !trimmed
  ) {
    throw new Error(
      `${fieldName} is required`
    );
  }

  if (
    trimmed.length >
    maxLength
  ) {
    throw new Error(
      `${fieldName} cannot exceed ${maxLength} characters`
    );
  }

  return trimmed;
};

// =====================================================
// APPLY FOR JOB
// STUDENT ONLY
// =====================================================

const applyForJob =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findOne({
          _id:
            req.params.jobId,

          status:
            "active",
        });

      if (!job) {
        res.status(404);

        throw new Error(
          "Job not found or is no longer accepting applications."
        );
      }

      // -----------------------------------------------
      // CHECK FOR EXISTING APPLICATION
      // -----------------------------------------------

      const existingApplication =
        await JobApplication.findOne({
          job:
            job._id,

          student:
            req.user._id,
        });

      if (
        existingApplication
      ) {
        res.status(400);

        throw new Error(
          "You have already applied for this job."
        );
      }

      // -----------------------------------------------
      // VALIDATE COVER LETTER
      // -----------------------------------------------

      const coverLetter =
        hasOwn(
          req.body || {},
          "coverLetter"
        )
          ? validateString(
              req.body.coverLetter,
              "Cover letter",
              MAX.coverLetter
            )
          : "";

      // -----------------------------------------------
      // GET STUDENT PROFILE
      // -----------------------------------------------

      const profile =
        await StudentProfile.findOne({
          user:
            req.user._id,
        });

      // -----------------------------------------------
      // GET RESUME
      // -----------------------------------------------

      const resumeUrl =
        profile?.resume?.resumeUrl ||
        "";

      const resumeName =
        profile?.resume?.resumeName ||
        "";

      // -----------------------------------------------
      // CREATE APPLICATION
      // -----------------------------------------------

      const application =
        await JobApplication.create({
          job:
            job._id,

          student:
            req.user._id,

          resumeUrl,

          resumeName,

          coverLetter,

          status:
            "pending",
        });

      res.status(201).json({
        success: true,

        message:
          "Job application submitted successfully.",

        application,
      });
    }
  );

// =====================================================
// GET MY JOB APPLICATIONS
// STUDENT ONLY
// =====================================================

const getMyJobApplications =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const applications =
        await JobApplication.find({
          student:
            req.user._id,
        })
          .populate(
            "job"
          )
          .sort({
            createdAt:
              -1,
          });

      res.status(200).json({
        success: true,

        applications,
      });
    }
  );

// =====================================================
// GET MY SINGLE JOB APPLICATION
// STUDENT ONLY
// =====================================================

const getMyJobApplicationById =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const application =
        await JobApplication.findOne({
          _id:
            req.params.id,

          student:
            req.user._id,
        })
          .populate(
            "job"
          );

      if (
        !application
      ) {
        res.status(404);

        throw new Error(
          "Job application not found."
        );
      }

      res.status(200).json({
        success: true,

        application,
      });
    }
  );

// =====================================================
// WITHDRAW JOB APPLICATION
// STUDENT OWNER ONLY
// =====================================================

const withdrawJobApplication =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const application =
        await JobApplication.findOne({
          _id:
            req.params.id,

          student:
            req.user._id,
        });

      if (
        !application
      ) {
        res.status(404);

        throw new Error(
          "Job application not found."
        );
      }

      // -----------------------------------------------
      // PREVENT WITHDRAWING TWICE
      // -----------------------------------------------

      if (
        application.status ===
        "withdrawn"
      ) {
        res.status(400);

        throw new Error(
          "This application has already been withdrawn."
        );
      }

      // -----------------------------------------------
      // PREVENT WITHDRAWAL AFTER FINAL DECISION
      // -----------------------------------------------

      if (
        application.status ===
          "accepted" ||
        application.status ===
          "rejected"
      ) {
        res.status(400);

        throw new Error(
          "This application can no longer be withdrawn after a final decision."
        );
      }

      // -----------------------------------------------
      // UPDATE STATUS
      // -----------------------------------------------

      application.status =
        "withdrawn";

      application.withdrawnAt =
        new Date();

      application.statusHistory.push({
        status:
          "withdrawn",

        changedBy:
          req.user._id,

        changedAt:
          new Date(),

        note:
          "Application withdrawn by student.",
      });

      await application.save();

      res.status(200).json({
        success: true,

        message:
          "Job application withdrawn successfully.",

        application,
      });
    }
  );

// =====================================================
// GET APPLICATIONS FOR A JOB
// RECRUITER OWNER ONLY
// =====================================================

const getJobApplications =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findOne({
          _id:
            req.params.jobId,

          recruiter:
            req.user._id,
        });

      if (!job) {
        res.status(404);

        throw new Error(
          "Job not found or you do not have permission to view its applications."
        );
      }

      const applications =
        await JobApplication.find({
          job:
            job._id,
        })
          .populate(
            "student",
            "name email"
          )
          .sort({
            createdAt:
              -1,
          });

      res.status(200).json({
        success: true,

        jobId:
          job._id,

        applications,
      });
    }
  );

// =====================================================
// GET SINGLE APPLICATION
// RECRUITER OWNER ONLY
// =====================================================

const getJobApplicationForRecruiter =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const application =
        await JobApplication.findById(
          req.params.id
        )
          .populate(
            "job"
          )
          .populate(
            "student",
            "name email"
          );

      if (
        !application
      ) {
        res.status(404);

        throw new Error(
          "Job application not found."
        );
      }

      // -----------------------------------------------
      // VERIFY JOB OWNERSHIP
      // -----------------------------------------------

      if (
        !application.job ||
        application.job.recruiter.toString() !==
          req.user._id.toString()
      ) {
        res.status(403);

        throw new Error(
          "You do not have permission to view this application."
        );
      }

      res.status(200).json({
        success: true,

        application,
      });
    }
  );

// =====================================================
// UPDATE APPLICATION STATUS
// RECRUITER OWNER ONLY
// =====================================================

const updateJobApplicationStatus =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        status,
        recruiterNote,
        note,
      } =
        req.body || {};

      // -----------------------------------------------
      // VALIDATE STATUS
      // -----------------------------------------------

      if (
        typeof status !==
          "string" ||
        !RECRUITER_STATUSES.includes(
          status.toLowerCase()
        )
      ) {
        res.status(400);

        throw new Error(
          `Status must be one of: ${RECRUITER_STATUSES.join(
            ", "
          )}`
        );
      }

      const normalizedStatus =
        status.toLowerCase();

      // -----------------------------------------------
      // FIND APPLICATION
      // -----------------------------------------------

      const application =
        await JobApplication.findById(
          req.params.id
        )
          .populate(
            "job"
          );

      if (
        !application
      ) {
        res.status(404);

        throw new Error(
          "Job application not found."
        );
      }

      // -----------------------------------------------
      // VERIFY JOB OWNERSHIP
      // -----------------------------------------------

      if (
        !application.job ||
        application.job.recruiter.toString() !==
          req.user._id.toString()
      ) {
        res.status(403);

        throw new Error(
          "You do not have permission to update this application."
        );
      }

      // -----------------------------------------------
      // PREVENT CHANGING WITHDRAWN APPLICATION
      // -----------------------------------------------

      if (
        application.status ===
        "withdrawn"
      ) {
        res.status(400);

        throw new Error(
          "A withdrawn application cannot be updated."
        );
      }

      // -----------------------------------------------
      // VALIDATE OPTIONAL NOTES
      // -----------------------------------------------

      const cleanRecruiterNote =
        hasOwn(
          req.body || {},
          "recruiterNote"
        )
          ? validateString(
              recruiterNote,
              "Recruiter note",
              MAX.recruiterNote
            )
          : application.recruiterNote;

      const cleanStatusNote =
        hasOwn(
          req.body || {},
          "note"
        )
          ? validateString(
              note,
              "Status note",
              MAX.statusNote
            )
          : "";

      // -----------------------------------------------
      // UPDATE APPLICATION
      // -----------------------------------------------

      const statusChanged =
        application.status !==
        normalizedStatus;

      application.status =
        normalizedStatus;

      application.recruiterNote =
        cleanRecruiterNote;

      if (
        statusChanged
      ) {
        application.statusHistory.push({
          status:
            normalizedStatus,

          changedBy:
            req.user._id,

          changedAt:
            new Date(),

          note:
            cleanStatusNote,
        });
      }

      await application.save();

      res.status(200).json({
        success: true,

        message:
          "Job application updated successfully.",

        application,
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  applyForJob,

  getMyJobApplications,

  getMyJobApplicationById,

  withdrawJobApplication,

  getJobApplications,

  getJobApplicationForRecruiter,

  updateJobApplicationStatus,
};