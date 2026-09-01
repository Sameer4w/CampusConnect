const asyncHandler =
  require("express-async-handler");

const User =
  require("../models/User");

const Job =
  require("../models/Job");

const Opportunity =
  require("../models/Opportunity");

const Application =
  require("../models/Application");

const JobApplication =
  require("../models/JobApplication");

const Event =
  require("../models/Event");

// =====================================================
// CONSTANTS
// =====================================================

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

// =====================================================
// HELPERS
// =====================================================

const getPagination = (
  query
) => {
  const requestedPage =
    Number(query.page);

  const requestedLimit =
    Number(query.limit);

  const page =
    Number.isFinite(
      requestedPage
    ) &&
    requestedPage > 0
      ? Math.floor(
          requestedPage
        )
      : 1;

  const limit =
    Number.isFinite(
      requestedLimit
    ) &&
    requestedLimit > 0
      ? Math.min(
          Math.floor(
            requestedLimit
          ),
          MAX_LIMIT
        )
      : DEFAULT_LIMIT;

  const skip =
    (page - 1) *
    limit;

  return {
    page,
    limit,
    skip,
  };
};

// =====================================================
// ADMIN DASHBOARD
// ADMIN ONLY
// =====================================================

const getAdminDashboard =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const [
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalAdmins,
        activeUsers,
        inactiveUsers,

        totalJobs,
        activeJobs,

        totalOpportunities,
        openOpportunities,

        totalApplications,
        totalJobApplications,

        totalEvents,
        publishedEvents,
      ] =
        await Promise.all([
          // Users
          User.countDocuments(),

          User.countDocuments({
            role:
              "student",
          }),

          User.countDocuments({
            role:
              "recruiter",
          }),

          User.countDocuments({
            role:
              "admin",
          }),

          User.countDocuments({
            isActive:
              true,
          }),

          User.countDocuments({
            isActive:
              false,
          }),

          // Jobs
          Job.countDocuments(),

          Job.countDocuments({
            status:
              "active",
          }),

          // Opportunities
          Opportunity.countDocuments(),

          Opportunity.countDocuments({
            status:
              "open",
          }),

          // Opportunity applications
          Application.countDocuments(),

          // Job applications
          JobApplication.countDocuments(),

          // Events
          Event.countDocuments(),

          Event.countDocuments({
            status:
              "published",
          }),
        ]);

      res.status(200).json({
        success:
          true,

        dashboard: {
          users: {
            total:
              totalUsers,

            students:
              totalStudents,

            recruiters:
              totalRecruiters,

            admins:
              totalAdmins,

            active:
              activeUsers,

            inactive:
              inactiveUsers,
          },

          jobs: {
            total:
              totalJobs,

            active:
              activeJobs,
          },

          opportunities: {
            total:
              totalOpportunities,

            open:
              openOpportunities,
          },

          applications: {
            opportunities:
              totalApplications,

            jobs:
              totalJobApplications,

            total:
              totalApplications +
              totalJobApplications,
          },

          events: {
            total:
              totalEvents,

            published:
              publishedEvents,
          },
        },
      });
    }
  );

// =====================================================
// GET ALL USERS
// ADMIN ONLY
// =====================================================

const getAllUsers =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        page,
        limit,
        skip,
      } =
        getPagination(
          req.query
        );

      const filter = {};

      // -----------------------------------------------
      // FILTER BY ROLE
      // -----------------------------------------------

      if (
        typeof req.query.role ===
        "string"
      ) {
        const role =
          req.query.role
            .trim()
            .toLowerCase();

        if (
          User.ROLES.includes(
            role
          )
        ) {
          filter.role =
            role;
        }
      }

      // -----------------------------------------------
      // FILTER BY ACTIVE STATUS
      // -----------------------------------------------

      if (
        req.query.isActive ===
        "true"
      ) {
        filter.isActive =
          true;
      }

      if (
        req.query.isActive ===
        "false"
      ) {
        filter.isActive =
          false;
      }

      // -----------------------------------------------
      // SEARCH
      // -----------------------------------------------

      if (
        typeof req.query.search ===
          "string" &&
        req.query.search.trim()
      ) {
        const search =
          req.query.search.trim();

        filter.$or = [
          {
            name: {
              $regex:
                search,
              $options:
                "i",
            },
          },
          {
            email: {
              $regex:
                search,
              $options:
                "i",
            },
          },
        ];
      }

      const [
        users,
        total,
      ] =
        await Promise.all([
          User.find(
            filter
          )
            .sort({
              createdAt:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              limit
            ),

          User.countDocuments(
            filter
          ),
        ]);

      res.status(200).json({
        success:
          true,

        pagination: {
          page,

          limit,

          total,

          pages:
            Math.ceil(
              total /
              limit
            ),
        },

        users,
      });
    }
  );

// =====================================================
// GET SINGLE USER
// ADMIN ONLY
// =====================================================

const getUserById =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const user =
        await User.findById(
          req.params.id
        );

      if (
        !user
      ) {
        res.status(404);

        throw new Error(
          "User not found."
        );
      }

      res.status(200).json({
        success:
          true,

        user,
      });
    }
  );

// =====================================================
// UPDATE USER STATUS
// ADMIN ONLY
// =====================================================

