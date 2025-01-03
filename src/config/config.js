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
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  },
  surepass: {
    surepassUrl:"https://kyc-api.surepass.io/api/v1",
    surepassToken: process.env.SUREPASS_TOKEN,
  },
  aws:{
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME
  }
};
