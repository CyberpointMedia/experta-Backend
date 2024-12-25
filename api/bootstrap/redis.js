/**
 * Module: Redis
 * Info: Utility module for generate app secret codes and hash
 **/

// Import Module dependencies.
const Redis = require("ioredis");
const { REDIS_URI } = require("../config/api.config");
const logger = require("../utils/logger");

// Create Redis client
const redisClient = new Redis(REDIS_URI);
let reported = false;
redisClient.on("error", (error) => {
  if (error.code === "ECONNREFUSED" && !reported) {
    reported = true;
    logger.info("Redis configuration error");
    logger.info("Try to reconnect redis server");
  }
});
/**
 * @method checkRedisConnection
 * To check redis connected or not
 **/
const checkRedisConnection = async () => {
  try {
    await redisClient.ping(); // Send PING command
    logger.info("Redis is running.");
  } catch (error) {
    logger.error(`Redis connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * @method disconnectRedis
 * To close redis connection
 **/
const disconnectRedis = async () => {
  try {
    await redisClient.quit(); //Close redis connection
    logger.info("Redis is running.");
  } catch (error) {
    logger.error("Redis Error :" + error.message);
    throw new Error("Redis graceful shutdown failed");
  }
};
module.exports = { redisClient, checkRedisConnection, disconnectRedis };
