const mongoose =
  require("mongoose");

// =====================================================
// CONSTANTS
// =====================================================

const EVENT_TYPES = [
  "workshop",
  "seminar",
  "webinar",
  "hackathon",
  "competition",
  "career_fair",
  "networking",
  "other",
];

const EVENT_MODES = [
  "On-site",
  "Online",
  "Hybrid",
];

// =====================================================
// EVENT SCHEMA
// =====================================================

const eventSchema =
  new mongoose.Schema(
    {
      // -----------------------------------------------
      // BASIC INFORMATION
      // -----------------------------------------------

      title: {
        type:
          String,

        required: [
          true,
          "Event title is required",
        ],

        trim:
          true,

        maxlength: [
          200,
          "Event title cannot exceed 200 characters",
        ],
      },

      description: {
        type:
          String,

        required: [
          true,
          "Event description is required",
        ],

        trim:
          true,

        maxlength: [
          5000,
          "Event description cannot exceed 5000 characters",
        ],
      },

      type: {
        type:
          String,

        enum: {
          values:
            EVENT_TYPES,

          message:
            "Invalid event type",
        },

        default:
          "other",

        index:
          true,
      },

      // -----------------------------------------------
      // ORGANIZER
      // -----------------------------------------------

      organizer: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      organizerName: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength: [
          200,
          "Organizer name cannot exceed 200 characters",
        ],
      },

      // -----------------------------------------------
      // EVENT MODE AND LOCATION
      // -----------------------------------------------

      mode: {
        type:
          String,

        enum: {
          values:
            EVENT_MODES,

          message:
            "Invalid event mode",
        },

        default:
          "On-site",
      },

      location: {
        type:
          String,

        trim:
          true,

        maxlength: [
          300,
          "Location cannot exceed 300 characters",
        ],

        default:
          "",
      },

      meetingUrl: {
        type:
          String,

        trim:
          true,

        maxlength: [
          500,
          "Meeting URL cannot exceed 500 characters",
        ],

        default:
          "",
      },

      // -----------------------------------------------
      // DATE AND TIME
      // -----------------------------------------------

      startDate: {
        type:
          Date,

        required: [
          true,
          "Event start date is required",
        ],

        index:
          true,
      },

      endDate: {
        type:
          Date,

        required: [
          true,
          "Event end date is required",
        ],
      },

      registrationDeadline: {
        type:
          Date,

        default:
          null,
      },

      // -----------------------------------------------
      // PARTICIPANT LIMIT
      // -----------------------------------------------

      capacity: {
        type:
          Number,

        min: [
          1,
          "Capacity must be at least 1",
        ],

        default:
          null,
      },

      registrations: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref:
            "User",
        },
      ],

      // -----------------------------------------------
      // STATUS
      // -----------------------------------------------

      status: {
        type:
          String,

        enum: [
          "draft",
          "published",
          "cancelled",
          "completed",
        ],

        default:
          "draft",

        index:
          true,
      },

      // -----------------------------------------------
      // ADDITIONAL DETAILS
      // -----------------------------------------------

      tags: {
        type: [
          {
            type:
              String,

            trim:
              true,

            maxlength: [
              50,
              "Tag cannot exceed 50 characters",
            ],
          },
        ],

        default:
          [],
      },

      imageUrl: {
        type:
          String,

        trim:
          true,

        maxlength: [
          500,
          "Image URL cannot exceed 500 characters",
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
// VALIDATE EVENT DATES
// =====================================================

eventSchema.pre(
  "validate",
  function (
    next
  ) {
    if (
      this.startDate &&
      this.endDate &&
      this.endDate <=
        this.startDate
    ) {
      return next(
        new Error(
          "Event end date must be after the start date."
        )
      );
    }

    if (
      this.registrationDeadline &&
      this.startDate &&
      this.registrationDeadline >
        this.startDate
    ) {
      return next(
        new Error(
          "Registration deadline cannot be after the event start date."
        )
      );
    }

    next();
  }
);

// =====================================================
// NORMALIZE TAGS
// =====================================================

eventSchema.pre(
  "save",
  function (
    next
  ) {
    if (
      this.isModified(
        "tags"
      )
    ) {
      const seen =
        new Set();

      this.tags =
        this.tags
          .map(
            (tag) =>
              typeof tag ===
              "string"
                ? tag.trim()
                : ""
          )
          .filter(
            (tag) =>
              tag.length > 0
          )
          .filter(
            (tag) => {
              const normalized =
                tag.toLowerCase();

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

eventSchema.index({
  status:
    1,

  startDate:
    1,
});

eventSchema.index({
  organizer:
    1,

  createdAt:
    -1,
});

eventSchema.index({
  type:
    1,

  startDate:
    1,
});

// =====================================================
// STATIC CONSTANTS
// =====================================================

eventSchema.statics.TYPES =
  EVENT_TYPES;

eventSchema.statics.MODES =
  EVENT_MODES;

// =====================================================
// MODEL
// =====================================================

const Event =
  mongoose.model(
    "Event",
    eventSchema
  );

module.exports =
  Event;