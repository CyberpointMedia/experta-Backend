// controllers/booking.controller.js
const bookingService = require("../services/booking.service");
const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");

exports.getWalletBalance = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const result = await bookingService.getWalletBalance(userId);
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

exports.addCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.body.user._id;
    const result = await bookingService.createRazorpayOrder(userId, amount);
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

exports.createBooking = async (req, res) => {
  try {
    const { expertId, startTime, endTime, type } = req.body;
    const clientId = req.body.user._id;

    if (!expertId || !startTime || !endTime || !type) {
      return res.json(createResponse.invalid("Missing required booking details"));
    }

    const result = await bookingService.createBooking(
      clientId,
      expertId,
      startTime,
      endTime,
      type
    );
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

exports.getBookingsAsClient = async (req, res) => {
  const userId = req.body.user._id;
  const { startDate, endDate, status, type } = req.query;

  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const filters = {
      startDate,
      endDate,
      status,
      type
    };
    const result = await bookingService.getBookingsAsClient(userId, filters);
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

exports.getBookingsAsExpert = async (req, res) => {
  const userId = req.body.user._id;
  const { startDate, endDate, status, type } = req.query;

  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const filters = {
      startDate,
      endDate,
      status,
      type
    };
    const result = await bookingService.getBookingsAsExpert(userId, filters);
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

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const userId = req.body.user._id;

    if (!bookingId || !status) {
      return res.json(createResponse.invalid("Booking ID and status are required"));
    }

    const result = await bookingService.updateBookingStatus(
      bookingId,
      status,
      userId
    );
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

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.body.user._id;

    if (!amount) {
      return res.json(createResponse.invalid("Amount is required"));
    }

    const result = await bookingService.createRazorpayOrder(userId, amount);
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

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;
    const userId = req.body.user._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !transactionId) {
      return res.json(createResponse.invalid("Missing payment verification details"));
    }

    const result = await bookingService.verifyPayment(userId, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    });
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

exports.getTransactionHistory = async (req, res) => {
  const userId = req.body.user._id;
  const {
    startDate,
    endDate,
    type,      // 'payment' or 'coin'
    paymentType, // 'deposit' or 'withdrawal' (for payment transactions)
    coinType,    // 'booking_payment' or 'refund' (for coin transactions)
    status
  } = req.query;

  if (!userId) {
    return res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
  }

  try {
    const filters = {
      startDate,
      endDate,
      type,
      paymentType,
      coinType,
      status
    };

    const result = await bookingService.getTransactionHistory(userId, filters);
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

exports.initiateWithdrawal = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { amount, paymentDetails } = req.body;

    if (!amount || !paymentDetails) {
      return res.json(createResponse.invalid("Amount and bank account details are required"));
    }

    const result = await bookingService.initiateWithdrawal(userId, amount, paymentDetails);
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