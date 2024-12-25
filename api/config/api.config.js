/**
 * Module: Config
 * Info: Api related config options
 **/

// Import Module dependencies.
const { cleanEnv, str, port, num } = require("envalid");
const apiConfig = cleanEnv(process.env, {
  APP_PORT: port(),
  API_PREFIX: str({ default: "api/v1" }),
  NODE_ENV: str({
    choices: ["local", "staging", "development", "production", "test"],
  }),
  MONGODB_URI: str(),
  MONGODB_NAME: str(),
  REDIS_URI: str(),
  JWT_TOKEN_SECRET: str(),
  JWT_TOKEN_EXPIRE: num({ default: 36000 }), // 1 hr by default
});
module.exports = apiConfig;
