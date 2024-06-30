// models/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String }, // image, video
    isRead: { type: Boolean, default: false } // New field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
