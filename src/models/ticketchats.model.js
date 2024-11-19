// models/Message.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',  // The ticket this message is related to
      required: false,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // The user who sent the message
      required: false,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // The user who will receive the message
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    attachments: [
      {
        type: String,  // URL to attachment
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,  // Automatically manage createdAt and updatedAt
  }
);

module.exports = mongoose.model('ticketChat', messageSchema);
