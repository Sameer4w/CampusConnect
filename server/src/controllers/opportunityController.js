const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");

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

const OPPORTUNITY_STATUSES = [
  "open",
  "closed",
];

// =====================================================
// NORMALIZE STRING ARRAYS
// =====================================================

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  const uniqueSkills = new Map();

  skills.forEach((skill) => {
    if (
      typeof skill === "string" &&
      skill.trim()
    ) {
      const trimmedSkill =
        skill.trim();

      uniqueSkills.set(
        trimmedSkill.toLowerCase(),
        trimmedSkill
      );
    }
  });

  return Array.from(
    uniqueSkills.values()
  );
};

// =====================================================
// CHECK DEADLINE
// =====================================================

const isDeadlinePassed = (
  deadline
) => {
  if (!deadline) {
    return false;
  }

  return (
    new Date(deadline) <
    new Date()
  );
};

// =====================================================
// VALIDATE REQUIRED OPPORTUNITY DATA
// =====================================================

const validateOpportunityData = (
  data
) => {
  const errors = [];

  if (
    !data.title ||
    typeof data.title !== "string" ||
    !data.title.trim()
  ) {
    errors.push(
      "Opportunity title is required"
    );
  }

  if (
    !data.company ||
    typeof data.company !== "string" ||
    !data.company.trim()
  ) {
    errors.push(
      "Company name is required"
    );
  }

  if (
    !OPPORTUNITY_TYPES.includes(
      data.type
    )
  ) {
    errors.push(
      "Please provide a valid opportunity type"
    );
  }

  if (
    !data.location ||
    typeof data.location !== "string" ||
    !data.location.trim()
  ) {
    errors.push(
      "Location is required"
    );
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    !data.description.trim()
  ) {
    errors.push(
      "Description is required"
    );
  }

  if (!data.deadline) {
    errors.push(
      "Application deadline is required"
    );
  } else {
    const deadlineDate =
      new Date(data.deadline);

    if (
      Number.isNaN(
        deadlineDate.getTime()
      )
    ) {
      errors.push(
        "Please provide a valid deadline"
      );
    }
  }

  if (
    data.workMode &&
    !WORK_MODES.includes(
      data.workMode
    )
  ) {
    errors.push(
      "Please provide a valid work mode"
    );
  }

  return errors;
};

// =====================================================
// CREATE OPPORTUNITY
// Recruiter only
// =====================================================

