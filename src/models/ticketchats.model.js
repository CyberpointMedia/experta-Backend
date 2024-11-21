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
        type: String,
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,  // You can use this flag for soft deletion
    }
  },
  {
    timestamps: true,  // Automatically manage createdAt and updatedAt
  }
);

module.exports = mongoose.model('ticketChat', messageSchema);
