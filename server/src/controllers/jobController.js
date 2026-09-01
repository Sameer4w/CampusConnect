const asyncHandler = require("express-async-handler");

const Job = require("../models/Job");

// =====================================================
// CONSTANTS
// =====================================================

const JOB_TYPES = [
  "full-time",
  "part-time",
  "internship",
  "contract",
];

const WORK_MODES = [
  "onsite",
  "remote",
  "hybrid",
];

const JOB_STATUSES = [
  "draft",
  "active",
  "closed",
];

const MAX = {
  title: 200,
  companyName: 200,
  description: 10000,
  location: 200,
  skills: 50,
  skillLength: 50,
  currency: 10,
};

// =====================================================
// VALIDATION ERROR HELPER
// =====================================================

const throwValidationError = (message) => {
  const error = new Error(message);

  error.statusCode = 400;

  throw error;
};

// =====================================================
// HELPERS
// =====================================================

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(
    object,
    key
  );

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    throwValidationError(
      "requiredSkills must be an array"
    );
  }

  if (skills.length > MAX.skills) {
    throwValidationError(
      `Maximum ${MAX.skills} required skills allowed`
    );
  }

  const seen = new Set();

  return skills
    .map((skill) =>
      typeof skill === "string"
        ? skill.trim()
        : ""
    )
    .filter(
      (skill) =>
        skill.length > 0 &&
        skill.length <= MAX.skillLength
    )
    .filter((skill) => {
      const normalized =
        skill.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);

      return true;
    });
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

    return undefined;
  }

  if (typeof value !== "string") {
    throwValidationError(
      `${fieldName} must be a string`
    );
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throwValidationError(
      `${fieldName} is required`
    );
  }

  if (trimmed.length > maxLength) {
    throwValidationError(
      `${fieldName} cannot exceed ${maxLength} characters`
    );
  }

  return trimmed;
};

const validateNumber = (
  value,
  fieldName,
  min,
  max
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < min ||
    number > max
  ) {
    throwValidationError(
      `${fieldName} must be between ${min} and ${max}`
    );
  }

  return number;
};

const validateDate = (
  value,
  fieldName
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throwValidationError(
      `${fieldName} must be a valid date`
    );
  }

  return date;
};

const validateEnum = (
  value,
  fieldName,
  allowedValues,
  required = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (required) {
      throwValidationError(
        `${fieldName} is required`
      );
    }

    return undefined;
  }

  if (
    typeof value !== "string" ||
    !allowedValues.includes(
      value.toLowerCase()
    )
  ) {
    throwValidationError(
      `${fieldName} must be one of: ${allowedValues.join(
        ", "
      )}`
    );
  }

  return value.toLowerCase();
};

// =====================================================
// VALIDATE JOB DATA
// =====================================================

