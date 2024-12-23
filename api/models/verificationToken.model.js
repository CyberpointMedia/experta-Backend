const mongoose = require("mongoose");
const { Schema } = mongoose;
const VerificationType = require("../enums/verificationType.enum");

const otpSchema = Schema({
  // The OTP code
  code: {
    type: String,
    required: true,
  },
  // The type of verification (phone or email)
  type: {
    type: String,
    enum: object.values(VerificationType),
    required: true,
  },
  // The expiry time of the OTP
  expiryAt: {
    type: Date,
    required: true,
  },
  // The status of the OTP (used or not)
  isUsed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Otp", otpSchema);