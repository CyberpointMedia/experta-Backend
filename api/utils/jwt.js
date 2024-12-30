/**
 * Module: JWT Class
 * Info:  JSON WEB TOKEN utility for manage token based authentication
 **/

// Import Module dependencies.
const jwt = require("jsonwebtoken");

const { APP_NAME, JWT_TOKEN_SECRET, JWT_TOKEN_EXPIRE } = require("../config/api.config");
const JWT_OPTIONS = {
  algorithms: "HS256", // Ensure the correct algorithm is used
  expiresIn: JWT_TOKEN_EXPIRE,
  issuer: APP_NAME,
};

class JWT {
  /**
   * @method signAccessToken
   * Generate new JWT Access Token for authentication and send signed data along it
   * @param {json} payload - data to be signed inside jwt access token
   */
  static async signAccessToken(payload) {
    return jwt.sign(payload, JWT_TOKEN_SECRET, JWT_OPTIONS);
  }

  /**
   * @method verifyAccessToken
   * Verify  JWT Access Token whie authenticate user
   * @param {string} accessToken - data to be signed inside jwt access token
   */
  static async verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, JWT_TOKEN_SECRET, JWT_OPTIONS);
  }
}

module.exports = JWT;
