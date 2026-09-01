const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const config = require("./config");

// =====================================================
// ROUTES
// =====================================================

const healthRoutes =
  require("./routes/healthRoutes");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

const opportunityRoutes =
  require("./routes/opportunityRoutes");

const applicationRoutes =
  require("./routes/applicationRoutes");

const jobRoutes =
  require("./routes/jobRoutes");

const jobApplicationRoutes =
  require("./routes/jobApplicationRoutes");

const recommendationRoutes =
  require("./routes/recommendationRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const eventRoutes =
  require("./routes/eventRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

// =====================================================
// ERROR MIDDLEWARE
// =====================================================

const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  config.clientOrigin,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// REQUEST PARSING
// =====================================================

app.use(
  cookieParser()
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// ROOT API INFORMATION
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "CampusConnect API is running",

      version:
        "1.0.0",

      environment:
        config.nodeEnv,

      timestamp:
        new Date().toISOString(),

      api: {
        health:
          "/api/health",

        auth:
          "/api/auth",

        users:
          "/api/users",

        opportunities:
          "/api/opportunities",

        applications:
          "/api/applications",

        jobs:
          "/api/jobs",

        jobApplications:
          "/api/job-applications",

        recommendations:
          "/api/recommendations",

        notifications:
          "/api/notifications",

        events:
          "/api/events",

        admin:
          "/api/admin",
      },
    });
  }
);

// =====================================================
// API ROUTES
// =====================================================

// Health Check
app.use(
  "/api/health",
  healthRoutes
);

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Users and Student Profile
app.use(
  "/api/users",
  userRoutes
);

// Opportunities
app.use(
  "/api/opportunities",
  opportunityRoutes
);

// Opportunity Applications
app.use(
  "/api/applications",
  applicationRoutes
);

// Jobs
app.use(
  "/api/jobs",
  jobRoutes
);

// Job Applications
app.use(
  "/api/job-applications",
  jobApplicationRoutes
);

// Recommendations
app.use(
  "/api/recommendations",
  recommendationRoutes
);

// Notifications
app.use(
  "/api/notifications",
  notificationRoutes
);

// Events
app.use(
  "/api/events",
  eventRoutes
);

// Admin
app.use(
  "/api/admin",
  adminRoutes
);

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 Handler
app.use(
  notFound
);

// Global Error Handler
app.use(
  errorHandler
);

// =====================================================
// EXPORT
// =====================================================

module.exports = app;