const mongoose = require("mongoose");

const bankVerificationSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    default: null,
  },
  ifsc: {
    type: String,
    default: null,
  },
  verificationStatus: {
    type: Boolean,
    default: null,
  },
  bankDetails: {
    type: Object,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

const faceLivenessSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    default: null,
  },
  confidence: {
    type: Number,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

const faceMatchSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    default: null,
  },
  confidence: {
    type: Number,
    default: null,
  },
  selfieUrl: {
    type: String,
    default: null,
  },
  idCardUrl: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bankVerification: {
      type: bankVerificationSchema,
      default: () => ({}), 
    },
    faceLiveness: {
      type: faceLivenessSchema,
      default: () => ({}), 
    },
    faceMatch: {
      type: faceMatchSchema,
      default: () => ({}), 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

kycSchema.virtual("kycStatus").get(function () {
  const bankVerified = this.bankVerification?.verificationStatus || false;
  const livenessVerified = this.faceLiveness?.status || false;
  const faceMatchVerified = this.faceMatch?.status || false;

  return {
    isComplete: bankVerified && livenessVerified && faceMatchVerified,
    steps: {
      bankVerification: bankVerified,
      faceLiveness: livenessVerified,
      faceMatch: faceMatchVerified,
    },
  };
});

module.exports = mongoose.model("KYC", kycSchema);
