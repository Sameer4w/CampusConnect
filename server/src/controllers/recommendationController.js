const asyncHandler =
  require("express-async-handler");

const Job =
  require("../models/Job");

const Opportunity =
  require("../models/Opportunity");

const StudentProfile =
  require("../models/StudentProfile");

// =====================================================
// CONSTANTS
// =====================================================

const MAX_RECOMMENDATIONS = 50;

const DEFAULT_LIMIT = 10;

// =====================================================
// HELPERS
// =====================================================

const normalizeValue =
  (value) => {
    if (
      typeof value !==
      "string"
    ) {
      return "";
    }

    return value
      .trim()
      .toLowerCase();
  };

const normalizeArray =
  (values) => {
    if (
      !Array.isArray(values)
    ) {
      return [];
    }

    const seen =
      new Set();

    return values
      .map(
        (value) =>
          typeof value ===
          "string"
            ? value.trim()
            : ""
      )
      .filter(
        (value) =>
          value.length > 0
      )
      .filter(
        (value) => {
          const normalized =
            normalizeValue(
              value
            );

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
  };

// =====================================================
// GET STUDENT MATCHING SKILLS
// =====================================================

const getStudentSkills =
  (profile) => {
    if (
      !profile
    ) {
      return [];
    }

    const skills = [
      ...normalizeArray(
        profile.skills
      ),
    ];

    // -----------------------------------------------
    // ADD PROJECT TECHNOLOGIES
    // -----------------------------------------------

    if (
      Array.isArray(
        profile.projects
      )
    ) {
      profile.projects.forEach(
        (project) => {
          if (
            Array.isArray(
              project.technologies
            )
          ) {
            skills.push(
              ...normalizeArray(
                project.technologies
              )
            );
          }
        }
      );
    }

    return normalizeArray(
      skills
    );
  };

// =====================================================
// FIND MATCHING SKILLS
// =====================================================

const findSkillMatches =
  (
    studentSkills,
    requiredSkills
  ) => {
    const studentSkillMap =
      new Map();

    studentSkills.forEach(
      (skill) => {
        studentSkillMap.set(
          normalizeValue(
            skill
          ),
          skill
        );
      }
    );

    const matchedSkills = [];

    const missingSkills = [];

    normalizeArray(
      requiredSkills
    ).forEach(
      (skill) => {
        const normalized =
          normalizeValue(
            skill
          );

        if (
          studentSkillMap.has(
            normalized
          )
        ) {
          matchedSkills.push(
            skill
          );
        } else {
          missingSkills.push(
            skill
          );
        }
      }
    );

    return {
      matchedSkills,
      missingSkills,
    };
  };

// =====================================================
// CALCULATE PERCENTAGE
// =====================================================

const calculatePercentage =
  (
    matched,
    total
  ) => {
    if (
      total <= 0
    ) {
      return 0;
    }

    return Math.round(
      (
        matched /
        total
      ) *
        100
    );
  };

// =====================================================
// BUILD JOB RECOMMENDATION
// =====================================================

const buildJobRecommendation =
  (
    job,
    studentSkills
  ) => {
    const {
      matchedSkills,
      missingSkills,
    } =
      findSkillMatches(
        studentSkills,
        job.requiredSkills
      );

    const totalSkills =
      normalizeArray(
        job.requiredSkills
      ).length;

    let matchScore;

    // -----------------------------------------------
    // JOB WITHOUT REQUIRED SKILLS
    // -----------------------------------------------

    if (
      totalSkills === 0
    ) {
      matchScore = 50;
    } else {
      matchScore =
        calculatePercentage(
          matchedSkills.length,
          totalSkills
        );
    }

    const reasons = [];

    if (
      matchedSkills.length > 0
    ) {
      reasons.push(
        `You match ${matchedSkills.length} of ${totalSkills} required skill${
          totalSkills === 1
            ? ""
            : "s"
        }.`
      );
    }

    if (
      matchedSkills.length ===
      totalSkills &&
      totalSkills > 0
    ) {
      reasons.push(
        "You match all required skills for this job."
      );
    }

    if (
      totalSkills === 0
    ) {
      reasons.push(
        "This job does not specify required skills."
      );
    }

    return {
      job,

      matchScore,

      matchedSkills,

      missingSkills,

      reasons,
    };
  };

// =====================================================
// BUILD OPPORTUNITY RECOMMENDATION
// =====================================================

const buildOpportunityRecommendation =
  (
    opportunity,
    studentSkills
  ) => {
    // -----------------------------------------------
    // REQUIRED SKILLS
    // -----------------------------------------------

    const requiredSkills =
      normalizeArray(
        opportunity.requiredSkills
      );

    const {
      matchedSkills:
        matchedRequiredSkills,

      missingSkills:
        missingRequiredSkills,
    } =
      findSkillMatches(
        studentSkills,
        requiredSkills
      );

    // -----------------------------------------------
    // PREFERRED SKILLS
    // -----------------------------------------------

    const preferredSkills =
      normalizeArray(
        opportunity.preferredSkills
      );

    const {
      matchedSkills:
        matchedPreferredSkills,

      missingSkills:
        missingPreferredSkills,
    } =
      findSkillMatches(
        studentSkills,
        preferredSkills
      );

    // -----------------------------------------------
    // SCORE
    //
    // Required skills = 70%
    // Preferred skills = 30%
    // -----------------------------------------------

    const requiredScore =
      requiredSkills.length > 0
        ? calculatePercentage(
            matchedRequiredSkills.length,
            requiredSkills.length
          )
        : 100;

    const preferredScore =
      preferredSkills.length > 0
        ? calculatePercentage(
            matchedPreferredSkills.length,
            preferredSkills.length
          )
        : 100;

    let matchScore;

    if (
      requiredSkills.length > 0 &&
      preferredSkills.length > 0
    ) {
      matchScore =
        Math.round(
          (
            requiredScore *
            0.7
          ) +
          (
            preferredScore *
            0.3
          )
        );
    } else if (
      requiredSkills.length > 0
    ) {
      matchScore =
        requiredScore;
    } else if (
      preferredSkills.length > 0
    ) {
      matchScore =
        preferredScore;
    } else {
      matchScore = 50;
    }

    const matchedSkills =
      [
        ...matchedRequiredSkills,
        ...matchedPreferredSkills,
      ];

    const missingSkills =
      [
        ...missingRequiredSkills,
        ...missingPreferredSkills,
      ];

    const reasons = [];

    if (
      matchedRequiredSkills.length >
      0
    ) {
      reasons.push(
        `You match ${matchedRequiredSkills.length} required skill${
          matchedRequiredSkills.length ===
          1
            ? ""
            : "s"
        }.`
      );
    }

    if (
      matchedPreferredSkills.length >
      0
    ) {
      reasons.push(
        `You also match ${matchedPreferredSkills.length} preferred skill${
          matchedPreferredSkills.length ===
          1
            ? ""
            : "s"
        }.`
      );
    }

    if (
      requiredSkills.length === 0 &&
      preferredSkills.length === 0
    ) {
      reasons.push(
        "This opportunity does not specify skill requirements."
      );
    }

    return {
      opportunity,

      matchScore,

      matchedSkills:
        normalizeArray(
          matchedSkills
        ),

      missingSkills:
        normalizeArray(
          missingSkills
        ),

      reasons,
    };
  };

// =====================================================
// GET STUDENT PROFILE
// =====================================================

const getStudentProfile =
  async (
    userId
  ) => {
    const profile =
      await StudentProfile.findOne({
        user:
          userId,
      }).lean();

    if (
      !profile
    ) {
      throw new Error(
        "Student profile not found. Please complete your profile to receive recommendations."
      );
    }

    return profile;
  };

// =====================================================
// GET JOB RECOMMENDATIONS
// STUDENT ONLY
// =====================================================

const getJobRecommendations =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await getStudentProfile(
          req.user._id
        );

      const studentSkills =
        getStudentSkills(
          profile
        );

      const requestedLimit =
        Number(
          req.query.limit
        );

      const limit =
        Math.min(
          MAX_RECOMMENDATIONS,
          Math.max(
            1,
            Number.isFinite(
              requestedLimit
            )
              ? requestedLimit
              : DEFAULT_LIMIT
          )
        );

      // -----------------------------------------------
      // GET ACTIVE JOBS
      // -----------------------------------------------

      const jobs =
        await Job.find({
          status:
            "active",
        })
          .populate(
            "recruiter",
            "name email"
          )
          .lean();

      // -----------------------------------------------
      // BUILD RECOMMENDATIONS
      // -----------------------------------------------

      const recommendations =
        jobs
          .map(
            (job) =>
              buildJobRecommendation(
                job,
                studentSkills
              )
          )
          .sort(
            (
              a,
              b
            ) => {
              if (
                b.matchScore !==
                a.matchScore
              ) {
                return (
                  b.matchScore -
                  a.matchScore
                );
              }

              return (
                new Date(
                  b.job.createdAt
                ) -
                new Date(
                  a.job.createdAt
                )
              );
            }
          )
          .slice(
            0,
            limit
          );

      res.status(200).json({
        success: true,

        recommendationType:
          "jobs",

        studentSkills,

        count:
          recommendations.length,

        recommendations,
      });
    }
  );

