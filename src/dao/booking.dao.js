// dao/booking.dao.js
const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const { CoinTransaction, PaymentTransaction } = require("../models/transaction.model");
const mongoose = require("mongoose");


exports.getUserById = function (userId) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userId, isDeleted: false })
    .populate('pricing')
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
  return await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { $inc: { "wallet.balance": amount } },
    { new: true, session }
  );
};

exports.getBookingsAsClient = function (userId, filters = {}) {
  return new Promise((resolve, reject) => {
    const query = { client: userId, isDeleted: false };
    
    if (filters.startDate || filters.endDate) {
      query.startTime = {};
    
      const currentDate = new Date(); // Get the current date and time
    
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        query.startTime.$gte = startDate < currentDate ? currentDate : startDate; 
      } else {
        query.startTime.$gte = currentDate; 
      }
    
      if (filters.endDate) {
        query.startTime.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    console.log(`query`,new Date())
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
              { 
                path: "level1Service",
                select: "name"
              },
              { 
                path: "level2Service",
                select: "name"
              },
              { 
                path: "level3Services",
                select: "name"
              }
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .then((bookings) => {
        // Transform the bookings to include formatted service information
        const transformedBookings = bookings.map(booking => {
          const bookingObj = booking.toObject();
          if (bookingObj.expert && bookingObj.expert.industryOccupation) {
            const services = {
              level1: bookingObj.expert.industryOccupation.level1Service?.name || null,
              level2: bookingObj.expert.industryOccupation.level2Service?.name || null,
              level3: bookingObj.expert.industryOccupation.level3Services?.map(service => service.name) || []
            };
            
            bookingObj.expert.services = services;
            delete bookingObj.expert.industryOccupation;  // Remove the original industryOccupation object
          }
          return bookingObj;
        });
        
        resolve(transformedBookings);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getBookingsAsExpert = function (userId, filters = {}) {
  return new Promise((resolve, reject) => {
    const query = { expert: userId , isDeleted:false};
    
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
    const query = {isDeleted: false};
    
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
  return await Booking.findOneAndUpdate(
    { _id:bookingId, isDeleted:false },
    { status },
    { new: true, session }
  );
}

exports.getTransactionById = function (transactionId) {
  return new Promise((resolve, reject) => {
    PaymentTransaction.findOne({
      _id: transactionId,
      isDeleted: false
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

exports.getBookingById = function (bookingId) {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      _id: bookingId,
      isDeleted: false
    })
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
              { path: "level1Service", select: "name" },
              { path: "level2Service", select: "name" },
              { path: "level3Services", select: "name" }
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
        // Transform data to include formatted service information
        if (data && data.expert && data.expert.industryOccupation) {
          data.expert.services = {
            level1: data.expert.industryOccupation.level1Service?.name || "",
            level2: data.expert.industryOccupation.level2Service?.name || "",
            level3: data.expert.industryOccupation.level3Services?.map(service => service.name) || []
          };
          delete data.expert.industryOccupation;
        }
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
/// 
exports.getWithdrawalTransactionById = async function (withdrawalId) {
  return await PaymentTransaction.findOne({
    _id: withdrawalId,
    isDeleted: false,
  })
};

exports.createWithdrawalTransaction = async function (transactionData, session) {
  const transaction = new PaymentTransaction(transactionData);
  return await transaction.save({ session });
};

exports.updateWithdrawalTransaction = async function (transactionId, updateData, session) {
  return await PaymentTransaction.findOneAndUpdate(
    { _id: transactionId, isDeleted: false },
    updateData,
    { new: true, session }
  );
};

exports.getUserWithdrawalTransaction = async function (userId, withdrawalId) {
  return await PaymentTransaction.findOne({
    _id: withdrawalId,
    isDeleted: false,
    user: userId,
    type: "withdrawal"
  });
};

exports.getPendingWithdrawals = async function (userId) {
  return await PaymentTransaction.find({
    user: userId,
    isDeleted: false,
    type: "withdrawal",
    status: "pending"
  }).sort({ createdAt: -1 });
};

exports.getUserWithBalance = async function (userId, session) {
  return await User.findOne({
    _id: userId,
    isDeleted: false
  })
  .select('wallet basicInfo').populate('basicInfo')
  .session(session);
};

exports.updateUserWalletForWithdrawal = async function (userId, amount, session) {
  return await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { $inc: { "wallet.balance": -amount } },
    { new: true, session }
  );
};

exports.refundFailedWithdrawal = async function (userId, amount, session) {
  return await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { $inc: { "wallet.balance": amount } },
    { new: true, session }
  );
};

// Add this to track withdrawal limits
exports.getWithdrawalsSummary = async function (userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: "withdrawal",
        status: { $in: ["completed", "pending"] },
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await PaymentTransaction.aggregate(pipeline);
  return results[0] || { totalAmount: 0, count: 0 };
};

exports.createUPITransaction = async function(transactionData, session) {
  const transaction = new PaymentTransaction({
    ...transactionData,
    paymentMethod: 'upi'
  });
  return await transaction.save({ session });
};

exports.updateUPITransaction = async function(transactionId, upiDetails, session) {
  return await PaymentTransaction.findOneAndUpdate(
    { _id: transactionId, isDeleted: false },
    { $set: { upiDetails, status: 'completed' } },
    { new: true, session }
  );
};

exports.createPayoutTransaction = async function (transactionData, session) {
  const transaction = new PaymentTransaction(transactionData);
  return await transaction.save({ session });
};

exports.updateTransactionStatus = async function (
  transactionId,
  updateData,
  session
) {
  return await PaymentTransaction.findOneAndUpdate(
    { _id: transactionId, isDeleted: false },
    { $set: updateData },
    { new: true, session }
  );
};

// new


exports.createWithdrawalTransaction = async function (transactionData, session) {
  const transaction = new PaymentTransaction(transactionData);
  return await transaction.save({ session });
};

exports.getUserWalletBalance = async function (userId) {
  const user = await User.findOne({_id:userId,isDeleted:false}).select("wallet.balance");
  if (!user) throw new Error("User not found");
  return user.wallet.balance;
};

exports.updateUserWalletBalance = async function (userId, amount, session) {
  return await User.findOneAndUpdate(
    {_id:userId,isDeleted:false},
    { $inc: { "wallet.balance": amount } },
    { new: true, session }
  );
};




