/**
 * Module: Server
 * Info: Main entrypoint for start services
 **/

// Import Module dependencies.

// Import express at the top with loaded env vars
const app = require("./bootstrap/express");

// Load dependencies and utils
const { APP_PORT, MONGODB_URI, MONGODB_NAME } = require("./config/api.config");
const logger = require("./utils/logger");
const http = require("http");
const { connectDatabase, disconnectDatabase } = require("./bootstrap/database");

/**
 * Gracefully shutdown the server and close resources.
 * @param {Server} server - Express server instance.
 * @param {string} reason - Reason for shutdown.
 */
const gracefulShutdown = async (server, reason) => {
  logger.info(`Graceful server shutdown initiated: ${reason}`);
  try {
    // Close the server
    if (server) {
      logger.info("Closing server...");
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info("Server shutdown successfully");
    }

    // Disconnect from MongoDB
    logger.info("Disconnecting from MongoDB...");
    await disconnectDatabase();
    logger.info("MongoDB connection closed successfully");
  } catch (error) {
    logger.error("Error during shutdown:", error.message);
  } finally {
    logger.info("🚦 Exiting process...");
    process.exit(0); // Ensure process exits after cleanup
  }
};

/**
 * Start Server with required services
 */
const startExpressServer = async () => {
  let server;
  try {
    // Connect to Redis
    // Connect to MongoDB
    await connectDatabase(MONGODB_URI, MONGODB_NAME);

    // Create HTTPS server
    server = http.createServer(app).listen(APP_PORT, () => {
      logger.info(`Server connected successfully on port ${APP_PORT}`);
    });

    // Handle express server errors
    server.on("error", (error) => {
      logger.error("Server encountered an error:" + error.message);
      gracefulShutdown(server, "Server error");
    });

    // Handle termination signals for graceful shutdown
    process.on("SIGINT", () => gracefulShutdown(server, "SIGINT received"));
    process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM received"));
  } catch (error) {
    logger.error("Server startup failed:", error.message);
    process.exit(1); // Exit the process if startup fails
  }
};

// Start Express Server
logger.info("Starting server");
startExpressServer();
