const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const config = require("./config");

// Routes
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");

// Error middleware
const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// =====================================================
// REQUEST PARSING
// =====================================================

app.use(cookieParser());

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

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CampusConnect API",

    endpoints: {
      health: "GET /api/health",

      auth: {
        register:
          "POST /api/auth/register",

        login:
          "POST /api/auth/login",

        me:
          "GET /api/auth/me",

        logout:
          "POST /api/auth/logout",
      },

      studentProfile: {
        get:
          "GET /api/users/profile (student only)",

        update:
          "PUT /api/users/profile (student only)",
      },

      authorizationTests: {
        student:
          "GET /api/test/student (student/admin)",

        recruiter:
          "GET /api/test/recruiter (recruiter/admin)",

        admin:
          "GET /api/test/admin (admin only)",
      },
    },
  });
});

// =====================================================
// API ROUTES
// =====================================================

// Phase 1 — Health check
app.use(
  "/api/health",
  healthRoutes
);

// Phase 2 — Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Phase 3 — Student profile
app.use(
  "/api/users",
  userRoutes
);

// Temporary role authorization tests
app.use(
  "/api/test",
  testRoutes
);

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;