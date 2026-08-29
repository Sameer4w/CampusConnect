const asyncHandler = require("express-async-handler");

const StudentProfile = require("../models/StudentProfile");
const {
  calculateProfileCompletion,
} = require("../utils/profileCompletion");

// =====================================================
// CONSTANTS
// =====================================================

const FORBIDDEN_FIELDS = [
  "_id",
  "user",
  "createdAt",
  "updatedAt",
  "__v",
];

const ALLOWED_FIELDS = [
  "phone",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "social",
  "resume",
];

const URL_REGEX =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/i;

const PHONE_REGEX = /^[+]?[\d\s()-.]{7,20}$/;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1950;
const MAX_YEAR = CURRENT_YEAR + 10;

const MAX = {
  education: 10,
  skills: 50,
  projects: 20,
  certifications: 20,
  achievements: 20,
  skillLen: 50,
};

// =====================================================
// RESPONSE BUILDER
// =====================================================

const buildResponse = (profileDoc) => {
  const {
    completionPercentage,
    suggestions,
    scoreBreakdown,
  } = calculateProfileCompletion(profileDoc);

  return {
    success: true,

    profile: profileDoc.toObject({
      versionKey: false,
    }),

    completionPercentage,

    suggestions,

    scoreBreakdown,
  };
};

// =====================================================
// PROFILE CREATION
// =====================================================

const getOrCreateProfile = async (userId) => {
  let profile = await StudentProfile.findOne({
    user: userId,
  });

  if (profile) {
    return profile;
  }

  try {
    profile = await StudentProfile.create({
      user: userId,
      phone: "",
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
      social: {},
      resume: {},
    });

    return profile;
  } catch (error) {
    // Handles race conditions where two requests attempt
    // to create the same profile at the same time.
    if (error.code === 11000) {
      return StudentProfile.findOne({
        user: userId,
      });
    }

    throw error;
  }
};

// =====================================================
// NORMALIZATION HELPERS
// =====================================================

const normalizeStringArray = (array) => {
  if (!Array.isArray(array)) {
    return [];
  }

  return [
    ...new Set(
      array
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : ""
        )
        .filter(
          (item) =>
            item.length > 0 &&
            item.length <= MAX.skillLen
        )
    ),
  ];
};

const normalizeSkills = (skills) =>
  normalizeStringArray(skills);

const normalizeTech = (technologies) =>
  normalizeStringArray(technologies);

// =====================================================
// VALIDATION HELPERS
// =====================================================

const validateUrl = (value, fieldName) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return;
  }

  if (
    typeof value !== "string" ||
    value.trim().length > 500
  ) {
    throw new Error(
      `${fieldName} must be a valid URL under 500 characters`
    );
  }

  if (!URL_REGEX.test(value.trim())) {
    throw new Error(
      `Invalid URL format for ${fieldName}`
    );
  }
};

const validatePhone = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return;
  }

  if (
    typeof value !== "string" ||
    !PHONE_REGEX.test(value.trim())
  ) {
    throw new Error(
      "Please provide a valid phone number"
    );
  }
};

const validateYear = (
  year,
  fieldName
) => {
  if (
    year === undefined ||
    year === null ||
    year === ""
  ) {
    return;
  }

  const numericYear = Number(year);

  if (
    !Number.isInteger(numericYear) ||
    numericYear < MIN_YEAR ||
    numericYear > MAX_YEAR
  ) {
    throw new Error(
      `${fieldName} must be between ${MIN_YEAR} and ${MAX_YEAR}`
    );
  }
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
    return;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(
      `Invalid date for ${fieldName}`
    );
  }
};

const ensureArray = (
  value,
  fieldName
) => {
  if (!Array.isArray(value)) {
    throw new Error(
      `${fieldName} must be an array`
    );
  }
};

const ensureObject = (
  value,
  fieldName
) => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      `${fieldName} must be an object`
    );
  }
};

// =====================================================
// EDUCATION VALIDATION
// =====================================================