const validateJobData = (
  body,
  isCreate = false
) => {
  const data = {};

  // -------------------------------------------------
  // TITLE
  // -------------------------------------------------

  if (
    isCreate ||
    hasOwn(body, "title")
  ) {
    data.title =
      validateString(
        body.title,
        "Job title",
        MAX.title,
        true
      );
  }

  // -------------------------------------------------
  // COMPANY NAME
  // -------------------------------------------------

  if (
    isCreate ||
    hasOwn(
      body,
      "companyName"
    )
  ) {
    data.companyName =
      validateString(
        body.companyName,
        "Company name",
        MAX.companyName,
        true
      );
  }

  // -------------------------------------------------
  // DESCRIPTION
  // -------------------------------------------------

  if (
    isCreate ||
    hasOwn(
      body,
      "description"
    )
  ) {
    data.description =
      validateString(
        body.description,
        "Job description",
        MAX.description,
        true
      );
  }

  // -------------------------------------------------
  // JOB TYPE
  // -------------------------------------------------

  if (
    isCreate ||
    hasOwn(
      body,
      "jobType"
    )
  ) {
    data.jobType =
      validateEnum(
        body.jobType,
        "Job type",
        JOB_TYPES,
        true
      );
  }

  // -------------------------------------------------
  // WORK MODE
  // -------------------------------------------------

  if (
    isCreate ||
    hasOwn(
      body,
      "workMode"
    )
  ) {
    data.workMode =
      validateEnum(
        body.workMode,
        "Work mode",
        WORK_MODES,
        true
      );
  }

  // -------------------------------------------------
  // LOCATION
  // -------------------------------------------------

  if (
    hasOwn(
      body,
      "location"
    )
  ) {
    data.location =
      validateString(
        body.location,
        "Location",
        MAX.location
      );
  }

  // -------------------------------------------------
  // REQUIRED SKILLS
  // -------------------------------------------------

  if (
    hasOwn(
      body,
      "requiredSkills"
    )
  ) {
    data.requiredSkills =
      normalizeSkills(
        body.requiredSkills
      );
  }

  // -------------------------------------------------
  // EXPERIENCE
  // -------------------------------------------------

  if (
    hasOwn(
      body,
      "minExperience"
    )
  ) {
    data.minExperience =
      validateNumber(
        body.minExperience,
        "Minimum experience",
        0,
        50
      );
  }

  if (
    hasOwn(
      body,
      "maxExperience"
    )
  ) {
    data.maxExperience =
      validateNumber(
        body.maxExperience,
        "Maximum experience",
        0,
        50
      );
  }

  // -------------------------------------------------
  // SALARY
  // -------------------------------------------------

  if (
    hasOwn(
      body,
      "minSalary"
    )
  ) {
    data.minSalary =
      validateNumber(
        body.minSalary,
        "Minimum salary",
        0,
        Number.MAX_SAFE_INTEGER
      );
  }

  if (
    hasOwn(
      body,
      "maxSalary"
    )
  ) {
    data.maxSalary =
      validateNumber(
        body.maxSalary,
        "Maximum salary",
        0,
        Number.MAX_SAFE_INTEGER
      );
  }

  if (
    hasOwn(
      body,
      "salaryCurrency"
    )
  ) {
    const currency =
      validateString(
        body.salaryCurrency,
        "Salary currency",
        MAX.currency
      );

    data.salaryCurrency =
      currency
        ? currency.toUpperCase()
        : "INR";
  }

  // -------------------------------------------------
  // APPLICATION DEADLINE
  // -------------------------------------------------

  if (
    hasOwn(
      body,
      "applicationDeadline"
    )
  ) {
    data.applicationDeadline =
      validateDate(
        body.applicationDeadline,
        "Application deadline"
      );
  }

  // -------------------------------------------------
  // STATUS
  // -------------------------------------------------

  if (
    hasOwn(
      body,
      "status"
    )
  ) {
    data.status =
      validateEnum(
        body.status,
        "Job status",
        JOB_STATUSES
      );
  }

  return data;
};

// =====================================================
// CREATE JOB
// RECRUITER ONLY
// =====================================================

const createJob =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const jobData =
        validateJobData(
          req.body || {},
          true
        );

      // Ensure minimum/maximum values are valid.

      if (
        jobData.minExperience !==
          undefined &&
        jobData.maxExperience !==
          undefined &&
        jobData.maxExperience <
          jobData.minExperience
      ) {
        throwValidationError(
          "Maximum experience cannot be less than minimum experience"
        );
        }

      if (
        jobData.minSalary !==
          undefined &&
        jobData.maxSalary !==
          undefined &&
        jobData.maxSalary <
          jobData.minSalary
      ) {
        throwValidationError(
  "Maximum salary cannot be less than minimum salary"
);
      }

      const job =
        await Job.create({
          ...jobData,

          recruiter:
            req.user._id,
        });

      res.status(201).json({
        success: true,

        message:
          "Job created successfully.",

        job,
      });
    }
  );

// =====================================================
// GET ACTIVE JOBS
// STUDENTS / PUBLIC AUTHORIZED USERS
// =====================================================

