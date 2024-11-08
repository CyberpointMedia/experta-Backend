// dao/booking.dao.js
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const { CoinTransaction, PaymentTransaction } = require("../models/transaction.model");
const mongoose = require("mongoose");

exports.getUserById = function (userId) {
  return new Promise((resolve, reject) => {
    User.findById(userId).populate('pricing')
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

exports.createCoinTransaction = async function (transactionData, session) {
  const transaction = new CoinTransaction(transactionData);
  return await transaction.save({ session });
};

exports.createPaymentTransaction = async function (transactionData, session) {
  const transaction = new PaymentTransaction(transactionData);
  return await transaction.save({ session });
};

exports.updateUserWallet = async function (userId, amount, session) {
  return await User.findByIdAndUpdate(
    userId,
    { $inc: { "wallet.balance": amount } },
    { new: true, session }
  );
};

exports.getBookingsAsClient = function (userId, filters = {}) {
  return new Promise((resolve, reject) => {
    const query = { client: userId };
    
    if (filters.startDate || filters.endDate) {
      query.startTime = {};
      if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
      if (filters.endDate) query.startTime.$lte = new Date(filters.endDate);
    }
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    Booking.find(query)
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
        resolve(bookings);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getBookingsAsExpert = function (userId, filters = {}) {
  return new Promise((resolve, reject) => {
    const query = { expert: userId };
    
    if (filters.startDate || filters.endDate) {
      query.startTime = {};
      if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
      if (filters.endDate) query.startTime.$lte = new Date(filters.endDate);
    }
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    Booking.find(query)
      .populate({
        path: "client",
        select: "_id online isVerified",
        populate: [
          {
            path: "basicInfo",
            select: "rating profilePic displayName",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .then((bookings) => {
        resolve(bookings);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getFilteredTransactions = async function (userId, filters = {}) {
  try {
    const query = {};
    
    // Add date filters if provided
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Add status filter if provided
    if (filters.status) {
      query.status = filters.status;
    }

    let transactions = [];

    // Get payment transactions if requested
    if (!filters.type || filters.type === 'payment') {
      const paymentQuery = { ...query, user: userId };
      if (filters.paymentType) {
        paymentQuery.type = filters.paymentType;
      }
      const paymentTransactions = await PaymentTransaction.find(paymentQuery)
        .populate('user', 'basicInfo')
        .sort({ createdAt: -1 });
      transactions = transactions.concat(paymentTransactions);
    }

    // Get coin transactions if requested
    if (!filters.type || filters.type === 'coin') {
      const coinQuery = {
        ...query,
        $or: [{ sender: userId }, { receiver: userId }]
      };
      if (filters.coinType) {
        coinQuery.type = filters.coinType;
      }
      const coinTransactions = await CoinTransaction.find(coinQuery)
        .populate('sender receiver', 'basicInfo')
        .populate('relatedBooking')
        .sort({ createdAt: -1 });
      transactions = transactions.concat(coinTransactions);
    }

    // Sort combined transactions by date
    return transactions.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    throw error;
  }
};

exports.updateBookingStatus = async function (bookingId, status, session) {
  return await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true, session }
  );
}

exports.getTransactionById = function (transactionId) {
  return new Promise((resolve, reject) => {
    PaymentTransaction.findById(transactionId)
      .then((data) => {
        resolve(data);
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
      .populate({
        path: "expert",
        select: "_id online isVerified pricing",
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
      .populate({
        path: "client",
        select: "_id online isVerified",
        populate: {
          path: "basicInfo",
          select: "rating profilePic displayName",
        },
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};