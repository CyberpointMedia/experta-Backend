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
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
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
  },
  zendeskClient :{
    username: process.env.ZENDESK_USERNAME,
    token: process.env.ZENDESK_API_TOKEN,
    remoteUri: process.env.ZENDESK_REMOTE_URI,
    zendeskEmail:process.env.ZENDESK_EMAIL
  },
  mail:{
    user: process.env.MAIL_EMAIL,
    pass: process.env.MAIL_PASS
  },
  test:{
    testPhoneNo: process.env.TEST_PHONE_NO,
    testOtp: process.env.TEST_OTP
  },
  social:{
    google:{
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleCallback:process.env.GOOGLE_CLIENT_AUTH_CALLBACK
    },
  }
};
