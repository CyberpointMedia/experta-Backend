const mongoose = require("mongoose");

const coinTransactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["booking_payment", "refund"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    description: String,
    isDeleted: {
      type: Boolean,
      default: false,  
    }
  },
  {
    timestamps: true,
  }
);

const paymentTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay"],
      required: true,
    },
    razorpayDetails: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    bankAccount: {
      accountNumber: String,
      ifsc: String,
      accountName: String
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

const CoinTransaction = mongoose.model("CoinTransaction", coinTransactionSchema);
const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);

module.exports = { CoinTransaction, PaymentTransaction };