const validateEducation = (
  education
) => {
  ensureArray(
    education,
    "Education"
  );

  if (
    education.length >
    MAX.education
  ) {
    throw new Error(
      `Maximum ${MAX.education} education entries allowed`
    );
  }

  return education.map(
    (item, index) => {
      ensureObject(
        item,
        `Education[${index}]`
      );

      if (
        typeof item.institution !==
          "string" ||
        !item.institution.trim()
      ) {
        throw new Error(
          `Education[${index}] institution is required`
        );
      }

      if (
        item.institution.trim().length >
        200
      ) {
        throw new Error(
          `Education[${index}] institution cannot exceed 200 characters`
        );
      }

      validateYear(
        item.startYear,
        `Education[${index}] startYear`
      );

      validateYear(
        item.endYear,
        `Education[${index}] endYear`
      );

      if (
        item.startYear &&
        item.endYear &&
        Number(item.startYear) >
          Number(item.endYear)
      ) {
        throw new Error(
          `Education[${index}] startYear cannot be later than endYear`
        );
      }

      return {
        institution:
          item.institution.trim(),

        degree:
          typeof item.degree ===
          "string"
            ? item.degree
                .trim()
                .slice(0, 100)
            : "",

        fieldOfStudy:
          typeof item.fieldOfStudy ===
          "string"
            ? item.fieldOfStudy
                .trim()
                .slice(0, 150)
            : "",

        startYear:
          item.startYear !== undefined &&
          item.startYear !== null &&
          item.startYear !== ""
            ? Number(item.startYear)
            : undefined,

        endYear:
          item.endYear !== undefined &&
          item.endYear !== null &&
          item.endYear !== ""
            ? Number(item.endYear)
            : undefined,

        grade:
          typeof item.grade ===
          "string"
            ? item.grade
                .trim()
                .slice(0, 50)
            : "",
      };
    }
  );
};

// =====================================================
// PROJECT VALIDATION
// =====================================================

const validateProjects = (
  projects
) => {
  ensureArray(
    projects,
    "Projects"
  );

  if (
    projects.length >
    MAX.projects
  ) {
    throw new Error(
      `Maximum ${MAX.projects} projects allowed`
    );
  }

  return projects.map(
    (project, index) => {
      ensureObject(
        project,
        `Projects[${index}]`
      );

      if (
        typeof project.title !==
          "string" ||
        !project.title.trim()
      ) {
        throw new Error(
          `Projects[${index}] title is required`
        );
      }

      if (
        project.title.trim().length >
        200
      ) {
        throw new Error(
          `Projects[${index}] title cannot exceed 200 characters`
        );
      }

      validateUrl(
        project.githubUrl,
        `Projects[${index}] githubUrl`
      );

      validateUrl(
        project.liveUrl,
        `Projects[${index}] liveUrl`
      );

      return {
        title:
          project.title.trim(),

        description:
          typeof project.description ===
          "string"
            ? project.description
                .trim()
                .slice(0, 2000)
            : "",

        technologies:
          normalizeTech(
            project.technologies
          ),

        githubUrl:
          typeof project.githubUrl ===
          "string"
            ? project.githubUrl.trim()
            : "",

        liveUrl:
          typeof project.liveUrl ===
          "string"
            ? project.liveUrl.trim()
            : "",
      };
    }
  );
};

// =====================================================
// CERTIFICATION VALIDATION
// =====================================================

const validateCertifications = (
  certifications
) => {
  ensureArray(
    certifications,
    "Certifications"
  );

  if (
    certifications.length >
    MAX.certifications
  ) {
    throw new Error(
      `Maximum ${MAX.certifications} certifications allowed`
    );
  }

  return certifications.map(
    (certification, index) => {
      ensureObject(
        certification,
        `Certifications[${index}]`
      );

      if (
        typeof certification.name !==
          "string" ||
        !certification.name.trim()
      ) {
        throw new Error(
          `Certifications[${index}] name is required`
        );
      }

      if (
        certification.name.trim().length >
        200
      ) {
        throw new Error(
          `Certifications[${index}] name cannot exceed 200 characters`
        );
      }

      validateUrl(
        certification.credentialUrl,
        `Certifications[${index}] credentialUrl`
      );

      validateDate(
        certification.issueDate,
        `Certifications[${index}] issueDate`
      );

      return {
        name:
          certification.name.trim(),

        issuingOrganization:
          typeof certification.issuingOrganization ===
          "string"
            ? certification.issuingOrganization
                .trim()
                .slice(0, 200)
            : "",

        issueDate:
          certification.issueDate ||
          undefined,

        credentialUrl:
          typeof certification.credentialUrl ===
          "string"
            ? certification.credentialUrl.trim()
            : "",
      };
    }
  );
};

// =====================================================
// ACHIEVEMENT VALIDATION
// =====================================================

const validateAchievements = (
  achievements
) => {
  ensureArray(
    achievements,
    "Achievements"
  );

  if (
    achievements.length >
    MAX.achievements
  ) {
    throw new Error(
      `Maximum ${MAX.achievements} achievements allowed`
    );
  }

  return achievements.map(
    (achievement, index) => {
      ensureObject(
        achievement,
        `Achievements[${index}]`
      );

      if (
        typeof achievement.title !==
          "string" ||
        !achievement.title.trim()
      ) {
        throw new Error(
          `Achievements[${index}] title is required`
        );
      }

      if (
        achievement.title.trim().length >
        200
      ) {
        throw new Error(
          `Achievements[${index}] title cannot exceed 200 characters`
        );
      }

      validateDate(
        achievement.date,
        `Achievements[${index}] date`
      );

      return {
        title:
          achievement.title.trim(),

        description:
          typeof achievement.description ===
          "string"
            ? achievement.description
                .trim()
                .slice(0, 1000)
            : "",

        date:
          achievement.date ||
          undefined,
      };
    }
  );
};

