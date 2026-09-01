const mongoose = require("mongoose");

// =====================================================
// NOTIFICATION TYPES
// =====================================================

const NOTIFICATION_TYPES = [
  "job_application",
  "application_status",
  "opportunity_application",
  "recommendation",
  "job",
  "opportunity",
  "event",
  "system",
];

// =====================================================
// NOTIFICATION SCHEMA
// =====================================================

const notificationSchema =
  new mongoose.Schema(
    {
      // -----------------------------------------------
      // RECEIVER
      // -----------------------------------------------

      recipient: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      // -----------------------------------------------
      // TYPE
      // -----------------------------------------------

      type: {
        type:
          String,

        enum:
          NOTIFICATION_TYPES,

        required:
          true,

        default:
          "system",
      },

      // -----------------------------------------------
      // CONTENT
      // -----------------------------------------------

      title: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength: [
          200,
          "Notification title cannot exceed 200 characters",
        ],
      },

      message: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength: [
          1000,
          "Notification message cannot exceed 1000 characters",
        ],
      },

      // -----------------------------------------------
      // READ STATUS
      // -----------------------------------------------

      isRead: {
        type:
          Boolean,

        default:
          false,

        index:
          true,
      },

      readAt: {
        type:
          Date,

        default:
          null,
      },

      // -----------------------------------------------
      // OPTIONAL RELATED RESOURCE
      // -----------------------------------------------

      relatedModel: {
        type:
          String,

        enum: [
          "Job",
          "JobApplication",
          "Opportunity",
          "Application",
          "Event",
          null,
        ],

        default:
          null,
      },

      relatedId: {
        type:
          mongoose.Schema.Types.ObjectId,

        default:
          null,
      },

      // -----------------------------------------------
      // OPTIONAL ACTION LINK
      // -----------------------------------------------

      actionUrl: {
        type:
          String,

        trim:
          true,

        maxlength: [
          500,
          "Action URL cannot exceed 500 characters",
        ],

        default:
          "",
      },
    },
    {
      timestamps:
        true,
    }
  );

// =====================================================
// INDEXES
// =====================================================

// Main notification list for a user.

notificationSchema.index({
  recipient:
    1,

  createdAt:
    -1,
});

// Fast unread notification queries.

notificationSchema.index({
  recipient:
    1,

  isRead:
    1,

  createdAt:
    -1,
});

// =====================================================
// STATIC CONSTANTS
// =====================================================

notificationSchema.statics.TYPES =
  NOTIFICATION_TYPES;

// =====================================================
// MODEL
// =====================================================

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

module.exports =
  Notification;