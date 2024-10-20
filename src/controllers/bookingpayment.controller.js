const bookingPaymentService = require("../services/bookingPayment.service");
const errorMessageConstants = require("../constants/error.messages");
const createResponse = require("../utils/response");

exports.getWalletBalance = async (req, res) => {
  const userId = req.body.user._id;
  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const result = await bookingPaymentService.getWalletBalance(userId);
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
    const result = await bookingPaymentService.addCoins(userId, amount);
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
  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const result = await bookingPaymentService.getTransactionHistory(userId);
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
    const result = await bookingPaymentService.createBooking(
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
  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const result = await bookingPaymentService.getBookingsAsClient(userId);
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
  if (!userId) {
    res.json(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }
  try {
    const result = await bookingPaymentService.getBookingsAsExpert(userId);
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
    const result = await bookingPaymentService.updateBookingStatus(
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
    const result = await bookingPaymentService.createRazorpayOrder(
      userId,
      amount
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

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.body.user._id;
    const result = await bookingPaymentService.verifyPayment(
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
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



exports.withdrawFromWallet = async (req, res) => {
  try {
    const { amount, accountDetails } = req.body;
    const userId = req.body.user._id;
    const result = await bookingPaymentService.withdrawFromWallet(
      userId,
      amount,
      accountDetails
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