const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  privacyPolicy: {
    content: { type: String, required: true },
    lastUpdated: { type: Date, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  termsAndConditions: {
    content: { type: String, required: true },
    lastUpdated: { type: Date, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  cookiePolicy: {
    content: { type: String, required: true },
    lastUpdated: { type: Date, required: true },
    version: { type: Number, required: true, default: 1 },
  },
});

const Policy = mongoose.model("policySchema", policySchema);

module.exports = Policy;
