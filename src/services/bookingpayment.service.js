const bookingPaymentDao = require("../dao/bookingPayment.dao");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getWalletBalance = async function (userId) {
  try {
    const user = await bookingPaymentDao.getUserById(userId);
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

exports.addCoins = async function (userId, amount) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `${userId}_${Date.now()}`,
    });
    return createResponse.success({ order });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getTransactionHistory = async function (userId) {
  try {
    const transactions = await bookingPaymentDao.getTransactionsByUserId(
      userId
    );
    return createResponse.success(transactions);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.createBooking = async function (
  clientId,
  expertId,
  startTime,
  endTime,
  type
) {
  try {
    if (clientId === expertId) {
      return createResponse.error({
        errorCode: errorMessageConstants.INVALID_OPERATION,
        errorMessage: "You cannot book yourself",
      });
    }

    const client = await bookingPaymentDao.getUserById(clientId);
    const expert = await bookingPaymentDao.getUserById(expertId);

    if (!client || !expert) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found",
      });
    }

    const isAvailable = await bookingPaymentDao.checkExpertAvailability(
      expertId,
      startTime,
      endTime
    );
    if (!isAvailable) {
      return createResponse.error({
        errorCode: errorMessageConstants.BOOKING_CONFLICT,
        errorMessage: "Expert is not available at the requested time",
      });
    }

    const price = await bookingPaymentDao.getExpertPrice(expertId, type);

    if (client.wallet.balance < price) {
      return createResponse.error({
        errorCode: errorMessageConstants.INSUFFICIENT_FUNDS,
        errorMessage: "Insufficient coins in wallet",
      });
    }

    const duration = Math.round(
      (new Date(endTime) - new Date(startTime)) / (1000 * 60)
    );

    const booking = await bookingPaymentDao.createBooking(
      clientId,
      expertId,
      startTime,
      endTime,
      type,
      price,
      duration
    );
    await bookingPaymentDao.updateUserWallet(
      clientId,
      -price,
      "payment",
      booking._id
    );
    return createResponse.success(booking);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getBookingsAsClient = async function (userId) {
  try {
    const bookings = await bookingPaymentDao.getBookingsAsClient(userId);
    return createResponse.success(bookings);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getBookingsAsExpert = async function (userId) {
  try {
    const bookings = await bookingPaymentDao.getBookingsAsExpert(userId);
    return createResponse.success(bookings);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.updateBookingStatus = async function (bookingId, status, userId) {
  try {
    const booking = await bookingPaymentDao.getBookingById(bookingId);
    if (!booking) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "Booking not found",
      });
    }

    if (booking.expert._id.toString() !== userId.toString()) {
      return createResponse.error({
        errorCode: errorMessageConstants.UNAUTHORIZED,
        errorMessage: "You are not authorized to update this booking",
      });
    }

    if (booking.status !== "pending") {
      return createResponse.error({
        errorCode: errorMessageConstants.INVALID_OPERATION,
        errorMessage: "This booking can no longer be updated",
      });
    }

    if (status === "confirmed") {
      // Add amount to expert's wallet
      await bookingPaymentDao.updateUserWallet(
        booking.expert._id,
        booking.price,
        "payment",
        booking._id
      );
    } else if (status === "declined") {
      // Refund coins to the client
      await bookingPaymentDao.updateUserWallet(
        booking.client._id,
        booking.price,
        "refund",
        booking._id
      );
    }

    const updatedBooking = await bookingPaymentDao.updateBookingStatus(
      bookingId,
      status
    );
    return createResponse.success(updatedBooking);
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
      receipt: `${userId}_${Date.now()}`,
    });
    return createResponse.success({ order });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.verifyPayment = async function (
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) {
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await razorpay.orders.fetch(razorpay_order_id);
      const amount = order.amount / 100; // Convert paise to rupees

      await bookingPaymentDao.updateUserWallet(userId, amount, "deposit");
      return createResponse.success({
        message: "Payment successful and wallet updated",
      });
    } else {
      return createResponse.error({
        errorCode: errorMessageConstants.PAYMENT_VERIFICATION_FAILED,
        errorMessage: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.withdrawFromWallet = async function (userId, amount, accountDetails) {
  try {
    const user = await bookingPaymentDao.getUserById(userId);
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found",
      });
    }

    if (user.wallet.balance < amount) {
      return createResponse.error({
        errorCode: errorMessageConstants.INSUFFICIENT_FUNDS,
        errorMessage: "Insufficient balance in wallet",
      });
    }

    const taxRate = 0.18; // 18% tax
    const platformFeeRate = 0.02; // 2% platform fee
    const totalDeductionRate = taxRate + platformFeeRate;

    const totalDeduction = amount * totalDeductionRate;
    const amountAfterDeduction = amount - totalDeduction;

    // Create a payout using Razorpay
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: accountDetails.fund_account_id,
      amount: Math.round(amountAfterDeduction * 100), // Amount in paise
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: `withdrawal_${userId}_${Date.now()}`,
      narration: "Withdrawal from wallet",
    });

    // Create a withdrawal transaction
    const withdrawalTransaction = await bookingPaymentDao.createTransaction({
      user: userId,
      type: "withdrawal",
      amount: amount, // Positive amount as per your schema
      status: "pending", // Set to pending until confirmed by Razorpay webhook
      paymentMethod: "razorpay",
      description: `Withdrawal to bank account. Tax: ${
        taxRate * 100
      }%, Platform fee: ${platformFeeRate * 100}%`,
    });

    // Create transactions for tax and platform fee
    const taxTransaction = await bookingPaymentDao.createTransaction({
      user: userId,
      type: "withdrawal", // Using withdrawal type for deductions as well
      amount: amount * taxRate,
      status: "completed",
      paymentMethod: "wallet",
      description: `Tax deduction for withdrawal of ${amount}`,
    });

    const platformFeeTransaction = await bookingPaymentDao.createTransaction({
      user: userId,
      type: "withdrawal", // Using withdrawal type for deductions as well
      amount: amount * platformFeeRate,
      status: "completed",
      paymentMethod: "wallet",
      description: `Platform fee for withdrawal of ${amount}`,
    });

    // Update user's wallet balance
    await bookingPaymentDao.updateUserWallet(userId, -amount);

    return createResponse.success({
      message: "Withdrawal initiated successfully",
      withdrawalAmount: amount,
      amountAfterDeduction: amountAfterDeduction,
      taxAmount: amount * taxRate,
      platformFee: amount * platformFeeRate,
      payoutId: payout.id,
      transactions: [
        withdrawalTransaction,
        taxTransaction,
        platformFeeTransaction,
      ],
    });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};
