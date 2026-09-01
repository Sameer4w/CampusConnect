const mongoose = require("mongoose");

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

// =====================================================
// STATUS HISTORY SUBDOCUMENT
// =====================================================

const statusHistorySchema =
  new mongoose.Schema(
    {
      status: {
        type: String,

        enum: APPLICATION_STATUSES,

        required: true,
      },

      changedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      changedAt: {
        type: Date,

        default: Date.now,
      },

      note: {
        type: String,

        trim: true,

        maxlength: [
          500,
          "Status note cannot exceed 500 characters",
        ],

        default: "",
      },
    },
    {
      _id: false,
    }
  );

// =====================================================
// JOB APPLICATION SCHEMA
// =====================================================

const jobApplicationSchema =
  new mongoose.Schema(
    {
      // -------------------------------------------------
      // JOB
      // -------------------------------------------------

      job: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Job",

        required: true,

        index: true,
      },

      // -------------------------------------------------
      // STUDENT
      // -------------------------------------------------

      student: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      // -------------------------------------------------
      // RESUME
      // -------------------------------------------------

      resumeUrl: {
        type: String,

        default: "",

        trim: true,

        maxlength: [
          500,
          "Resume URL cannot exceed 500 characters",
        ],
      },

      resumeName: {
        type: String,

        default: "",

        trim: true,

        maxlength: [
          200,
          "Resume name cannot exceed 200 characters",
        ],
      },

      // -------------------------------------------------
      // COVER LETTER
      // -------------------------------------------------

      coverLetter: {
        type: String,

        trim: true,

        maxlength: [
          3000,
          "Cover letter cannot exceed 3000 characters",
        ],

        default: "",
      },

      // -------------------------------------------------
      // APPLICATION STATUS
      // -------------------------------------------------

      status: {
        type: String,

        enum: APPLICATION_STATUSES,

        default: "pending",

        index: true,
      },

      // -------------------------------------------------
      // STATUS HISTORY
      // -------------------------------------------------

      statusHistory: {
        type: [statusHistorySchema],

        default: [],
      },

      // -------------------------------------------------
      // RECRUITER NOTE
      // -------------------------------------------------

      recruiterNote: {
        type: String,

        trim: true,

        maxlength: [
          2000,
          "Recruiter note cannot exceed 2000 characters",
        ],

        default: "",
      },

      // -------------------------------------------------
      // STUDENT WITHDRAWAL
      // -------------------------------------------------

      withdrawnAt: {
        type: Date,

        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// =====================================================
// UNIQUE APPLICATION INDEX
// =====================================================

// A student can apply only once
// for the same job.

jobApplicationSchema.index(
  {
    job: 1,
    student: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// ADD INITIAL STATUS HISTORY
// =====================================================

jobApplicationSchema.pre(
  "save",

  function (next) {
    if (
      this.isNew &&
      this.statusHistory.length === 0
    ) {
      this.statusHistory.push({
        status: this.status,

        changedAt:
          new Date(),
      });
    }

    next();
  }
);

// =====================================================
// INDEXES
// =====================================================

// Recruiter queries applications
// for a particular job.

jobApplicationSchema.index({
  job: 1,

  status: 1,

  createdAt: -1,
});

// Student application history.

jobApplicationSchema.index({
  student: 1,

  createdAt: -1,
});

// =====================================================
// STATIC CONSTANTS
// =====================================================

jobApplicationSchema.statics.STATUSES =
  APPLICATION_STATUSES;

// =====================================================
// MODEL
// =====================================================

const JobApplication =
  mongoose.model(
    "JobApplication",
    jobApplicationSchema
  );

module.exports =
  JobApplication;