const createOpportunity = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      company,
      type,
      category,
      location,
      workMode,
      experienceLevel,
      description,
      requiredSkills,
      preferredSkills,
      salary,
      openings,
      deadline,
      tags,
    } = req.body;

    // ===============================================
    // BASIC VALIDATION
    // ===============================================

    const errors =
      validateOpportunityData({
        title,
        company,
        type,
        location,
        workMode,
        description,
        deadline,
      });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    // ===============================================
    // CATEGORY VALIDATION
    // ===============================================

    if (
      category &&
      !OPPORTUNITY_CATEGORIES.includes(
        category
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid opportunity category",
      });
    }

    // ===============================================
    // EXPERIENCE LEVEL VALIDATION
    // ===============================================

    if (
      experienceLevel &&
      !EXPERIENCE_LEVELS.includes(
        experienceLevel
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid experience level",
      });
    }

    // ===============================================
    // OPENINGS VALIDATION
    // ===============================================

    const openingsNumber =
      openings !== undefined
        ? Number(openings)
        : 1;

    if (
      !Number.isInteger(
        openingsNumber
      ) ||
      openingsNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Openings must be at least 1",
      });
    }

    // ===============================================
    // DEADLINE VALIDATION
    // ===============================================

    const deadlineDate =
      new Date(deadline);

    if (
      deadlineDate.getTime() <=
      new Date().setHours(
        0,
        0,
        0,
        0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Deadline must be in the future",
      });
    }

    // ===============================================
    // CREATE OPPORTUNITY
    // ===============================================

    const opportunity =
      await Opportunity.create({
        title:
          title.trim(),

        company:
          company.trim(),

        type,

        category:
          category || "Other",

        location:
          location.trim(),

        workMode:
          workMode || "On-site",

        experienceLevel:
          experienceLevel || "Fresher",

        description:
          description.trim(),

        requiredSkills:
          normalizeSkills(
            requiredSkills
          ),

        preferredSkills:
          normalizeSkills(
            preferredSkills
          ),

        salary:
          typeof salary === "string"
            ? salary.trim()
            : "",

        openings:
          openingsNumber,

        deadline:
          deadlineDate,

        recruiter:
          req.user._id,

        status:
          "open",

        tags:
          normalizeSkills(
            tags
          ),
      });

    res.status(201).json({
      success: true,

      message:
        "Opportunity created successfully",

      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ALL OPEN OPPORTUNITIES
//
// Supports:
// ?search=developer
// ?type=Internship
// ?workMode=Remote
// ?page=1
// ?limit=9
// =====================================================

const getOpportunities = async (
  req,
  res,
  next
) => {
  try {
    const {
      search = "",
      type = "",
      workMode = "",
      page = 1,
      limit = 9,
    } = req.query;

    const query = {
      status: "open",

      deadline: {
        $gte: new Date(),
      },
    };

    // ===============================================
    // SEARCH
    // ===============================================

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      query.$or = [
        {
          title: {
            $regex:
              search.trim(),

            $options:
              "i",
          },
        },

        {
          company: {
            $regex:
              search.trim(),

            $options:
              "i",
          },
        },

        {
          location: {
            $regex:
              search.trim(),

            $options:
              "i",
          },
        },

        {
          requiredSkills: {
            $regex:
              search.trim(),

            $options:
              "i",
          },
        },
      ];
    }

    // ===============================================
    // TYPE FILTER
    // ===============================================

    if (
      OPPORTUNITY_TYPES.includes(
        type
      )
    ) {
      query.type = type;
    }

    // ===============================================
    // WORK MODE FILTER
    // ===============================================

    if (
      WORK_MODES.includes(
        workMode
      )
    ) {
      query.workMode =
        workMode;
    }

    // ===============================================
    // PAGINATION
    // ===============================================

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 9,
          1
        ),
        50
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    // ===============================================
    // DATABASE QUERIES
    // ===============================================

    const [
      opportunities,
      total,
    ] = await Promise.all([
      Opportunity.find(query)
        .populate(
          "recruiter",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Opportunity.countDocuments(
        query
      ),
    ]);

    const totalPages =
      Math.ceil(
        total / limitNumber
      );

    res.status(200).json({
      success: true,

      count:
        opportunities.length,

      total,

      page:
        pageNumber,

      totalPages,

      hasNextPage:
        pageNumber <
        totalPages,

      hasPreviousPage:
        pageNumber > 1,

      opportunities,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE OPPORTUNITY
// =====================================================

const getOpportunityById = async (
  req,
  res,
  next
) => {
  try {
    const opportunity =
      await Opportunity.findById(
        req.params.id
      ).populate(
        "recruiter",
        "name email"
      );

    // ===============================================
    // NOT FOUND
    // ===============================================

    if (!opportunity) {
      return res.status(404).json({
        success: false,

        message:
          "Opportunity not found",
      });
    }

    const opportunityData =
      opportunity.toObject();

    // ===============================================
    // APPLICATION COUNT
    // ===============================================

    const applicationCount =
      await Application.countDocuments({
        opportunity:
          opportunity._id,
      });

    opportunityData.applicationCount =
      applicationCount;

    // ===============================================
    // DEADLINE STATUS
    // ===============================================

    opportunityData.deadlinePassed =
      isDeadlinePassed(
        opportunity.deadline
      );

    // ===============================================
    // LOGGED-IN STUDENT APPLICATION
    // ===============================================

    if (
      req.user &&
      req.user.role === "student"
    ) {
      const userApplication =
        await Application.findOne({
          opportunity:
            opportunity._id,

          student:
            req.user._id,
        }).select(
          "_id status createdAt"
        );

      opportunityData.userApplication =
        userApplication;
    }

    res.status(200).json({
      success: true,

      opportunity:
        opportunityData,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET MY OPPORTUNITIES
// Recruiter only
// =====================================================

const getMyOpportunities = async (
  req,
  res,
  next
) => {
  try {
    const opportunities =
      await Opportunity.find({
        recruiter:
          req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // ===============================================
    // ADD APPLICATION COUNTS
    // ===============================================

    const opportunitiesWithStats =
      await Promise.all(
        opportunities.map(
          async (
            opportunity
          ) => {
            const applicationCount =
              await Application.countDocuments(
                {
                  opportunity:
                    opportunity._id,
                }
              );

            return {
              ...opportunity,

              applicationCount,

              deadlinePassed:
                isDeadlinePassed(
                  opportunity.deadline
                ),
            };
          }
        )
      );

    res.status(200).json({
      success: true,

      count:
        opportunitiesWithStats.length,

      opportunities:
        opportunitiesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE OPPORTUNITY
// Only opportunity owner
// =====================================================

const updateOpportunity = async (
  req,
  res,
  next
) => {
  try {
    const opportunity =
      await Opportunity.findById(
        req.params.id
      );

    // ===============================================
    // NOT FOUND
    // ===============================================

    if (!opportunity) {
      return res.status(404).json({
        success: false,

        message:
          "Opportunity not found",
      });
    }

    // ===============================================
    // AUTHORIZE
    // ===============================================

    if (
      opportunity.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not authorized to update this opportunity",
      });
    }

    // ===============================================
    // TITLE
    // ===============================================

    if (
      req.body.title !==
      undefined
    ) {
      if (
        typeof req.body.title !==
          "string" ||
        !req.body.title.trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Opportunity title cannot be empty",
        });
      }

      opportunity.title =
        req.body.title.trim();
    }

    // ===============================================
    // COMPANY
    // ===============================================

    if (
      req.body.company !==
      undefined
    ) {
      if (
        typeof req.body.company !==
          "string" ||
        !req.body.company.trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Company name cannot be empty",
        });
      }

      opportunity.company =
        req.body.company.trim();
    }

    // ===============================================
    // TYPE
    // ===============================================

    if (
      req.body.type !==
      undefined
    ) {
      if (
        !OPPORTUNITY_TYPES.includes(
          req.body.type
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid opportunity type",
        });
      }

      opportunity.type =
        req.body.type;
    }

    // ===============================================
    // CATEGORY
    // ===============================================

    if (
      req.body.category !==
      undefined
    ) {
      if (
        !OPPORTUNITY_CATEGORIES.includes(
          req.body.category
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid opportunity category",
        });
      }

      opportunity.category =
        req.body.category;
    }

    // ===============================================
    // LOCATION
    // ===============================================

    if (
      req.body.location !==
      undefined
    ) {
      if (
        typeof req.body.location !==
          "string" ||
        !req.body.location.trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Location cannot be empty",
        });
      }

      opportunity.location =
        req.body.location.trim();
    }

    // ===============================================
    // WORK MODE
    // ===============================================

    if (
      req.body.workMode !==
      undefined
    ) {
      if (
        !WORK_MODES.includes(
          req.body.workMode
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid work mode",
        });
      }

      opportunity.workMode =
        req.body.workMode;
    }

    // ===============================================
    // EXPERIENCE LEVEL
    // ===============================================

    if (
      req.body.experienceLevel !==
      undefined
    ) {
      if (
        !EXPERIENCE_LEVELS.includes(
          req.body.experienceLevel
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid experience level",
        });
      }

      opportunity.experienceLevel =
        req.body.experienceLevel;
    }

    // ===============================================
    // DESCRIPTION
    // ===============================================

    if (
      req.body.description !==
      undefined
    ) {
      if (
        typeof req.body.description !==
          "string" ||
        !req.body.description.trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Description cannot be empty",
        });
      }

      opportunity.description =
        req.body.description.trim();
    }

    // ===============================================
    // REQUIRED SKILLS
    // ===============================================

    if (
      req.body.requiredSkills !==
      undefined
    ) {
      opportunity.requiredSkills =
        normalizeSkills(
          req.body.requiredSkills
        );
    }

    // ===============================================
    // PREFERRED SKILLS
    // ===============================================

    if (
      req.body.preferredSkills !==
      undefined
    ) {
      opportunity.preferredSkills =
        normalizeSkills(
          req.body.preferredSkills
        );
    }

    // ===============================================
    // SALARY
    // ===============================================

    if (
      req.body.salary !==
      undefined
    ) {
      opportunity.salary =
        typeof req.body.salary ===
        "string"
          ? req.body.salary.trim()
          : "";
    }

    // ===============================================
    // OPENINGS
    // ===============================================

    if (
      req.body.openings !==
      undefined
    ) {
      const openingsNumber =
        Number(
          req.body.openings
        );

      if (
        !Number.isInteger(
          openingsNumber
        ) ||
        openingsNumber < 1
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Openings must be at least 1",
        });
      }

      opportunity.openings =
        openingsNumber;
    }

    // ===============================================
    // DEADLINE
    // ===============================================

    if (
      req.body.deadline !==
      undefined
    ) {
      const deadlineDate =
        new Date(
          req.body.deadline
        );

      if (
        Number.isNaN(
          deadlineDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please provide a valid deadline",
        });
      }

      // Prevent expired deadline
      if (
        deadlineDate.getTime() <=
        new Date().setHours(
          0,
          0,
          0,
          0
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Deadline must be in the future",
        });
      }

      opportunity.deadline =
        deadlineDate;
    }

    // ===============================================
    // STATUS
    // ===============================================

    if (
      req.body.status !==
      undefined
    ) {
      if (
        !OPPORTUNITY_STATUSES.includes(
          req.body.status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid opportunity status",
        });
      }

      opportunity.status =
        req.body.status;
    }

    // ===============================================
    // TAGS
    // ===============================================

    if (
      req.body.tags !==
      undefined
    ) {
      opportunity.tags =
        normalizeSkills(
          req.body.tags
        );
    }

    // ===============================================
    // SAVE
    // ===============================================

    await opportunity.save();

    res.status(200).json({
      success: true,

      message:
        "Opportunity updated successfully",

      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DELETE OPPORTUNITY
// Only opportunity owner
// =====================================================

const deleteOpportunity = async (
  req,
  res,
  next
) => {
  try {
    const opportunity =
      await Opportunity.findById(
        req.params.id
      );

    // ===============================================
    // NOT FOUND
    // ===============================================

    if (!opportunity) {
      return res.status(404).json({
        success: false,

        message:
          "Opportunity not found",
      });
    }

    // ===============================================
    // AUTHORIZE
    // ===============================================

    if (
      opportunity.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not authorized to delete this opportunity",
      });
    }

    // ===============================================
    // DELETE RELATED APPLICATIONS
    // ===============================================

    await Application.deleteMany({
      opportunity:
        opportunity._id,
    });

    // ===============================================
    // DELETE OPPORTUNITY
    // ===============================================

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,

      message:
        "Opportunity and related applications deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET RECRUITER OPPORTUNITY STATISTICS
// =====================================================

const getMyOpportunityStats = async (
  req,
  res,
  next
) => {
  try {
    const recruiterId =
      req.user._id;

    // Get all recruiter opportunity IDs first
    const opportunities =
      await Opportunity.find({
        recruiter:
          recruiterId,
      })
        .select("_id")
        .lean();

    const opportunityIds =
      opportunities.map(
        (opportunity) =>
          opportunity._id
      );

    const [
      total,
      open,
      closed,
      applicationCount,
    ] = await Promise.all([
      Opportunity.countDocuments({
        recruiter:
          recruiterId,
      }),

      Opportunity.countDocuments({
        recruiter:
          recruiterId,

        status:
          "open",
      }),

      Opportunity.countDocuments({
        recruiter:
          recruiterId,

        status:
          "closed",
      }),

      Application.countDocuments({
        opportunity: {
          $in:
            opportunityIds,
        },
      }),
    ]);

    res.status(200).json({
      success: true,

      stats: {
        totalOpportunities:
          total,

        openOpportunities:
          open,

        closedOpportunities:
          closed,

        totalApplications:
          applicationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createOpportunity,

  getOpportunities,

  getOpportunityById,

  getMyOpportunities,

  updateOpportunity,

  deleteOpportunity,

  getMyOpportunityStats,
};