// =====================================================
// SOCIAL VALIDATION
// =====================================================

const validateSocial = (
  social
) => {
  if (
    social === undefined ||
    social === null
  ) {
    return {};
  }

  ensureObject(
    social,
    "Social"
  );

  validateUrl(
    social.github,
    "social.github"
  );

  validateUrl(
    social.linkedin,
    "social.linkedin"
  );

  validateUrl(
    social.portfolio,
    "social.portfolio"
  );

  return {
    github:
      typeof social.github ===
      "string"
        ? social.github.trim()
        : "",

    linkedin:
      typeof social.linkedin ===
      "string"
        ? social.linkedin.trim()
        : "",

    portfolio:
      typeof social.portfolio ===
      "string"
        ? social.portfolio.trim()
        : "",
  };
};

// =====================================================
// RESUME VALIDATION
// =====================================================

const validateResume = (
  resume
) => {
  if (
    resume === undefined ||
    resume === null
  ) {
    return {};
  }

  ensureObject(
    resume,
    "Resume"
  );

  validateUrl(
    resume.resumeUrl,
    "resume.resumeUrl"
  );

  return {
    resumeUrl:
      typeof resume.resumeUrl ===
      "string"
        ? resume.resumeUrl.trim()
        : "",

    resumeName:
      typeof resume.resumeName ===
      "string"
        ? resume.resumeName
            .trim()
            .slice(0, 200)
        : "",
  };
};

// =====================================================
// GET CURRENT USER PROFILE
// =====================================================

const getMyProfile =
  asyncHandler(
    async (req, res) => {
      const profile =
        await getOrCreateProfile(
          req.user._id
        );

      res.status(200).json(
        buildResponse(profile)
      );
    }
  );

// =====================================================
// UPDATE CURRENT USER PROFILE
// =====================================================

const updateMyProfile =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user._id;

      const body =
        req.body || {};

      // -----------------------------------------------
      // Reject protected fields
      // -----------------------------------------------

      const forbiddenFields =
        FORBIDDEN_FIELDS.filter(
          (field) =>
            Object.prototype.hasOwnProperty.call(
              body,
              field
            )
        );

      if (
        forbiddenFields.length >
        0
      ) {
        res.status(400);

        throw new Error(
          `Cannot modify protected fields: ${forbiddenFields.join(
            ", "
          )}`
        );
      }

      // -----------------------------------------------
      // Reject unknown fields
      // -----------------------------------------------

      const unknownFields =
        Object.keys(body).filter(
          (field) =>
            !ALLOWED_FIELDS.includes(
              field
            )
        );

      if (
        unknownFields.length >
        0
      ) {
        res.status(400);

        throw new Error(
          `Unknown profile fields: ${unknownFields.join(
            ", "
          )}`
        );
      }

      // -----------------------------------------------
      // Validate update fields
      // -----------------------------------------------

      const update = {};

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "phone"
        )
      ) {
        validatePhone(
          body.phone
        );

        update.phone =
          typeof body.phone ===
          "string"
            ? body.phone.trim()
            : "";
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "skills"
        )
      ) {
        if (
          !Array.isArray(
            body.skills
          )
        ) {
          res.status(400);

          throw new Error(
            "Skills must be an array"
          );
        }

        const skills =
          normalizeSkills(
            body.skills
          );

        if (
          skills.length >
          MAX.skills
        ) {
          res.status(400);

          throw new Error(
            `Maximum ${MAX.skills} skills allowed`
          );
        }

        update.skills =
          skills;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "education"
        )
      ) {
        update.education =
          validateEducation(
            body.education
          );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "projects"
        )
      ) {
        update.projects =
          validateProjects(
            body.projects
          );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "certifications"
        )
      ) {
        update.certifications =
          validateCertifications(
            body.certifications
          );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "achievements"
        )
      ) {
        update.achievements =
          validateAchievements(
            body.achievements
          );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "social"
        )
      ) {
        update.social =
          validateSocial(
            body.social
          );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "resume"
        )
      ) {
        update.resume =
          validateResume(
            body.resume
          );
      }

      // -----------------------------------------------
      // Ensure profile exists
      // -----------------------------------------------

      await getOrCreateProfile(
        userId
      );

      // -----------------------------------------------
      // Update profile
      // -----------------------------------------------

      const updatedProfile =
        await StudentProfile.findOneAndUpdate(
          {
            user: userId,
          },
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
            context: "query",
          }
        );

      res.status(200).json(
        buildResponse(
          updatedProfile
        )
      );
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getMyProfile,
  updateMyProfile,
};