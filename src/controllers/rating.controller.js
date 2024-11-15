const mongoose = require("mongoose");
const VideoRating = require("../models/videoRating.model");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const BasicInfo = require("../models/basicInfo.model");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");

exports.submitRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, rating, review } = req.body;
    const userId = req.body.user._id;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.json(createResponse.invalid("Valid booking ID is required"));
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.json(createResponse.invalid("Rating must be between 1 and 5"));
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      client: userId
    }).populate('expert');

    if (!booking) {
      return res.json(
        createResponse.error({
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
          errorMessage: "Booking not found"
        })
      );
    }

    if (booking.status !== "completed") {
      return res.json(
        createResponse.error({
          errorCode: errorMessageConstants.NOT_ALLOWED,
          errorMessage: "Cannot rate an incomplete booking"
        })
      );
    }

    const existingRating = await VideoRating.findOne({
      booking: bookingId,
      user: userId
    });

    if (existingRating) {
      return res.json(
        createResponse.error({
          errorCode: errorMessageConstants.CONFLICTS,
          errorMessage: "Rating already submitted for this booking"
        })
      );
    }

    const videoRating = new VideoRating({
      user: userId,
      expert: booking.expert._id,
      booking: bookingId,
      rating,
      review: review || ""
    });

    await videoRating.save({ session });

    // Update expert's average rating
    const allRatings = await VideoRating.find({ 
      expert: booking.expert._id 
    });

    const totalRating = allRatings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = Number((totalRating / allRatings.length).toFixed(1));

    await BasicInfo.findOneAndUpdate(
      { user: booking.expert._id },
      { $set: { rating: averageRating } },
      { session }
    );

    await session.commitTransaction();

    const populatedRating = await VideoRating.findById(videoRating._id)
      .populate({
        path: "user",
        select: "basicInfo",
        populate: {
          path: "basicInfo",
          select: "firstName lastName displayName profilePic"
        }
      });

    res.json(createResponse.success(populatedRating));

  } catch (error) {
    await session.abortTransaction();
    console.error("Error submitting rating:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message || "Error submitting rating"
      })
    );
  } finally {
    session.endSession();
  }
};

exports.getExpertRatings = async (req, res) => {
  try {
    const { expertId } = req.params;

    if (!expertId || !mongoose.Types.ObjectId.isValid(expertId)) {
      return res.json(createResponse.invalid("Valid expert ID is required"));
    }

    const expert = await User.findById(expertId);
    if (!expert) {
      return res.json(
        createResponse.error({
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
          errorMessage: "Expert not found"
        })
      );
    }

    const ratings = await VideoRating.find({ expert: expertId })
      .populate({
        path: "user",
        select: "basicInfo",
        populate: {
          path: "basicInfo",
          select: "firstName lastName displayName profilePic"
        }
      })
      .populate({
        path: "booking",
        select: "type startTime"
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedRatings = ratings.map(rating => ({
      id: rating._id,
      rating: rating.rating,
      review: rating.review,
      bookingType: rating.booking?.type,
      bookingDate: rating.booking?.startTime,
      userName: rating.user?.basicInfo?.displayName || 
                `${rating.user?.basicInfo?.firstName || ''} ${rating.user?.basicInfo?.lastName || ''}`.trim(),
      userProfilePic: rating.user?.basicInfo?.profilePic,
      createdAt: rating.createdAt
    }));

    res.json(createResponse.success(formattedRatings));

  } catch (error) {
    console.error("Error fetching expert ratings:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message || "Error fetching ratings"
      })
    );
  }
};