const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

module.exports = {
  frontend_url: process.env.FRONTEND_URL,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  twilio: {
    accountSid:process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken :process.env.TWILIO_AUTH_TOKEN
  },
};
