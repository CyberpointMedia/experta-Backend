const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const { Transaction } = require("../models/payment.model");
const Availability = require("../models/availability.model");
const Pricing = require("../models/pricing.model");
const mongoose = require("mongoose");

exports.getUserById = function (userId) {
  return new Promise((resolve, reject) => {
    User.findById(userId)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.createBooking = function (
  clientId,
  expertId,
  startTime,
  endTime,
  type,
  price,
  duration
) {
  return new Promise((resolve, reject) => {
    const newBooking = new Booking({
      expert: expertId,
      client: clientId,
      startTime,
      endTime,
      type,
      price,
      duration,
      status: "pending",
    });
    newBooking
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
exports.checkExpertAvailability = function (expertId, startTime, endTime) {
  return new Promise((resolve, reject) => {
    User.findById(expertId)
      .populate("availability")
      .then((user) => {
        if (!user || !user.availability) {
          resolve(false);
          return;
        }

        const requestedDay = new Date(startTime).getDay();
        const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

        const isAvailable = user.availability.some((slot) => {
          return (
            slot.weeklyRepeat.includes(dayNames[requestedDay]) &&
            slot.startTime <= startTime &&
            slot.endTime >= endTime
          );
        });

        resolve(isAvailable);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getExpertPrice = async function (expertId, type) {
  const expert = await User.findById(expertId).populate("pricing");
  if (!expert || !expert.pricing) {
    throw new Error("Expert or pricing not found");
  }

  switch (type) {
    case "audio":
      return expert.pricing.audioCallPrice;
    case "video":
      return expert.pricing.videoCallPrice;
    case "message":
      return expert.pricing.messagePrice;
    default:
      throw new Error("Invalid booking type");
  }
};
exports.updateUserWallet = function (
  userId,
  amount,
  transactionType,
  relatedBooking = null
) {
  return new Promise((resolve, reject) => {
    User.findById(userId)
      .then(async (user) => {
        if (!user) {
          reject(new Error("User not found"));
          return;
        }
        user.wallet.balance += amount;
        const transaction = new Transaction({
          user: userId,
          type: transactionType,
          amount: Math.abs(amount),
          status: "completed",
          paymentMethod: transactionType === "deposit" ? "razorpay" : "wallet",
          relatedBooking,
        });
        user.wallet.transactions.push(transaction._id);
        await user.save();
        await transaction.save();
        resolve(user);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getBookingsAsClient = function (userId) {
  return new Promise((resolve, reject) => {
    Booking.find({ client: userId })
      .populate({
        path: "expert",
        select: "_id online isVerified",
        populate: [
          {
            path: "basicInfo",
            select: "rating profilePic displayName",
          },
          {
            path: "industryOccupation",
            populate: [
              { path: "industry", select: "name" },
              { path: "occupation", select: "name" },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .then((bookings) => {
        const processedBookings = bookings.map((booking) => {
          const expert = booking.expert;
          return {
            _id: booking._id,
            expert: {
              id: expert._id,
              online: expert.online || false,
              isVerified: expert.isVerified || false,
              rating: expert.basicInfo?.rating || "",
              profilePic: expert.basicInfo?.profilePic || "",
              displayName: expert.basicInfo?.displayName || "",
              industry: expert.industryOccupation?.industry?.name || "",
              occupation: expert.industryOccupation?.occupation?.name || "",
            },
            startTime: booking.startTime,
            endTime: booking.endTime,
            duration: booking.duration,
            type: booking.type,
            status: booking.status,
            price: booking.price,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          };
        });
        resolve(processedBookings);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getBookingsAsExpert = function (userId) {
  return new Promise((resolve, reject) => {
    Booking.find({ expert: userId })
      .populate({
        path: "client",
        select: "_id online isVerified",
        populate: [
          {
            path: "basicInfo",
            select: "rating profilePic displayName",
          },
          {
            path: "industryOccupation",
            populate: [
              { path: "industry", select: "name" },
              { path: "occupation", select: "name" },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .then((bookings) => {
        const processedBookings = bookings.map((booking) => {
          const client = booking.client;
          return {
            _id: booking._id,
            client: {
              id: client._id,
              online: client.online || false,
              isVerified: client.isVerified || false,
              rating: client.basicInfo?.rating || "",
              profilePic: client.basicInfo?.profilePic || "",
              displayName: client.basicInfo?.displayName || "",
              industry: client.industryOccupation?.industry?.name || "",
              occupation: client.industryOccupation?.occupation?.name || "",
            },
            startTime: booking.startTime,
            endTime: booking.endTime,
            duration: booking.duration,
            type: booking.type,
            status: booking.status,
            price: booking.price,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          };
        });
        resolve(processedBookings);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
exports.getBookingById = function (bookingId) {
  return new Promise((resolve, reject) => {
    Booking.findById(bookingId)
      .populate("client", "basicInfo")
      .populate("expert", "basicInfo")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.updateBookingStatus = function (bookingId, status) {
  return new Promise((resolve, reject) => {
    Booking.findByIdAndUpdate(bookingId, { status }, { new: true })
      .populate("client", "basicInfo")
      .populate("expert", "basicInfo")
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getTransactionsByUserId = function (userId) {
  return new Promise((resolve, reject) => {
    Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.createTransaction = function (transactionData) {
  return new Promise((resolve, reject) => {
    const transaction = new Transaction(transactionData);
    transaction
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
