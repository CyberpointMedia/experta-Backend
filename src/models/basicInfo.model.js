const mongoose = require("mongoose");

const basicInfoSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    displayName: {
      type: String,
      // required: true,
    },
    bio: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    facebook: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BasicInfo", basicInfoSchema);
