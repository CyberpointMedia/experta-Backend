/**
 * Module: Config
 * Info: Api related config options
 **/

// Import Module dependencies.
const { cleanEnv, str, port, num } = require("envalid");

// Handle required env file
const apiConfig = cleanEnv(process.env, {
  //App related config
  APP_NAME: str({ default: "experta" }),
  APP_PORT: port(),
  API_PREFIX: str({ default: "api/v1" }),
  NODE_ENV: str({
    choices: ["local", "staging", "development", "production", "test"],
  }),

  // NoSQL DB Configs
  MONGODB_URI: str(),
  MONGODB_NAME: str(),

  // REDIS InMemory DB
  REDIS_URI: str(),

  // JWT configs
  JWT_TOKEN_SECRET: str(),
  JWT_TOKEN_EXPIRE: num({ default: 9000 }), // 15 min by default

  //  Twilio credentials
  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE_NUMBER: str(),
});

module.exports = apiConfig;
