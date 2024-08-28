const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const chatSchema = new Schema(
  {
    chatName: { type: String, trim: true, required: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: ObjectId, ref: "User" }],
    groupAdmins: [{ type: ObjectId, ref: "User" }],
    lastMessage: { type: ObjectId, ref: "Message" },
    chatDisplayPic: { type: String, trim: true },
    unreadCounts: [
      {
        user: { type: ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
