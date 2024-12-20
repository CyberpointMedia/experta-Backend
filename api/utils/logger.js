/**
 * Module: Logger
 * Info: Use for logging
 **/

// Import Module dependencies.
const pino = require("pino");
const { join } = require("path");
const moment = require("moment");

// Define the log directory path
const logFileDir = join(__dirname, "../logs");

/**
 * Custom timestamp function for more readable datetime in logs file
 */
const customTimestamp = () => {
  return `,"time":"${moment().format("Do, MMM YYYY, h:mm:ss A")}"`; // Format the timestamp as ISO string
};

/**
 *  Create two stream for logging in current system
 *  - Log all type of log levels for debugging and response on Console screen
 *  - Log all errors of non operational on Log file rotated on daily basis
 */
const logger = pino({
  level: process.env.LOG_LEVEL || "info", // Set log level from environment variable or default to 'info'

  transport: {
    targets: [
      {
        target: "pino-pretty", // Pretty print for console
        level: "info", // Log info, warn, and error level messages to console
        options: {
          colorize: true, // Colorize the output
          translateTime: "SYS:standard",
          // Use system time in standard format
        },
      },
      {
        target: "pino-roll", // File logging for error level messages
        level: "error", // Log only error level messages to file
        options: {
          file: join(logFileDir, "api.log"),
          frequency: "daily",
          dateFormat: "dd-MMM-yyyy",
          size: `10485760b`,
          mkdir: true, // Create the directory if it doesn't exist
        },
      },
    ],
  },
  timestamp: customTimestamp, // Use the custom timestamp function
});

module.exports = logger;
