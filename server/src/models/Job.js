const mongoose = require("mongoose");

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

// =====================================================
// JOB SCHEMA
// =====================================================

const jobSchema = new mongoose.Schema(
  {
    // -------------------------------------------------
    // RECRUITER WHO CREATED THE JOB
    // -------------------------------------------------

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // -------------------------------------------------
    // BASIC JOB INFORMATION
    // -------------------------------------------------

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [
        200,
        "Job title cannot exceed 200 characters",
      ],
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [
        200,
        "Company name cannot exceed 200 characters",
      ],
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [
        10000,
        "Job description cannot exceed 10000 characters",
      ],
    },

    // -------------------------------------------------
    // JOB DETAILS
    // -------------------------------------------------

    jobType: {
      type: String,
      required: true,
      enum: {
        values: JOB_TYPES,
        message:
          "Job type must be full-time, part-time, internship, or contract",
      },
    },

    workMode: {
      type: String,
      required: true,
      enum: {
        values: WORK_MODES,
        message:
          "Work mode must be onsite, remote, or hybrid",
      },
    },

    location: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "Location cannot exceed 200 characters",
      ],
    },

    // -------------------------------------------------
    // SKILLS
    // -------------------------------------------------

    requiredSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            50,
            "Each skill cannot exceed 50 characters",
          ],
        },
      ],

      default: [],

      validate: {
        validator: (skills) =>
          Array.isArray(skills) &&
          skills.length <= 50,

        message:
          "A job cannot have more than 50 required skills",
      },
    },

    // -------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------

    minExperience: {
      type: Number,
      default: 0,
      min: [
        0,
        "Minimum experience cannot be negative",
      ],
      max: [
        50,
        "Minimum experience cannot exceed 50 years",
      ],
    },

    maxExperience: {
      type: Number,
      min: [
        0,
        "Maximum experience cannot be negative",
      ],
      max: [
        50,
        "Maximum experience cannot exceed 50 years",
      ],
    },

    // -------------------------------------------------
    // SALARY
    // -------------------------------------------------

    minSalary: {
      type: Number,
      min: [
        0,
        "Minimum salary cannot be negative",
      ],
    },

    maxSalary: {
      type: Number,
      min: [
        0,
        "Maximum salary cannot be negative",
      ],
    },

    salaryCurrency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
      maxlength: [
        10,
        "Currency cannot exceed 10 characters",
      ],
    },

    // -------------------------------------------------
    // APPLICATION DEADLINE
    // -------------------------------------------------

    applicationDeadline: {
      type: Date,
    },

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    status: {
      type: String,

      enum: {
        values: JOB_STATUSES,

        message:
          "Job status must be draft, active, or closed",
      },

      default: "active",

      index: true,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// VALIDATION
// =====================================================

// Maximum experience cannot be lower than minimum.

jobSchema.pre(
  "validate",

  function (next) {
    if (
      this.minExperience !== undefined &&
      this.maxExperience !== undefined &&
      this.maxExperience < this.minExperience
    ) {
      this.invalidate(
        "maxExperience",
        "Maximum experience cannot be less than minimum experience"
      );
    }

    // Maximum salary cannot be lower than minimum.

    if (
      this.minSalary !== undefined &&
      this.maxSalary !== undefined &&
      this.maxSalary < this.minSalary
    ) {
      this.invalidate(
        "maxSalary",
        "Maximum salary cannot be less than minimum salary"
      );
    }

    next();
  }
);

// =====================================================
// NORMALIZATION
// =====================================================

jobSchema.pre(
  "save",

  function (next) {
    if (
      this.isModified(
        "requiredSkills"
      ) &&
      Array.isArray(
        this.requiredSkills
      )
    ) {
      const seen =
        new Set();

      this.requiredSkills =
        this.requiredSkills
          .map(
            (skill) =>
              typeof skill ===
              "string"
                ? skill.trim()
                : ""
          )

          .filter(
            (skill) =>
              skill.length > 0
          )

          .filter(
            (skill) => {
              const normalized =
                skill.toLowerCase();

              if (
                seen.has(
                  normalized
                )
              ) {
                return false;
              }

              seen.add(
                normalized
              );

              return true;
            }
          );
    }

    next();
  }
);

// =====================================================
// INDEXES
// =====================================================

jobSchema.index({
  status: 1,
  createdAt: -1,
});

jobSchema.index({
  recruiter: 1,
  createdAt: -1,
});

jobSchema.index({
  title: "text",
  companyName: "text",
  description: "text",
  requiredSkills: "text",
});

// =====================================================
// MODEL
// =====================================================

const Job =
  mongoose.model(
    "Job",
    jobSchema
  );

module.exports =
  Job;