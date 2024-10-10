// models/ticket.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
