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
// APPLICATION SCHEMA
// =====================================================

const applicationSchema =
  new mongoose.Schema(
    {
      // ===============================================
      // OPPORTUNITY
      // ===============================================

      opportunity: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Opportunity",
        required: true,
        index: true,
      },

      // ===============================================
      // STUDENT
      // ===============================================

      student: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      // ===============================================
      // RESUME
      // ===============================================

      resumeUrl: {
        type: String,
        default: "",
        trim: true,
        maxlength: [
          500,
          "Resume URL cannot exceed 500 characters",
        ],
      },

      // ===============================================
      // COVER LETTER
      // ===============================================

      coverLetter: {
        type: String,
        trim: true,
        maxlength: [
          3000,
          "Cover letter cannot exceed 3000 characters",
        ],
        default: "",
      },

      // ===============================================
      // APPLICATION STATUS
      // ===============================================

      status: {
        type: String,
        enum: APPLICATION_STATUSES,
        default: "pending",
        index: true,
      },

      // ===============================================
      // STATUS HISTORY
      // ===============================================

      statusHistory: {
        type: [statusHistorySchema],
        default: [],
      },

      // ===============================================
      // RECRUITER NOTE
      // ===============================================

      recruiterNote: {
        type: String,
        trim: true,
        maxlength: [
          2000,
          "Recruiter note cannot exceed 2000 characters",
        ],
        default: "",
      },

      // ===============================================
      // STUDENT WITHDRAWAL
      // ===============================================

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

// A student can apply only once for
// the same opportunity.

applicationSchema.index(
  {
    opportunity: 1,
    student: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// ADD INITIAL STATUS HISTORY
// =====================================================

applicationSchema.pre(
  "save",
  function (next) {
    // When a new application is created,
    // store the initial status.

    if (
      this.isNew &&
      this.statusHistory.length === 0
    ) {
      this.statusHistory.push({
        status: this.status,
        changedAt: new Date(),
      });
    }

    next();
  }
);

// =====================================================
// USEFUL INDEXES
// =====================================================

// Recruiter application queries

applicationSchema.index({
  opportunity: 1,
  status: 1,
  createdAt: -1,
});

// Student application history

applicationSchema.index({
  student: 1,
  createdAt: -1,
});

// =====================================================
// STATIC CONSTANTS
// =====================================================

applicationSchema.statics.STATUSES =
  APPLICATION_STATUSES;

// =====================================================
// MODEL
// =====================================================

const Application =
  mongoose.model(
    "Application",
    applicationSchema
  );

module.exports = Application;