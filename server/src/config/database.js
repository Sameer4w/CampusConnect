const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    if (!config.mongodbUri) {
      throw new Error(
        'MONGODB_URI is not set. Please set it in your .env file. ' +
        'Example: MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect'
      );
    }

    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database:     ${conn.connection.name}\n`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('\n========================================');
    console.error('  ❌ MongoDB Connection Failed');
    console.error('========================================');
    console.error(`  Error: ${error.message}`);
    console.error('========================================');
    console.error('  Troubleshooting:');
    console.error('  1. Is MongoDB running locally?');
    console.error('     - Run: mongod (or start MongoDB Compass)');
    console.error('  2. Is MONGODB_URI correct in .env?');
    console.error('     - Local:  mongodb://127.0.0.1:27017/campusconnect');
    console.error('     - Atlas:  mongodb+srv://user:pass@cluster/...');
    console.error('========================================\n');
    process.exit(1);
  }
};

module.exports = connectDB;
