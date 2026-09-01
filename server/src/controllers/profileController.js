const asyncHandler = require("express-async-handler");

const StudentProfile = require("../models/StudentProfile");
const cloudinary = require("../config/cloudinary");

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
  "bio",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "social",
  "resume",
];

const URL_REGEX =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

const PHONE_REGEX =
  /^[+]?[\d\s()-.]{7,20}$/;

const CURRENT_YEAR =
  new Date().getFullYear();

const MIN_YEAR = 1950;

const MAX_YEAR =
  CURRENT_YEAR + 10;

const MAX = {
  education: 10,
  skills: 50,
  projects: 20,
  certifications: 20,
  achievements: 20,
  technologies: 50,
  skillLen: 50,
  technologyLen: 50,
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
// RESPONSE BUILDER
// =====================================================

const buildResponse = (profileDoc) => {
  const {
    completionPercentage,
    suggestions,
    scoreBreakdown,
  } =
    calculateProfileCompletion(profileDoc);

  return {
    success: true,

    profile:
      profileDoc.toObject({
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

const getOrCreateProfile =
  async (userId) => {
    let profile =
      await StudentProfile.findOne({
        user: userId,
      });

    if (profile) {
      return profile;
    }

    try {
      profile =
        await StudentProfile.create({
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

      // Handles simultaneous profile creation requests
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

const normalizeStringArray = (
  array,
  maxLength
) => {
  if (!Array.isArray(array)) {
    return [];
  }

  const seen = new Set();

  return array
    .map((item) =>
      typeof item === "string"
        ? item.trim()
        : ""
    )
    .filter(
      (item) =>
        item.length > 0 &&
        item.length <= maxLength
    )
    .filter((item) => {
      const normalized =
        item.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);

      return true;
    });
};

const normalizeSkills =
  (skills) =>
    normalizeStringArray(
      skills,
      MAX.skillLen
    );

const normalizeTech =
  (technologies) =>
    normalizeStringArray(
      technologies,
      MAX.technologyLen
    );

// =====================================================
// VALIDATION HELPERS
// =====================================================

const validateUrl = (
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

  if (
    typeof value !== "string"
  ) {
    throwValidationError(
      `${fieldName} must be a valid URL`
    );
  }

  if (
    value.trim().length > 500
  ) {
    throwValidationError(
      `${fieldName} must be under 500 characters`
    );
  }

  if (
    !URL_REGEX.test(
      value.trim()
    )
  ) {
    throwValidationError(
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
    !PHONE_REGEX.test(
      value.trim()
    )
  ) {
    throwValidationError(
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

  const numericYear =
    Number(year);

  if (
    !Number.isInteger(
      numericYear
    ) ||
    numericYear < MIN_YEAR ||
    numericYear > MAX_YEAR
  ) {
    throwValidationError(
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

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throwValidationError(
      `Invalid date for ${fieldName}`
    );
  }
};

const ensureArray = (
  value,
  fieldName
) => {
  if (!Array.isArray(value)) {
    throwValidationError(
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
    throwValidationError(
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
    throwValidationError(
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
        throwValidationError(
          `Education[${index}] institution is required`
        );
      }

      if (
        item.institution
          .trim()
          .length > 200
      ) {
        throwValidationError(
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
        item.startYear !== undefined &&
        item.startYear !== null &&
        item.startYear !== "" &&
        item.endYear !== undefined &&
        item.endYear !== null &&
        item.endYear !== "" &&
        Number(item.startYear) >
          Number(item.endYear)
      ) {
        throwValidationError(
          `Education[${index}] startYear cannot be later than endYear`
        );
      }

      return {
        institution:
          item.institution.trim(),

        degree:
          typeof item.degree === "string"
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
          typeof item.grade === "string"
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
    throwValidationError(
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
        throwValidationError(
          `Projects[${index}] title is required`
        );
      }

      if (
        project.title
          .trim()
          .length > 200
      ) {
        throwValidationError(
          `Projects[${index}] title cannot exceed 200 characters`
        );
      }

      if (
        project.description !== undefined &&
        project.description !== null &&
        typeof project.description !==
          "string"
      ) {
        throwValidationError(
          `Projects[${index}] description must be a string`
        );
      }

      if (
        project.technologies !==
        undefined
      ) {
        ensureArray(
          project.technologies,
          `Projects[${index}] technologies`
        );

        if (
          project.technologies.length >
          MAX.technologies
        ) {
          throwValidationError(
            `Projects[${index}] can contain a maximum of ${MAX.technologies} technologies`
          );
        }
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
            project.technologies || []
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

const validateCertifications =
  (certifications) => {
    ensureArray(
      certifications,
      "Certifications"
    );

    if (
      certifications.length >
      MAX.certifications
    ) {
      throwValidationError(
        `Maximum ${MAX.certifications} certifications allowed`
      );
    }

    return certifications.map(
      (
        certification,
        index
      ) => {
        ensureObject(
          certification,
          `Certifications[${index}]`
        );

        if (
          typeof certification.name !==
            "string" ||
          !certification.name.trim()
        ) {
          throwValidationError(
            `Certifications[${index}] name is required`
          );
        }

        if (
          certification.name
            .trim()
            .length > 200
        ) {
          throwValidationError(
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
              ? certification
                  .issuingOrganization
                  .trim()
                  .slice(0, 200)
              : "",

          issueDate:
            certification.issueDate ||
            undefined,

          credentialUrl:
            typeof certification.credentialUrl ===
            "string"
              ? certification
                  .credentialUrl
                  .trim()
              : "",
        };
      }
    );
  };

// =====================================================
// ACHIEVEMENT VALIDATION
// =====================================================

const validateAchievements =
  (achievements) => {
    ensureArray(
      achievements,
      "Achievements"
    );

    if (
      achievements.length >
      MAX.achievements
    ) {
      throwValidationError(
        `Maximum ${MAX.achievements} achievements allowed`
      );
    }

    return achievements.map(
      (
        achievement,
        index
      ) => {
        ensureObject(
          achievement,
          `Achievements[${index}]`
        );

        if (
          typeof achievement.title !==
            "string" ||
          !achievement.title.trim()
        ) {
          throwValidationError(
            `Achievements[${index}] title is required`
          );
        }

        if (
          achievement.title
            .trim()
            .length > 200
        ) {
          throwValidationError(
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

const validateSocial =
  (social) => {
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
// CLOUDINARY UPLOAD HELPER
// =====================================================

const uploadBufferToCloudinary =
  (
    buffer,
    originalName
  ) => {
    return new Promise(
      (
        resolve,
        reject
      ) => {
        const cleanFileName =
          originalName
            .replace(
              /\.pdf$/i,
              ""
            )
            .replace(
              /[^a-zA-Z0-9_-]/g,
              "_"
            );

        const publicId =
          `resume_${Date.now()}_${cleanFileName}`;

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              resource_type:
                "raw",

              folder:
                "campusconnect/resumes",

              public_id:
                publicId,

              format:
                "pdf",
            },
            (
              error,
              result
            ) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(result);
            }
          );

        uploadStream.end(
          buffer
        );
      }
    );
  };

// =====================================================
// CLOUDINARY DELETE HELPER
// =====================================================

const deleteFromCloudinary =
  async (publicId) => {
    if (!publicId) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type:
            "raw",
        }
      );

    } catch (error) {
      console.error(
        "Failed to delete resume from Cloudinary:",
        error.message
      );
    }
  };

// =====================================================
// GET CURRENT USER PROFILE
// GET /api/users/profile
// =====================================================

const getMyProfile =
  asyncHandler(
    async (
      req,
      res
    ) => {
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
// PUT /api/users/profile
// =====================================================

const updateMyProfile =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const userId =
        req.user._id;

      const body =
        req.body || {};

      // -----------------------------------------------
      // REJECT PROTECTED FIELDS
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
        forbiddenFields.length > 0
      ) {
        throwValidationError(
          `Cannot modify protected fields: ${forbiddenFields.join(
            ", "
          )}`
        );
      }

      // -----------------------------------------------
      // REJECT UNKNOWN FIELDS
      // -----------------------------------------------

      const unknownFields =
        Object.keys(body).filter(
          (field) =>
            !ALLOWED_FIELDS.includes(
              field
            )
        );

      if (
        unknownFields.length > 0
      ) {
        throwValidationError(
          `Unknown profile fields: ${unknownFields.join(
            ", "
          )}`
        );
      }

      const update = {};

      // -----------------------------------------------
      // PHONE
      // -----------------------------------------------

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

      // -----------------------------------------------
      // BIO
      // -----------------------------------------------

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "bio"
        )
      ) {
        if (
          body.bio !== null &&
          body.bio !== undefined &&
          typeof body.bio !== "string"
        ) {
          throwValidationError(
            "Bio must be a string"
          );
        }

        if (
          typeof body.bio === "string" &&
          body.bio.trim().length > 500
        ) {
          throwValidationError(
            "Bio cannot exceed 500 characters"
          );
        }

        update.bio =
          typeof body.bio === "string"
            ? body.bio.trim()
            : "";
      }

      // -----------------------------------------------
      // SKILLS
      // -----------------------------------------------

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "skills"
        )
      ) {
        ensureArray(
          body.skills,
          "Skills"
        );

        const skills =
          normalizeSkills(
            body.skills
          );

        if (
          skills.length >
          MAX.skills
        ) {
          throwValidationError(
            `Maximum ${MAX.skills} skills allowed`
          );
        }

        update.skills =
          skills;
      }

      // -----------------------------------------------
      // EDUCATION
      // -----------------------------------------------

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

      // -----------------------------------------------
      // PROJECTS
      // -----------------------------------------------

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

      // -----------------------------------------------
      // CERTIFICATIONS
      // -----------------------------------------------

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

      // -----------------------------------------------
      // ACHIEVEMENTS
      // -----------------------------------------------

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

      // -----------------------------------------------
      // SOCIAL
      // -----------------------------------------------

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

      // -----------------------------------------------
      // RESUME
      // -----------------------------------------------

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
      // ENSURE PROFILE EXISTS
      // -----------------------------------------------

      await getOrCreateProfile(
        userId
      );

      // -----------------------------------------------
      // UPDATE PROFILE
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
// UPLOAD / REPLACE RESUME
// POST /api/users/profile/resume
// =====================================================

const uploadResume =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (!req.file) {
        throwValidationError(
          "Please select a PDF resume file to upload."
        );
      }

      if (
        req.file.mimetype !==
        "application/pdf"
      ) {
        throwValidationError(
          "Only PDF files are allowed. Please upload a .pdf resume."
        );
      }

      const MAX_FILE_SIZE =
        5 * 1024 * 1024;

      if (
        req.file.size >
        MAX_FILE_SIZE
      ) {
        throwValidationError(
          "Resume file must be 5 MB or smaller."
        );
      }

      // -----------------------------------------------
      // GET PROFILE
      // -----------------------------------------------

      const existingProfile =
        await getOrCreateProfile(
          req.user._id
        );

      const oldPublicId =
        existingProfile.resume
          ?.publicId;

      // -----------------------------------------------
      // UPLOAD NEW FILE
      // -----------------------------------------------

      let uploadResult;

      try {
        uploadResult =
          await uploadBufferToCloudinary(
            req.file.buffer,
            req.file.originalname
          );

      } catch (error) {
        console.error(
          "Cloudinary upload error:",
          error
        );

        const uploadError =
          new Error(
            "Resume upload failed. Please try again."
          );

        uploadError.statusCode = 500;

        throw uploadError;
      }

      // -----------------------------------------------
      // UPDATE DATABASE
      // -----------------------------------------------

      const updatedProfile =
        await StudentProfile.findOneAndUpdate(
          {
            user:
              req.user._id,
          },
          {
            $set: {
              resume: {
                resumeUrl:
                  uploadResult.secure_url,

                resumeName:
                  req.file.originalname,

                publicId:
                  uploadResult.public_id,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      // -----------------------------------------------
      // DELETE OLD FILE
      // -----------------------------------------------

      if (
        oldPublicId &&
        oldPublicId !==
          uploadResult.public_id
      ) {
        await deleteFromCloudinary(
          oldPublicId
        );
      }

      res.status(200).json({
        ...buildResponse(
          updatedProfile
        ),

        message:
          oldPublicId
            ? "Resume replaced successfully."
            : "Resume uploaded successfully.",
      });
    }
  );

// =====================================================
// DELETE RESUME
// DELETE /api/users/profile/resume
// =====================================================

const deleteResume =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await getOrCreateProfile(
          req.user._id
        );

      const publicId =
        profile.resume
          ?.publicId;

      if (
        !profile.resume
          ?.resumeUrl
      ) {
        const error =
          new Error(
            "No resume found to delete."
          );

        error.statusCode = 404;

        throw error;
      }

      // -----------------------------------------------
      // DELETE FROM CLOUDINARY
      // -----------------------------------------------

      if (publicId) {
        await deleteFromCloudinary(
          publicId
        );
      }

      // -----------------------------------------------
      // REMOVE FROM DATABASE
      // -----------------------------------------------

      profile.resume = {
        resumeUrl: "",
        resumeName: "",
        publicId: "",
      };

      await profile.save();

      res.status(200).json({
        ...buildResponse(
          profile
        ),

        message:
          "Resume deleted successfully.",
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
};