const mongoose = require("mongoose");

// =====================================================
// CONSTANTS
// =====================================================

const OPPORTUNITY_TYPES = [
  "Internship",
  "Full-time",
  "Part-time",
];

const WORK_MODES = [
  "On-site",
  "Remote",
  "Hybrid",
];

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Entry-level",
  "Intermediate",
  "Experienced",
];

const OPPORTUNITY_CATEGORIES = [
  "Software Development",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Cloud Computing",
  "UI/UX Design",
  "Product Management",
  "Marketing",
  "Business",
  "Finance",
  "Human Resources",
  "Other",
];

// =====================================================
// SCHEMA
// =====================================================

const opportunitySchema = new mongoose.Schema(
  {
    // ===============================================
    // BASIC INFORMATION
    // ===============================================

    title: {
      type: String,
      required: [
        true,
        "Opportunity title is required",
      ],
      trim: true,
      maxlength: [
        120,
        "Title cannot exceed 120 characters",
      ],
    },

    company: {
      type: String,
      required: [
        true,
        "Company name is required",
      ],
      trim: true,
      maxlength: [
        120,
        "Company name cannot exceed 120 characters",
      ],
    },

    type: {
      type: String,
      enum: {
        values: OPPORTUNITY_TYPES,
        message:
          "Invalid opportunity type",
      },
      required: [
        true,
        "Opportunity type is required",
      ],
    },

    category: {
      type: String,
      enum: {
        values: OPPORTUNITY_CATEGORIES,
        message:
          "Invalid opportunity category",
      },
      default: "Other",
    },

    // ===============================================
    // LOCATION
    // ===============================================

    location: {
      type: String,
      required: [
        true,
        "Location is required",
      ],
      trim: true,
      maxlength: [
        150,
        "Location cannot exceed 150 characters",
      ],
    },

    workMode: {
      type: String,
      enum: {
        values: WORK_MODES,
        message:
          "Invalid work mode",
      },
      default: "On-site",
    },

    // ===============================================
    // EXPERIENCE
    // ===============================================

    experienceLevel: {
      type: String,
      enum: {
        values: EXPERIENCE_LEVELS,
        message:
          "Invalid experience level",
      },
      default: "Fresher",
    },

    // ===============================================
    // DESCRIPTION
    // ===============================================

    description: {
      type: String,
      required: [
        true,
        "Description is required",
      ],
      trim: true,
      maxlength: [
        5000,
        "Description cannot exceed 5000 characters",
      ],
    },

    // ===============================================
    // SKILLS
    // ===============================================

    requiredSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            50,
            "Skill cannot exceed 50 characters",
          ],
        },
      ],
      default: [],
    },

    preferredSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            50,
            "Skill cannot exceed 50 characters",
          ],
        },
      ],
      default: [],
    },

    // ===============================================
    // COMPENSATION
    // ===============================================

    salary: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Salary cannot exceed 100 characters",
      ],
      default: "",
    },

    // ===============================================
    // OPENINGS
    // ===============================================

    openings: {
      type: Number,
      min: [
        1,
        "At least one opening is required",
      ],
      default: 1,
    },

    // ===============================================
    // DEADLINE
    // ===============================================

    deadline: {
      type: Date,
      required: [
        true,
        "Application deadline is required",
      ],
    },

    // ===============================================
    // RECRUITER
    // ===============================================

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ===============================================
    // STATUS
    // ===============================================

    status: {
      type: String,
      enum: [
        "open",
        "closed",
      ],
      default: "open",
      index: true,
    },

    // ===============================================
    // FEATURED OPPORTUNITY
    // ===============================================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ===============================================
    // TAGS
    // ===============================================

    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            50,
            "Tag cannot exceed 50 characters",
          ],
        },
      ],
      default: [],
    },

    // ===============================================
    // ANALYTICS
    // ===============================================

    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// NORMALIZE STRING ARRAYS
// =====================================================

const normalizeStringArray = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();

  return values
    .map((value) =>
      typeof value === "string"
        ? value.trim()
        : ""
    )
    .filter(
      (value) =>
        value.length > 0
    )
    .filter((value) => {
      const normalized =
        value.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);

      return true;
    });
};

// =====================================================
// NORMALIZE BEFORE SAVE
// =====================================================

opportunitySchema.pre(
  "save",
  function (next) {
    if (
      this.isModified(
        "requiredSkills"
      )
    ) {
      this.requiredSkills =
        normalizeStringArray(
          this.requiredSkills
        );
    }

    if (
      this.isModified(
        "preferredSkills"
      )
    ) {
      this.preferredSkills =
        normalizeStringArray(
          this.preferredSkills
        );
    }

    if (
      this.isModified(
        "tags"
      )
    ) {
      this.tags =
        normalizeStringArray(
          this.tags
        );
    }

    next();
  }
);

// =====================================================
// INDEXES
// =====================================================

// Search and filter optimization

opportunitySchema.index({
  status: 1,
  deadline: 1,
});

opportunitySchema.index({
  type: 1,
  workMode: 1,
});

opportunitySchema.index({
  recruiter: 1,
  createdAt: -1,
});

opportunitySchema.index({
  requiredSkills: 1,
});

// =====================================================
// STATIC CONSTANTS
// =====================================================

opportunitySchema.statics.TYPES =
  OPPORTUNITY_TYPES;

opportunitySchema.statics.WORK_MODES =
  WORK_MODES;

opportunitySchema.statics.EXPERIENCE_LEVELS =
  EXPERIENCE_LEVELS;

opportunitySchema.statics.CATEGORIES =
  OPPORTUNITY_CATEGORIES;

// =====================================================
// MODEL
// =====================================================

const Opportunity =
  mongoose.model(
    "Opportunity",
    opportunitySchema
  );

module.exports = Opportunity;