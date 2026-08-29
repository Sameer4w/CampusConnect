const mongoose = require("mongoose");

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1950;
const MAX_YEAR = CURRENT_YEAR + 10;

const MAX_ITEMS = {
  EDUCATION: 10,
  SKILLS: 50,
  PROJECTS: 20,
  CERTIFICATIONS: 20,
  ACHIEVEMENTS: 20,
  TECHNOLOGIES: 50,
};

const MAX_LENGTHS = {
  SKILL: 50,
  TECHNOLOGY: 50,
};

// Allows normal http/https URLs.
// Protocol is optional so existing user data such as github.com/user can be accepted.
const URL_REGEX =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

// =====================================================
// EDUCATION SUBDOCUMENT
// =====================================================

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      maxlength: [200, "Institution name cannot exceed 200 characters"],
    },

    degree: {
      type: String,
      trim: true,
      maxlength: [100, "Degree cannot exceed 100 characters"],
    },

    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [150, "Field of study cannot exceed 150 characters"],
    },

    startYear: {
      type: Number,
      min: [
        MIN_YEAR,
        `Start year cannot be earlier than ${MIN_YEAR}`,
      ],
      max: [
        MAX_YEAR,
        `Start year cannot be later than ${MAX_YEAR}`,
      ],
    },

    endYear: {
      type: Number,
      min: [
        MIN_YEAR,
        `End year cannot be earlier than ${MIN_YEAR}`,
      ],
      max: [
        MAX_YEAR,
        `End year cannot be later than ${MAX_YEAR}`,
      ],
    },

    grade: {
      type: String,
      trim: true,
      maxlength: [50, "Grade cannot exceed 50 characters"],
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// PROJECT SUBDOCUMENT
// =====================================================

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [200, "Project title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "Project description cannot exceed 2000 characters",
      ],
    },

    technologies: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            MAX_LENGTHS.TECHNOLOGY,
            `Technology cannot exceed ${MAX_LENGTHS.TECHNOLOGY} characters`,
          ],
        },
      ],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= MAX_ITEMS.TECHNOLOGIES,
        message: `Technologies cannot contain more than ${MAX_ITEMS.TECHNOLOGIES} items`,
      },
    },

    githubUrl: {
      type: String,
      trim: true,
      maxlength: [500, "GitHub URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid GitHub URL",
      },
    },

    liveUrl: {
      type: String,
      trim: true,
      maxlength: [500, "Live URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid live project URL",
      },
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// CERTIFICATION SUBDOCUMENT
// =====================================================

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Certification name is required"],
      trim: true,
      maxlength: [
        200,
        "Certification name cannot exceed 200 characters",
      ],
    },

    issuingOrganization: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "Issuing organization cannot exceed 200 characters",
      ],
    },

    issueDate: {
      type: Date,
    },

    credentialUrl: {
      type: String,
      trim: true,
      maxlength: [500, "Credential URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid credential URL",
      },
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// ACHIEVEMENT SUBDOCUMENT
// =====================================================

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Achievement title is required"],
      trim: true,
      maxlength: [
        200,
        "Achievement title cannot exceed 200 characters",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Achievement description cannot exceed 1000 characters",
      ],
    },

    date: {
      type: Date,
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// SOCIAL LINKS SUBDOCUMENT
// =====================================================

const socialLinksSchema = new mongoose.Schema(
  {
    github: {
      type: String,
      trim: true,
      maxlength: [500, "GitHub URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid GitHub URL",
      },
    },

    linkedin: {
      type: String,
      trim: true,
      maxlength: [500, "LinkedIn URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid LinkedIn URL",
      },
    },

    portfolio: {
      type: String,
      trim: true,
      maxlength: [500, "Portfolio URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid portfolio URL",
      },
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// RESUME SUBDOCUMENT
// =====================================================

// Actual file uploading will be implemented later using
// Multer + Cloudinary (or another cloud storage provider).
// For now this stores resume metadata/URL only.

const resumeSchema = new mongoose.Schema(
  {
    resumeUrl: {
      type: String,
      trim: true,
      maxlength: [500, "Resume URL cannot exceed 500 characters"],
      validate: {
        validator: (value) => !value || URL_REGEX.test(value),
        message: "Please provide a valid resume URL",
      },
    },

    resumeName: {
      type: String,
      trim: true,
      maxlength: [200, "Resume name cannot exceed 200 characters"],
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// STUDENT PROFILE
// =====================================================

const studentProfileSchema = new mongoose.Schema(
  {
    // One StudentProfile belongs to one User.
    // The User model remains responsible for:
    // name, email, password and role.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      validate: {
        validator: (value) =>
          !value || /^[+]?[\d\s().-]{7,20}$/.test(value),
        message: "Please provide a valid phone number",
      },
    },

    education: {
      type: [educationSchema],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= MAX_ITEMS.EDUCATION,
        message: `Cannot have more than ${MAX_ITEMS.EDUCATION} education entries`,
      },
    },

    skills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            MAX_LENGTHS.SKILL,
            `Skill cannot exceed ${MAX_LENGTHS.SKILL} characters`,
          ],
        },
      ],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= MAX_ITEMS.SKILLS,
        message: `Cannot have more than ${MAX_ITEMS.SKILLS} skills`,
      },
    },

    projects: {
      type: [projectSchema],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= MAX_ITEMS.PROJECTS,
        message: `Cannot have more than ${MAX_ITEMS.PROJECTS} projects`,
      },
    },

    certifications: {
      type: [certificationSchema],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= MAX_ITEMS.CERTIFICATIONS,
        message: `Cannot have more than ${MAX_ITEMS.CERTIFICATIONS} certifications`,
      },
    },

    achievements: {
      type: [achievementSchema],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= MAX_ITEMS.ACHIEVEMENTS,
        message: `Cannot have more than ${MAX_ITEMS.ACHIEVEMENTS} achievements`,
      },
    },

    social: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    resume: {
      type: resumeSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// NORMALIZATION
// =====================================================

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();

  return values
    .map((value) =>
      typeof value === "string" ? value.trim() : ""
    )
    .filter((value) => value.length > 0)
    .filter((value) => {
      const normalized = value.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

studentProfileSchema.pre("save", function (next) {
  if (this.isModified("skills")) {
    this.skills = normalizeStringArray(this.skills);
  }

  if (this.isModified("projects")) {
    this.projects.forEach((project) => {
      if (Array.isArray(project.technologies)) {
        project.technologies = normalizeStringArray(
          project.technologies
        );
      }
    });
  }

  next();
});

// =====================================================
// MODEL CONSTANTS
// =====================================================

studentProfileSchema.statics.MAX_ITEMS = MAX_ITEMS;

const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);

module.exports = StudentProfile;