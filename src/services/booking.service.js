// services/booking.service.js
const bookingDao = require("../dao/booking.dao");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getWalletBalance = async function (userId) {
  try {
    const user = await bookingDao.getUserById(userId);
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found",
      });
    }
    return createResponse.success({ balance: user.wallet.balance });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getBookingsAsClient = async function (userId, filters) {
  try {
    const bookings = await bookingDao.getBookingsAsClient(userId, filters);
    return createResponse.success(bookings);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getBookingsAsExpert = async function (userId, filters) {
  try {
    const bookings = await bookingDao.getBookingsAsExpert(userId, filters);
    return createResponse.success(bookings);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.createRazorpayOrder = async function (userId, amount) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `${userId}_${Date.now()}`
    });

    const transaction = await bookingDao.createPaymentTransaction({
      user: userId,
      amount,
      type: "deposit",
      paymentMethod: "razorpay",
      razorpayDetails: {
        orderId: order.id
      }
    });

    return createResponse.success({ order, transactionId: transaction._id });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};


exports.updateBookingStatus = async function (bookingId, status, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await bookingDao.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.expert.toString() !== userId) {
      throw new Error("Not authorized to update this booking");
    }

    if (status === 'accepted') {
      booking.status = 'accepted';
      await booking.save({ session });

    } else if (status === 'rejected') {
      // Create refund transaction
      await bookingDao.createCoinTransaction({
        sender: booking.expert,
        receiver: booking.client,
        amount: booking.price,
        type: "refund",
        relatedBooking: booking._id,
        description: "Booking rejected - refund"
      }, session);

      // Update wallets
      await Promise.all([
        bookingDao.updateUserWallet(booking.expert, -booking.price, session),
        bookingDao.updateUserWallet(booking.client, booking.price, session)
      ]);

      booking.status = 'rejected';
      await booking.save({ session });
    }

    await session.commitTransaction();
    return createResponse.success(booking);

  } catch (error) {
    await session.abortTransaction();
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getTransactionHistory = async function (userId, filters) {
  try {
    const transactions = await bookingDao.getFilteredTransactions(userId, filters);
    return createResponse.success(transactions);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};


exports.initiateWithdrawal = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { amount, bankAccount } = req.body;

    if (!amount || !bankAccount) {
      return res.json(createResponse.invalid("Amount and bank account details are required"));
    }

    const result = await bookingService.initiateWithdrawal(userId, amount, bankAccount);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getWithdrawalStatus = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { withdrawalId } = req.params;

    const result = await bookingService.getWithdrawalStatus(userId, withdrawalId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.verifyPayment = async function (userId, paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId
    } = paymentData;

    // Get the transaction first
    const transaction = await bookingDao.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.user.toString() !== userId) {
      throw new Error("Unauthorized to verify this payment");
    }

    if (transaction.status !== 'pending') {
      throw new Error("Transaction is no longer pending");
    }

    // Verify payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      transaction.status = 'failed';
      await transaction.save({ session });
      throw new Error("Invalid payment signature");
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.razorpayDetails = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    };
    await transaction.save({ session });

    // Add amount to user's wallet
    await bookingDao.updateUserWallet(userId, transaction.amount, session);

    await session.commitTransaction();
    return createResponse.success({
      message: "Payment verified successfully",
      transaction
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};


exports.createBooking = async function (clientId, expertId, startTime, endTime, type) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get client and expert details
    const [client, expert] = await Promise.all([
      bookingDao.getUserById(clientId),
      bookingDao.getUserById(expertId)
    ]);

    if (!client || !expert) {
      throw new Error("User not found");
    }

    // 2. Validate expert's pricing
    if (!expert.pricing) {
      throw new Error("Expert has not set their pricing");
    }

    // 3. Get pricing based on booking type
    let price;
    if (type === 'audio') {
      price = expert.pricing.audioCallPrice;
    } else if (type === 'video') {
      price = expert.pricing.videoCallPrice;
    } else if (type === 'message') {
      price = expert.pricing.messagePrice;
    } else {
      throw new Error("Invalid booking type");
    }

    if (!price) {
      throw new Error(`Expert hasn't set pricing for ${type} bookings`);
    }

    // 4. Check client's wallet balance
    if (!client.wallet || client.wallet.balance < price) {
      throw new Error("Insufficient balance");
    }

    // 5. Validate booking time
    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(endTime);
    
    if (bookingStart >= bookingEnd) {
      throw new Error("Invalid booking time range");
    }

    const now = new Date();
    if (bookingStart <= now) {
      throw new Error("Booking cannot be in the past");
    }

    // 6. Calculate duration in minutes
    const duration = Math.round((bookingEnd - bookingStart) / (1000 * 60));

    // 7. Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      expert: expertId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: bookingEnd },
          endTime: { $gt: bookingStart }
        }
      ]
    });

    if (conflictingBooking) {
      throw new Error(errorMessageConstants.BOOKING_CONFLICT_MESSAGE);
    }

    // 8. Create booking
    const booking = await bookingDao.createBooking(
      clientId,
      expertId,
      startTime,
      endTime,
      type,
      price,
      duration
    );

    // 9. Create coin transaction for booking payment
    await bookingDao.createCoinTransaction({
      sender: clientId,
      receiver: expertId,
      amount: price,
      type: "booking_payment",
      relatedBooking: booking._id,
      description: `Payment for ${type} booking`
    }, session);

    // 10. Update wallets
    await Promise.all([
      bookingDao.updateUserWallet(clientId, -price, session),
      bookingDao.updateUserWallet(expertId, price, session)
    ]);

    // 11. Update expert's booking count
    await User.findByIdAndUpdate(expertId, { $inc: { noOfBooking: 1 } }, { session });

    await session.commitTransaction();
    return createResponse.success(booking);

  } catch (error) {
    await session.abortTransaction();
    console.error("Error:", error);
    return createResponse.error({
      errorCode: 
        error.message === errorMessageConstants.BOOKING_CONFLICT_MESSAGE
          ? errorMessageConstants.BOOKING_CONFLICT
          : errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};