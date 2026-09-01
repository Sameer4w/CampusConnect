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
// PAGINATION HELPER
// =====================================================

const getPagination =
  (query) => {
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

          // ===========================================
          // USERS
          // ===========================================

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

          // ===========================================
          // JOBS
          // ===========================================

          Job.countDocuments(),

          Job.countDocuments({
            status:
              "active",
          }),

          // ===========================================
          // OPPORTUNITIES
          // ===========================================

          Opportunity.countDocuments({
            isDeleted:
              false,
          }),

          Opportunity.countDocuments({
            status:
              "open",

            isDeleted:
              false,
          }),

          // ===========================================
          // OPPORTUNITY APPLICATIONS
          // ===========================================

          Application.countDocuments(),

          // ===========================================
          // JOB APPLICATIONS
          // ===========================================

          JobApplication.countDocuments(),

          // ===========================================
          // EVENTS
          // ===========================================

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

      // ===============================================
      // FILTER BY ROLE
      // ===============================================

      if (
        typeof req.query.role ===
        "string"
      ) {
        const role =
          req.query.role
            .trim()
            .toLowerCase();

        if (
          User.ROLES &&
          User.ROLES.includes(
            role
          )
        ) {
          filter.role =
            role;
        }
      }

      // ===============================================
      // FILTER BY ACTIVE STATUS
      // ===============================================

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

      // ===============================================
      // SEARCH
      // ===============================================

      if (
        typeof req.query.search ===
          "string" &&
        req.query.search.trim()
      ) {

        const search =
          req.query.search
            .trim();

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
        req.body ||
        {};

      // ===============================================
      // VALIDATION
      // ===============================================

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

      // ===============================================
      // PREVENT SELF DEACTIVATION
      // ===============================================

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
        req.body ||
        {};

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
        !User.ROLES ||
        !User.ROLES.includes(
          normalizedRole
        )
      ) {

        res.status(400);

        throw new Error(
          `Role must be one of: ${
            User.ROLES
              ? User.ROLES.join(
                  ", "
                )
              : "student, recruiter, admin"
          }`
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

      // ===============================================
      // PREVENT SELF ROLE CHANGE
      // ===============================================

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

      // ===============================================
      // STATUS FILTER
      // ===============================================

      if (
        typeof req.query.status ===
          "string" &&
        req.query.status.trim()
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

      // Delete related job applications

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

      const filter = {
        isDeleted:
          false,
      };

      // ===============================================
      // STATUS FILTER
      // ===============================================

      if (
        typeof req.query.status ===
          "string" &&
        req.query.status.trim()
      ) {

        filter.status =
          req.query.status
            .trim()
            .toLowerCase();
      }

      // ===============================================
      // SEARCH
      // ===============================================

      if (
        typeof req.query.search ===
          "string" &&
        req.query.search.trim()
      ) {

        const search =
          req.query.search
            .trim();

        filter.$or = [
          {
            title: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            organization: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            location: {
              $regex:
                search,

              $options:
                "i",
            },
          },
        ];
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
        !opportunity ||
        opportunity.isDeleted
      ) {

        res.status(404);

        throw new Error(
          "Opportunity not found."
        );
      }

      // ===============================================
      // SOFT DELETE
      // ===============================================

      opportunity.isDeleted =
        true;

      opportunity.deletedAt =
        new Date();

      await opportunity.save();

      res.status(200).json({
        success:
          true,

        message:
          "Opportunity deleted successfully.",
      });
    }
  );

// =====================================================
// GET ALL EVENTS
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

      // ===============================================
      // STATUS FILTER
      // ===============================================

      if (
        typeof req.query.status ===
          "string" &&
        req.query.status.trim()
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

  // Dashboard
  getAdminDashboard,

  // Users
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,

  // Jobs
  getAllJobs,
  deleteJob,

  // Opportunities
  getAllOpportunities,
  deleteOpportunity,

  // Events
  getAllEvents,
  deleteEvent,
};