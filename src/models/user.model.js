const mongoose = require("mongoose");
const Wallet = require('./wallet.model')

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    resendCount: {
      type: Number,
      default: 0,
      // required: true,
    },
    otp: String,
    otpExpiry: Date,
    block: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    blockExpiry: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Exclude isDeleted from query results by default
    },
    basicInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BasicInfo",
    },
    education: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Education",
      },
    ],
    industryOccupation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustryOccupation",
    },
    workExperience: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkExperience",
      },
    ],
    intereset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Languages",
    },
    expertise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expertise",
    },
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pricing",
    },
    reviews: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    noOfBooking: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
