const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const messageSchema = new Schema(
  {
    sender: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, trim: true },
    file_id: { type: String, trim: true },
    file_name: { type: String, trim: true },
    content: { type: String, trim: true },
    chat: {
      type: ObjectId,
      ref: "Chat",
      required: true,
    },
    readBy: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
