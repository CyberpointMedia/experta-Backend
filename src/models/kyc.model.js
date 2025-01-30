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
  isDeleted: {
    type: Boolean,
    default: false,
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
  isDeleted: {
    type: Boolean,
    default: false,
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const panVerificationSchema = new mongoose.Schema({
  panNumber: {
    type: String,
    default: null,
  },
  verificationStatus: {
    type: Boolean,
    default: null,
  },
  panDetails: {
    type: Object,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});


const upiDetailsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const gstDetailsSchema = new mongoose.Schema({
  gstNumber: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
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
    panVerification: {
      type: panVerificationSchema,
      default: () => ({}),
    },
    upiDetails: {
      type: upiDetailsSchema, 
      default: () => ({}),
    },
    gstDetails: {
      type: gstDetailsSchema,
      default: () => ({}),
    },
    documents: [
      {
        documentType: {
          type: String, // Example: "Aadhar", "PAN", "Passport"
          required: true,
        },
        verified: {
          type: Boolean,
          default: false, // False by default, until verification is done
        },
        reason: {
          type: String, // Stores the reason why verification passed or failed
          default: null,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
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
  const panVerified = this.panVerification?.verificationStatus || false;
  const upiVerified = this.upiDetails?.upiId ? true : false;  // Consider UPI verified if UPI ID exists
  const hasGst = this.gstDetails?.gstNumber ? true : false;
  const documentsVerified = this.documents.every(doc => doc.verified);
  return {
    isComplete: bankVerified && livenessVerified && faceMatchVerified && panVerified && documentsVerified,   
    steps: {
      bankVerification: bankVerified,
      faceLiveness: livenessVerified,
      faceMatch: faceMatchVerified,
      panVerification: panVerified,
      upiVerification: upiVerified,
      gstAdded: hasGst,
      documentsVerified: documentsVerified,
    },
    paymentMethods: {
      bank: bankVerified,
      upi: upiVerified
    }
  };
});

module.exports = mongoose.model("KYC", kycSchema);

