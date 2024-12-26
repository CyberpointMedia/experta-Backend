/**
 * Module: SecretOps Utility
 * Info: Utility module for generate app secret codes and hash
 **/

// Import Module dependencies.
const crypto = require("crypto");

/**
 * @method generate
 * Generate new secret string for encryption
 * @param {number} length - secret string length
 */
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * @method generateOtp
 * Generate 6 digit otp for verificaation
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 999999);
};

module.exports = {
  generateSecret,
  generateOtp,
};