// =====================================================
// GET OPPORTUNITY RECOMMENDATIONS
// STUDENT ONLY
// =====================================================

const getOpportunityRecommendations =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await getStudentProfile(
          req.user._id
        );

      const studentSkills =
        getStudentSkills(
          profile
        );

      const requestedLimit =
        Number(
          req.query.limit
        );

      const limit =
        Math.min(
          MAX_RECOMMENDATIONS,
          Math.max(
            1,
            Number.isFinite(
              requestedLimit
            )
              ? requestedLimit
              : DEFAULT_LIMIT
          )
        );

      // -----------------------------------------------
      // GET ACTIVE OPPORTUNITIES
      // -----------------------------------------------

      const opportunities =
        await Opportunity.find({
          status:
            "open",

          deadline: {
            $gte:
              new Date(),
          },
        })
          .populate(
            "recruiter",
            "name email"
          )
          .lean();

      // -----------------------------------------------
      // BUILD RECOMMENDATIONS
      // -----------------------------------------------

      const recommendations =
        opportunities
          .map(
            (
              opportunity
            ) =>
              buildOpportunityRecommendation(
                opportunity,
                studentSkills
              )
          )
          .sort(
            (
              a,
              b
            ) => {
              if (
                b.matchScore !==
                a.matchScore
              ) {
                return (
                  b.matchScore -
                  a.matchScore
                );
              }

              return (
                new Date(
                  b.opportunity.createdAt
                ) -
                new Date(
                  a.opportunity.createdAt
                )
              );
            }
          )
          .slice(
            0,
            limit
          );

      res.status(200).json({
        success: true,

        recommendationType:
          "opportunities",

        studentSkills,

        count:
          recommendations.length,

        recommendations,
      });
    }
  );

