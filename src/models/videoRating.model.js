const mongoose = require("mongoose");

const videoRatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one rating per user per booking
videoRatingSchema.index({ user: 1, booking: 1 }, { unique: true });

const VideoRating = mongoose.model("VideoRating", videoRatingSchema);