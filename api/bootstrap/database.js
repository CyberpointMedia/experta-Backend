/**
 * Module: Database
 * Info: Provide database service related handler
 **/

// Import Module dependencies.
const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connect to MongoDB using Mongoose.
 * @param {string} MONGODB_URI - MongoDB connection URI.
 * @param {string} MONGODB_NAME - MongoDB Database Name.
 * @returns {Promise<void>} Resolves when connected.
 */
const connectDatabase = async (MONGODB_URI, MONGODB_NAME) => {
  try {
    const config = {
      dbName: MONGODB_NAME,
    };
    await mongoose.connect(MONGODB_URI, config);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB Error :" + error.message);
    throw new Error("MongoDB connection failed");
  }
};

/**
 * Disconnect to MongoDB using Mongoose.
 * @returns {Promise<void>} Resolves when disconnected.
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    logger.error("MongoDB Error :" + error.message);
    throw new Error("MongoDB connection failed");
  }
};

module.exports = { connectDatabase, disconnectDatabase };
