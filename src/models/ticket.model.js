// models/ticket.model.js
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "open" },
  attachments: [{ type:String }], // Store file metadata
  zendeskResponse: { type: Object }, // Store Zendesk API response
}, { timestamps: true});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;