const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fcmToken: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: String,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
deviceSchema.index({ user: 1, fcmToken: 1 }, { unique: true });

module.exports = mongoose.model("Device", deviceSchema);