require('dotenv').config();
const zendesk = require('node-zendesk');
const client = zendesk.createClient({
  username: process.env.ZENDESK_USERNAME,
  token: process.env.ZENDESK_API_TOKEN,
  remoteUri: process.env.ZENDESK_REMOTE_URI
});
module.exports = client;