const updateUserStatus =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        isActive,
      } =
        req.body || {};

      // -----------------------------------------------
      // VALIDATE
      // -----------------------------------------------

      if (
        typeof isActive !==
        "boolean"
      ) {
        res.status(400);

        throw new Error(
          "isActive must be a boolean."
        );
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (
        !user
      ) {
        res.status(404);

        throw new Error(
          "User not found."
        );
      }

      // -----------------------------------------------
      // PREVENT ADMIN FROM DEACTIVATING SELF
      // -----------------------------------------------

      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        res.status(400);

        throw new Error(
          "You cannot deactivate your own account."
        );
      }

      user.isActive =
        isActive;

      await user.save();

      res.status(200).json({
        success:
          true,

        message:
          isActive
            ? "User account activated successfully."
            : "User account deactivated successfully.",

        user,
      });
    }
  );

// =====================================================
// UPDATE USER ROLE
// ADMIN ONLY
// =====================================================

const updateUserRole =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        role,
      } =
        req.body || {};

      if (
        typeof role !==
        "string"
      ) {
        res.status(400);

        throw new Error(
          "Role is required."
        );
      }

      const normalizedRole =
        role
          .trim()
          .toLowerCase();

      if (
        !User.ROLES.includes(
          normalizedRole
        )
      ) {
        res.status(400);

        throw new Error(
          `Role must be one of: ${User.ROLES.join(
            ", "
          )}`
        );
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (
        !user
      ) {
        res.status(404);

        throw new Error(
          "User not found."
        );
      }

      // -----------------------------------------------
      // PREVENT ADMIN FROM CHANGING OWN ROLE
      // -----------------------------------------------

      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        res.status(400);

        throw new Error(
          "You cannot change your own role."
        );
      }

      user.role =
        normalizedRole;

      await user.save();

      res.status(200).json({
        success:
          true,

        message:
          "User role updated successfully.",

        user,
      });
    }
  );

// =====================================================
// GET ALL JOBS
// ADMIN ONLY
// =====================================================

const getAllJobs =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        page,
        limit,
        skip,
      } =
        getPagination(
          req.query
        );

      const filter = {};

      if (
        typeof req.query.status ===
        "string"
      ) {
        filter.status =
          req.query.status
            .trim()
            .toLowerCase();
      }

      const [
        jobs,
        total,
      ] =
        await Promise.all([
          Job.find(
            filter
          )
            .populate(
              "recruiter",
              "name email role"
            )
            .sort({
              createdAt:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              limit
            ),

          Job.countDocuments(
            filter
          ),
        ]);

      res.status(200).json({
        success:
          true,

        pagination: {
          page,
          limit,
          total,

          pages:
            Math.ceil(
              total /
              limit
            ),
        },

        jobs,
      });
    }
  );

// =====================================================
// DELETE JOB
// ADMIN ONLY
// =====================================================

const deleteJob =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const job =
        await Job.findById(
          req.params.id
        );

      if (
        !job
      ) {
        res.status(404);

        throw new Error(
          "Job not found."
        );
      }

      // Delete related applications

      await JobApplication.deleteMany({
        job:
          job._id,
      });

      await job.deleteOne();

      res.status(200).json({
        success:
          true,

        message:
          "Job and related applications deleted successfully.",
      });
    }
  );

// =====================================================
// GET ALL OPPORTUNITIES
// ADMIN ONLY
// =====================================================

const getAllOpportunities =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        page,
        limit,
        skip,
      } =
        getPagination(
          req.query
        );

      const filter = {};

      if (
        typeof req.query.status ===
        "string"
      ) {
        filter.status =
          req.query.status
            .trim()
            .toLowerCase();
      }

      const [
        opportunities,
        total,
      ] =
        await Promise.all([
          Opportunity.find(
            filter
          )
            .populate(
              "recruiter",
              "name email role"
            )
            .sort({
              createdAt:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              limit
            ),

          Opportunity.countDocuments(
            filter
          ),
        ]);

      res.status(200).json({
        success:
          true,

        pagination: {
          page,
          limit,
          total,

          pages:
            Math.ceil(
              total /
              limit
            ),
        },

        opportunities,
      });
    }
  );

// =====================================================
// DELETE OPPORTUNITY
// ADMIN ONLY
// =====================================================

const deleteOpportunity =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const opportunity =
        await Opportunity.findById(
          req.params.id
        );

      if (
        !opportunity
      ) {
        res.status(404);

        throw new Error(
          "Opportunity not found."
        );
      }

      // Delete related applications

      await Application.deleteMany({
        opportunity:
          opportunity._id,
      });

      await opportunity.deleteOne();

      res.status(200).json({
        success:
          true,

        message:
          "Opportunity and related applications deleted successfully.",
      });
    }
  );

// =====================================================
// GET ALL EVENTS
// ADMIN ONLY
// =====================================================

const getAllEvents =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        page,
        limit,
        skip,
      } =
        getPagination(
          req.query
        );

      const filter = {};

      if (
        typeof req.query.status ===
        "string"
      ) {
        filter.status =
          req.query.status
            .trim()
            .toLowerCase();
      }

      const [
        events,
        total,
      ] =
        await Promise.all([
          Event.find(
            filter
          )
            .populate(
              "organizer",
              "name email role"
            )
            .sort({
              startDate:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              limit
            ),

          Event.countDocuments(
            filter
          ),
        ]);

      res.status(200).json({
        success:
          true,

        pagination: {
          page,
          limit,
          total,

          pages:
            Math.ceil(
              total /
              limit
            ),
        },

        events,
      });
    }
  );

// =====================================================
// DELETE EVENT
// ADMIN ONLY
// =====================================================

const deleteEvent =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      await event.deleteOne();

      res.status(200).json({
        success:
          true,

        message:
          "Event deleted successfully.",
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAdminDashboard,

  getAllUsers,

  getUserById,

  updateUserStatus,

  updateUserRole,

  getAllJobs,

  deleteJob,

  getAllOpportunities,

  deleteOpportunity,

  getAllEvents,

  deleteEvent,
};