const getJobs =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        search,
        jobType,
        workMode,
        location,
        skills,
        page = 1,
        limit = 10,
      } =
        req.query;

      const query = {
        status: "active",
      };

      // -------------------------------------------------
      // SEARCH
      // -------------------------------------------------

      if (
        search &&
        search.trim()
      ) {
        query.$text = {
          $search:
            search.trim(),
        };
      }

      // -------------------------------------------------
      // FILTERS
      // -------------------------------------------------

      if (
        jobType &&
        JOB_TYPES.includes(
          jobType.toLowerCase()
        )
      ) {
        query.jobType =
          jobType.toLowerCase();
      }

      if (
        workMode &&
        WORK_MODES.includes(
          workMode.toLowerCase()
        )
      ) {
        query.workMode =
          workMode.toLowerCase();
      }

      if (
        location &&
        location.trim()
      ) {
        query.location = {
          $regex:
            location.trim(),

          $options:
            "i",
        };
      }

      if (skills) {
        const skillList =
          skills
            .split(",")
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(Boolean);

        if (
          skillList.length > 0
        ) {
          query.requiredSkills = {
            $in: skillList.map(
              (skill) =>
                new RegExp(
                  `^${skill}$`,
                  "i"
                )
            ),
          };
        }
      }

      // -------------------------------------------------
      // PAGINATION
      // -------------------------------------------------

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
        await Job.countDocuments(
          query
        );

      const jobs =
        await Job.find(query)
          .populate(
            "recruiter",
            "name email"
          )
          .sort(
            search
              ? {
                  score: {
                    $meta:
                      "textScore",
                  },
                  createdAt: -1,
                }
              : {
                  createdAt: -1,
                }
          )
          .skip(skip)
          .limit(pageLimit);

      res.status(200).json({
        success: true,

        jobs,

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
// GET SINGLE ACTIVE JOB
// =====================================================

const getJobById =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findOne({
          _id:
            req.params.id,

          status:
            "active",
        }).populate(
          "recruiter",
          "name email"
        );

      if (!job) {
        res.status(404);

        throw new Error(
          "Job not found."
        );
      }

      res.status(200).json({
        success: true,

        job,
      });
    }
  );

// =====================================================
// GET RECRUITER'S JOBS
// =====================================================

const getMyJobs =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const jobs =
        await Job.find({
          recruiter:
            req.user._id,
        }).sort({
          createdAt:
            -1,
        });

      res.status(200).json({
        success: true,

        jobs,
      });
    }
  );

// =====================================================
// GET RECRUITER'S SINGLE JOB
// =====================================================

const getMyJobById =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findOne({
          _id:
            req.params.id,

          recruiter:
            req.user._id,
        });

      if (!job) {
        res.status(404);

        throw new Error(
          "Job not found or you do not have access."
        );
      }

      res.status(200).json({
        success: true,

        job,
      });
    }
  );

// =====================================================
// UPDATE JOB
// RECRUITER OWNER ONLY
// =====================================================

const updateJob =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findOne({
          _id:
            req.params.id,

          recruiter:
            req.user._id,
        });

      if (!job) {
        res.status(404);

        throw new Error(
          "Job not found or you do not have permission to update it."
        );
      }

      const updateData =
        validateJobData(
          req.body || {},
          false
        );

      // Merge values before checking ranges.

      const minExperience =
        updateData.minExperience !==
        undefined
          ? updateData.minExperience
          : job.minExperience;

      const maxExperience =
        updateData.maxExperience !==
        undefined
          ? updateData.maxExperience
          : job.maxExperience;

      if (
        minExperience !==
          undefined &&
        maxExperience !==
          undefined &&
        maxExperience <
          minExperience
      ) {
        throwValidationError(
  "Maximum experience cannot be less than minimum experience"
);
      }

      const minSalary =
        updateData.minSalary !==
        undefined
          ? updateData.minSalary
          : job.minSalary;

      const maxSalary =
        updateData.maxSalary !==
        undefined
          ? updateData.maxSalary
          : job.maxSalary;

      if (
        minSalary !==
          undefined &&
        maxSalary !==
          undefined &&
        maxSalary <
          minSalary
      ) {
        throwValidationError(
  "Maximum salary cannot be less than minimum salary"
);
      }

      Object.assign(
        job,
        updateData
      );

      await job.save();

      res.status(200).json({
        success: true,

        message:
          "Job updated successfully.",

        job,
      });
    }
  );

// =====================================================
// DELETE JOB
// RECRUITER OWNER ONLY
// =====================================================

const deleteJob =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findOne({
          _id:
            req.params.id,

          recruiter:
            req.user._id,
        });

      if (!job) {
        res.status(404);

        throw new Error(
          "Job not found or you do not have permission to delete it."
        );
      }

      await job.deleteOne();

      res.status(200).json({
        success: true,

        message:
          "Job deleted successfully.",
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getMyJobById,
  updateJob,
  deleteJob,
};