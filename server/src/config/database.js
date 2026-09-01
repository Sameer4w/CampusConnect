const mongoose = require("mongoose");
const config = require("./index");

// =====================================================
// CONNECT TO MONGODB
// =====================================================

const connectDB = async () => {
  try {
    // =================================================
    // CHECK MONGODB URI
    // =================================================

    if (!config.mongodbUri) {
      throw new Error(
        "MONGODB_URI is not configured. Please add it to your .env file."
      );
    }

    // =================================================
    // CONNECT
    // =================================================

    const connection = await mongoose.connect(
      config.mongodbUri,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    // =================================================
    // SUCCESS LOGS
    // =================================================

    console.log("\n========================================");
    console.log("  MongoDB Connected Successfully");
    console.log("========================================");
    console.log(
      `  Host: ${connection.connection.host}`
    );
    console.log(
      `  Database: ${connection.connection.name}`
    );
    console.log("========================================\n");

    return connection;
  } catch (error) {
    console.error("\n========================================");
    console.error("  MongoDB Connection Failed");
    console.error("========================================");
    console.error(
      `  Error: ${error.message}`
    );
    console.error("========================================\n");

    throw error;
  }
};

// =====================================================
// MONGOOSE CONNECTION EVENTS
// =====================================================

mongoose.connection.on(
  "error",
  (error) => {
    console.error(
      "MongoDB runtime error:",
      error.message
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    console.warn(
      "MongoDB disconnected"
    );
  }
);

mongoose.connection.on(
  "reconnected",
  () => {
    console.log(
      "MongoDB reconnected successfully"
    );
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = connectDB;