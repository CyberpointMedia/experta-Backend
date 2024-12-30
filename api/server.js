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
const { checkRedisConnection, disconnectRedis } = require("./bootstrap/redis");
const { sleep } = require("./utils/time");

/**
 * Shutdown the server and close resources.
 * @param {Server} server - Express server instance.
 */
const shutdown = async (server) => {
  return new Promise((resolve, reject) => {
    server.close(async (err) => {
      if (err) {
        console.error("Error closing server:", err);
        return reject(err);
      }
      try {
        await sleep(2000);
        console.log("Cleanup complete. Server closed.");
        resolve();
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
        reject(cleanupError);
      }
    });
  });
};

/**
 * Gracefully shutdown the server and close resources.
 * @param {Server} server - Express server instance.
 * @param {string} reason - Reason for shutdown.
 */
const gracefulShutdown = async (server, reason) => {
  logger.info(`Graceful server shutdown initiated: ${reason}`);
  try {
    // Close the server
    await shutdown(server);

    // Disconnect from MongoDB
    await disconnectDatabase();

    // Disconnect Redis
    await disconnectRedis(); // Cleanly close the Redis connection

    logger.info("Shutdown graceful");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error.message);
    process.exit(1); // Ensure process exits after cleanup
  }
};

/**
 * Start Server with required services
 */
const startExpressServer = async () => {
  let server;
  try {
    // Connect to Redis
    await checkRedisConnection();

    // Connect to MongoDB
    await connectDatabase(MONGODB_URI, MONGODB_NAME);

    // Create HTTPS server
    server = http.createServer(app).listen(APP_PORT, () => {
      logger.info(`Server connected successfully on port ${APP_PORT}`);
    });

    // Handle express server errors
    server.on("error", (error, server) => {
      logger.error("Server encountered an error:" + error.message);
      process.exit(1);
    });

    // Handle termination signals for graceful shutdown
    process.on("SIGINT", () => gracefulShutdown(server, "SIGINT received"));
    process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM received"));
    // Handle nodemon's restart signal (SIGUSR2)
    process.on("SIGUSR2", async (server) => {
      console.log("Nodemon restart detected...");
      try {
        await shutdown(server);
        process.kill(process.pid, "SIGUSR2"); // Send the signal back to nodemon
      } catch (error) {
        console.error("Error during nodemon restart:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("Server startup failed:", error.message);
    process.exit(1); // Exit the process if startup fails
  }
};

// Start Express Server
logger.info("Starting server");
startExpressServer();
