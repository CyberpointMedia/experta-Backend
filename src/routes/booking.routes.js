const bookingPaymentController = require("../controllers/booking.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const routes = require("../constants/route.url");

module.exports = (app) => {
  const router = require("express").Router();

  // Wallet routes
  router.get(
    "/wallet-balance",
    authMiddleware,
    bookingPaymentController.getWalletBalance
  );
  router.post("/add-coins", authMiddleware, bookingPaymentController.addCoins);
  router.get(
    "/transaction-history",
    authMiddleware,
    bookingPaymentController.getTransactionHistory
  );

  // Booking routes
  router.post(
    "/create-booking",
    authMiddleware,
    bookingPaymentController.createBooking
  );
  router.get(
    "/bookings-as-client",
    authMiddleware,
    bookingPaymentController.getBookingsAsClient
  );
  router.get(
    "/bookings-as-expert",
    authMiddleware,
    bookingPaymentController.getBookingsAsExpert
  );
  router.patch(
    "/update-booking-status",
    authMiddleware,
    bookingPaymentController.updateBookingStatus
  );

  // Payment routes
  router.post(
    "/create-razorpay-order",
    authMiddleware,
    bookingPaymentController.createRazorpayOrder
  );
  router.post(
    "/verify-payment",
    authMiddleware,
    bookingPaymentController.verifyPayment
  );

  app.use(routes.API, router);
};
