const dns = require('dns');

// Use Google DNS for MongoDB SRV lookups.
// This fixes ECONNREFUSED from the current system DNS resolver.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');

const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`  CampusConnect Server`);
      console.log(`========================================`);
      console.log(`  Mode: ${config.nodeEnv}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  URL:  http://localhost:${PORT}`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error(`\n❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();