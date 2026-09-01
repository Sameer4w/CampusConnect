const asyncHandler = require("express-async-handler");

const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const StudentProfile = require("../models/StudentProfile");

// =====================================================
// CONSTANTS
// =====================================================

const APPLICATION_STATUSES = [
  "pending",
  "reviewing",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
];

const RECRUITER_ALLOWED_STATUSES = [
  "reviewing",
  "shortlisted",
  "accepted",
  "rejected",
];

const MAX = {
  resumeUrl: 500,
  coverLetter: 3000,
  recruiterNote: 2000,
  statusNote: 500,
};

// =====================================================
// HELPERS
// =====================================================

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(
    object,
    key
  );

const throwValidationError = (message) => {
  const error = new Error(message);

  error.statusCode = 400;

  throw error;
};

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
      throwValidationError(
        `${fieldName} is required`
      );
    }

    return "";
  }

  if (
    typeof value !== "string"
  ) {
    throwValidationError(
      `${fieldName} must be a string`
    );
  }

  const trimmed =
    value.trim();

  if (
    required &&
    !trimmed
  ) {
    throwValidationError(
      `${fieldName} is required`
    );
  }

  if (
    trimmed.length >
    maxLength
  ) {
    throwValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`
    );
  }

  return trimmed;
};

// =====================================================
// APPLY TO OPPORTUNITY
// STUDENT ONLY
// =====================================================

const applyToOpportunity =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const body =
        req.body || {};

      // -----------------------------------------------
      // VALIDATE OPPORTUNITY ID
      // -----------------------------------------------

      const opportunityId =
        body.opportunityId;

      if (
        !opportunityId
      ) {
        res.status(400);

        throw new Error(
          "opportunityId is required"
        );
      }

      // -----------------------------------------------
      // FIND OPPORTUNITY
      // -----------------------------------------------

      const opportunity =
        await Opportunity.findOne({
          _id:
            opportunityId,

          status:
            "open",
        });
      if (
        !opportunity
      ) {
        res.status(404);

        throw new Error(
          "Active opportunity not found."
        );
      }

      // -----------------------------------------------
      // CHECK DEADLINE
      // -----------------------------------------------

      if (
        opportunity.applicationDeadline &&
        new Date(
          opportunity.applicationDeadline
        ) < new Date()
      ) {
        res.status(400);

        throw new Error(
          "The application deadline for this opportunity has passed."
        );
      }

      // -----------------------------------------------
      // CHECK DUPLICATE APPLICATION
      // -----------------------------------------------

      const existingApplication =
        await Application.findOne({
          opportunity:
            opportunity._id,

          student:
            req.user._id,
        });

      if (
        existingApplication
      ) {
        res.status(400);

        throw new Error(
          "You have already applied to this opportunity."
        );
      }

      // -----------------------------------------------
      // GET STUDENT PROFILE
      // -----------------------------------------------

      const studentProfile =
        await StudentProfile.findOne({
          user:
            req.user._id,
        });

      // -----------------------------------------------
      // RESUME
      // -----------------------------------------------

      let resumeUrl = "";

      if (
        hasOwn(
          body,
          "resumeUrl"
        )
      ) {
        resumeUrl =
          validateString(
            body.resumeUrl,
            "Resume URL",
            MAX.resumeUrl
          );
      }

      // If student does not send a resume URL,
      // use the resume stored in their profile.

      if (
        !resumeUrl &&
        studentProfile &&
        studentProfile.resume &&
        studentProfile.resume.resumeUrl
      ) {
        resumeUrl =
          studentProfile.resume.resumeUrl;
      }

      // -----------------------------------------------
      // COVER LETTER
      // -----------------------------------------------

      const coverLetter =
        hasOwn(
          body,
          "coverLetter"
        )
          ? validateString(
              body.coverLetter,
              "Cover letter",
              MAX.coverLetter
            )
          : "";

      // -----------------------------------------------
      // CREATE APPLICATION
      // -----------------------------------------------

      let application;

      try {
        application =
          await Application.create({
            opportunity:
              opportunity._id,

            student:
              req.user._id,

            resumeUrl,

            coverLetter,

            status:
              "pending",
          });
      } catch (
        error
      ) {
        // Handles duplicate applications
        // even if two requests arrive together.

        if (
          error.code === 11000
        ) {
          res.status(400);

          throw new Error(
            "You have already applied to this opportunity."
          );
        }

        throw error;
      }

      // -----------------------------------------------
      // POPULATE RESPONSE
      // -----------------------------------------------

      await application.populate([
        {
          path:
            "opportunity",
        },
        {
          path:
            "student",
          select:
            "name email role",
        },
      ]);

      res.status(201).json({
        success: true,

        message:
          "Application submitted successfully.",

        application,
      });
    }
  );

// =====================================================
// GET MY APPLICATIONS
// STUDENT ONLY
// =====================================================

const getMyApplications =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        status,
        page = 1,
        limit = 10,
      } =
        req.query;

      const query = {
        student:
          req.user._id,
      };

      // -----------------------------------------------
      // STATUS FILTER
      // -----------------------------------------------

      if (
        status &&
        APPLICATION_STATUSES.includes(
          status.toLowerCase()
        )
      ) {
        query.status =
          status.toLowerCase();
      }

      // -----------------------------------------------
      // PAGINATION
      // -----------------------------------------------

      const currentPage =
        Math.max(
          1,
          Number(page) || 1
        );

      const pageLimit =
        Math.min(
          50,
          Math.max(
            1,
            Number(limit) || 10
          )
        );

      const skip =
        (currentPage - 1) *
        pageLimit;

      // -----------------------------------------------
      // DATABASE QUERY
      // -----------------------------------------------

      const total =
        await Application.countDocuments(
          query
        );

      const applications =
        await Application.find(
          query
        )
          .populate(
            "opportunity"
          )
          .sort({
            createdAt:
              -1,
          })
          .skip(
            skip
          )
          .limit(
            pageLimit
          );

      res.status(200).json({
        success: true,

        applications,

        pagination: {
          total,

          page:
            currentPage,

          limit:
            pageLimit,

          pages:
            Math.ceil(
              total /
              pageLimit
            ),
        },
      });
    }
  );

// =====================================================
// GET MY SINGLE APPLICATION
// STUDENT ONLY
// =====================================================

const getMyApplicationById =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const application =
        await Application.findOne({
          _id:
            req.params.id,

          student:
            req.user._id,
        })
          .populate(
            "opportunity"
          )
          .populate(
            "statusHistory.changedBy",
            "name email role"
          );

      if (
        !application
      ) {
        res.status(404);

        throw new Error(
          "Application not found."
        );
      }

      res.status(200).json({
        success: true,

        application,
      });
    }
  );

// =====================================================
// WITHDRAW APPLICATION
// STUDENT OWNER ONLY
// =====================================================

const withdrawApplication =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const application =
        await Application.findOne({
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
          "Application not found."
        );
      }

      // -----------------------------------------------
      // CHECK CURRENT STATUS
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

      if (
        application.status ===
        "accepted"
      ) {
        res.status(400);

        throw new Error(
          "An accepted application cannot be withdrawn."
        );
      }

      // -----------------------------------------------
      // OPTIONAL NOTE
      // -----------------------------------------------

      const note =
        hasOwn(
          req.body || {},
          "note"
        )
          ? validateString(
              req.body.note,
              "Withdrawal note",
              MAX.statusNote
            )
          : "";

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

        note,
      });

      await application.save();

      res.status(200).json({
        success: true,

        message:
          "Application withdrawn successfully.",

        application,
      });
    }
  );

// =====================================================
// GET APPLICATIONS FOR AN OPPORTUNITY
// RECRUITER OWNER ONLY
// =====================================================

const getApplicationsByOpportunity =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        opportunityId,
      } =
        req.params;

      // -----------------------------------------------
      // FIND OPPORTUNITY
      // -----------------------------------------------

      const opportunity =
        await Opportunity.findOne({
          _id:
            opportunityId,

          recruiter:
            req.user._id,
        });

      if (
        !opportunity
      ) {
        res.status(404);

        throw new Error(
          "Opportunity not found or you do not have access."
        );
      }

      // -----------------------------------------------
      // QUERY
      // -----------------------------------------------

      const query = {
        opportunity:
          opportunity._id,
      };

      const {
        status,
        page = 1,
        limit = 10,
      } =
        req.query;

      if (
        status &&
        APPLICATION_STATUSES.includes(
          status.toLowerCase()
        )
      ) {
        query.status =
          status.toLowerCase();
      }

      // -----------------------------------------------
      // PAGINATION
      // -----------------------------------------------

      const currentPage =
        Math.max(
          1,
          Number(page) || 1
        );

      const pageLimit =
        Math.min(
          50,
          Math.max(
            1,
            Number(limit) || 10
          )
        );

      const skip =
        (currentPage - 1) *
        pageLimit;

      const total =
        await Application.countDocuments(
          query
        );

      const applications =
        await Application.find(
          query
        )
          .populate(
            "student",
            "name email"
          )
          .sort({
            createdAt:
              -1,
          })
          .skip(
            skip
          )
          .limit(
            pageLimit
          );

      res.status(200).json({
        success: true,

        opportunity,

        applications,

        pagination: {
          total,

          page:
            currentPage,

          limit:
            pageLimit,

          pages:
            Math.ceil(
              total /
              pageLimit
            ),
        },
      });
    }
  );

// =====================================================
// UPDATE APPLICATION STATUS
// RECRUITER OWNER ONLY
// =====================================================

const updateApplicationStatus =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const body =
        req.body || {};

      // -----------------------------------------------
      // VALIDATE STATUS
      // -----------------------------------------------

      if (
        !body.status
      ) {
        res.status(400);

        throw new Error(
          "Application status is required."
        );
      }

      if (
        typeof body.status !==
        "string"
      ) {
        res.status(400);

        throw new Error(
          "Application status must be a string."
        );
      }

      const newStatus =
        body.status
          .trim()
          .toLowerCase();

      if (
        !RECRUITER_ALLOWED_STATUSES.includes(
          newStatus
        )
      ) {
        res.status(400);

        throw new Error(
          `Recruiters can set status to: ${RECRUITER_ALLOWED_STATUSES.join(
            ", "
          )}`
        );
      }

      // -----------------------------------------------
      // FIND APPLICATION
      // -----------------------------------------------

      const application =
        await Application.findById(
          req.params.id
        ).populate(
          "opportunity"
        );

      if (
        !application
      ) {
        res.status(404);

        throw new Error(
          "Application not found."
        );
      }

      // -----------------------------------------------
      // CHECK OPPORTUNITY OWNERSHIP
      // -----------------------------------------------

      if (
        !application.opportunity ||
        application
          .opportunity
          .recruiter
          .toString() !==
          req.user._id.toString()
      ) {
        res.status(403);

        throw new Error(
          "You do not have permission to update this application."
        );
      }

      // -----------------------------------------------
      // WITHDRAWN APPLICATIONS
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
      // OPTIONAL STATUS NOTE
      // -----------------------------------------------

      const note =
        hasOwn(
          body,
          "note"
        )
          ? validateString(
              body.note,
              "Status note",
              MAX.statusNote
            )
          : "";

      // -----------------------------------------------
      // OPTIONAL RECRUITER NOTE
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "recruiterNote"
        )
      ) {
        application.recruiterNote =
          validateString(
            body.recruiterNote,
            "Recruiter note",
            MAX.recruiterNote
          );
      }

      // -----------------------------------------------
      // UPDATE STATUS
      // -----------------------------------------------

      application.status =
        newStatus;

      application.statusHistory.push({
        status:
          newStatus,

        changedBy:
          req.user._id,

        changedAt:
          new Date(),

        note,
      });

      await application.save();

      await application.populate([
        {
          path:
            "student",
            select:
              "name email",
        },
        {
          path:
            "opportunity",
        },
        {
          path:
            "statusHistory.changedBy",
            select:
              "name email role",
        },
      ]);

      res.status(200).json({
        success: true,

        message:
          "Application status updated successfully.",

        application,
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  applyToOpportunity,
  getMyApplications,
  getMyApplicationById,
  withdrawApplication,
  getApplicationsByOpportunity,
  updateApplicationStatus,
};