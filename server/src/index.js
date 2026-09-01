const dns = require("dns");

// =====================================================
// DNS CONFIGURATION
// =====================================================
//
// Use Google DNS for MongoDB Atlas SRV lookups.
//
// This helps avoid ECONNREFUSED errors caused by some
// system DNS resolvers.
//

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

// =====================================================
// IMPORTS
// =====================================================

const app = require("./app");

const config = require("./config");

const connectDB = require("./config/database");

// =====================================================
// PORT
// =====================================================

const PORT = config.port;

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    // -----------------------------------------------
    // CONNECT TO MONGODB
    // -----------------------------------------------

    await connectDB();

    // -----------------------------------------------
    // START EXPRESS SERVER
    // -----------------------------------------------

    app.listen(PORT, () => {
      console.log("\n========================================");
      console.log("  CampusConnect Server");
      console.log("========================================");
      console.log(`  Mode: ${config.nodeEnv}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  URL:  http://localhost:${PORT}`);
      console.log("========================================\n");
    });
  } catch (error) {
    console.error(
      `\n❌ Failed to start server: ${error.message}`
    );

    process.exit(1);
  }
};

// =====================================================
// START APPLICATION
// =====================================================

startServer();