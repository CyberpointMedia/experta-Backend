/**
 * Module: basicInfo Model
 * Info: Define baiscInfo schema
 **/

// Import Module dependencies.
const mongoose = require("mongoose");
const { Schema } = mongoose;
const genderEnum = require("../enums/gender.enum");

const basicInfoSchema = Schema(
  {
    firstName: {
      type: String,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must be less than 50 characters"],
      trim: true,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      maxlength: [50, "Last name must be less than 50 characters"],
      trim: true,
    },
    displayName: {
      type: String,
      minlength: [2, "Display name must be at least 2 characters"],
      maxlength: [50, "Display name must be less than 50 characters"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: object.values(genderEnum),
      required:[true,"Gender is required"]
    },
    bio: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    //they are the social Media links of the user
    socialLinks: [{
      name: {
        type: String,
      },
      link: {
        type: String,
      }
    }],
    location: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    about: {
      type: String,
    },
    rating: { type: Number, default: 2 },
    //this is the qr code of the user profile
    qrCode: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BasicInfo", basicInfoSchema);