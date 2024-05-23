const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
    },
    duration: {
      type: Number, // assuming duration is in minutes
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    coinsDeducted: {
      type: Number,
      required: true,
    },
    coinsRemaining: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "waiting", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Method to accept the booking
bookingSchema.methods.acceptBooking = function () {
  this.bookingStatus = "accepted";
  return this.save();
};

// Method to reject the booking
bookingSchema.methods.rejectBooking = function () {
  this.bookingStatus = "rejected";
  return this.save();
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
