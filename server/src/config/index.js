const path = require("path");
const dotenv = require("dotenv");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

// Load environment variables from server/.env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// =====================================================
// CONFIGURATION
// =====================================================

const config = {
  // ===============================================
  // SERVER
  // ===============================================

  port: Number(process.env.PORT) || 5000,

  nodeEnv:
    process.env.NODE_ENV || "development",

  // ===============================================
  // CLIENT
  // ===============================================

  clientOrigin:
    process.env.CLIENT_ORIGIN ||
    "http://localhost:5173",

  // ===============================================
  // DATABASE
  // ===============================================

  mongodbUri:
    process.env.MONGODB_URI,

  // ===============================================
  // JWT
  // ===============================================

  jwt: {
    secret:
      process.env.JWT_SECRET,

    expiresIn:
      process.env.JWT_EXPIRES_IN ||
      "7d",
  },
};

// =====================================================
// EXPORT
// =====================================================

module.exports = config;