// =====================================================
// GET ALL RECOMMENDATIONS
// STUDENT ONLY
// =====================================================

const getAllRecommendations =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const profile =
        await getStudentProfile(
          req.user._id
        );

      const studentSkills =
        getStudentSkills(
          profile
        );

      const requestedLimit =
        Number(
          req.query.limit
        );

      const limit =
        Math.min(
          MAX_RECOMMENDATIONS,
          Math.max(
            1,
            Number.isFinite(
              requestedLimit
            )
              ? requestedLimit
              : DEFAULT_LIMIT
          )
        );

      // -----------------------------------------------
      // FETCH DATA IN PARALLEL
      // -----------------------------------------------

      const [
        jobs,
        opportunities,
      ] =
        await Promise.all([
          Job.find({
            status:
              "active",
          })
            .populate(
              "recruiter",
              "name email"
            )
            .lean(),

          Opportunity.find({
            status:
              "open",

            deadline: {
              $gte:
                new Date(),
            },
          })
            .populate(
              "recruiter",
              "name email"
            )
            .lean(),
        ]);

      // -----------------------------------------------
      // BUILD JOB RECOMMENDATIONS
      // -----------------------------------------------

      const jobRecommendations =
        jobs
          .map(
            (job) =>
              buildJobRecommendation(
                job,
                studentSkills
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              b.matchScore -
              a.matchScore
          )
          .slice(
            0,
            limit
          );

      // -----------------------------------------------
      // BUILD OPPORTUNITY RECOMMENDATIONS
      // -----------------------------------------------

      const opportunityRecommendations =
        opportunities
          .map(
            (
              opportunity
            ) =>
              buildOpportunityRecommendation(
                opportunity,
                studentSkills
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              b.matchScore -
              a.matchScore
          )
          .slice(
            0,
            limit
          );

      res.status(200).json({
        success: true,

        studentSkills,

        jobs: {
          count:
            jobRecommendations.length,

          recommendations:
            jobRecommendations,
        },

        opportunities: {
          count:
            opportunityRecommendations.length,

          recommendations:
            opportunityRecommendations,
        },
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getJobRecommendations,

  getOpportunityRecommendations,

  getAllRecommendations,
};