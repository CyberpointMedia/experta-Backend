// userDetails.routes.js
const express = require('express');
const Router = express.Router();
const userdetails = require('../controllers/userDetails.controller');
const { authMiddleware } = require("../middlewares/auth.middleware");
const uploadMiddleWare = require("../middlewares/file.middleware");
const { hasRole } = require("../middlewares/role.middleware");
const { paginate } = require('../middlewares/paginate.middleware');
const routes = require("../constants/route.url");

// Route to get all all-basic-info
Router.get('/all-basic-info', authMiddleware, hasRole('admin'), userdetails.getAllBasicInfo);

// Booking history routes
// Route to get all bookings
Router.get('/all-bookings/:id', authMiddleware, hasRole('admin'), paginate('Booking'), userdetails.getAllBookings);

// Get a booking by ID
Router.get('/bookings/:id', authMiddleware, hasRole('admin'), userdetails.getBookingById);
// Create a new booking
Router.post('/bookings', authMiddleware, hasRole('admin'), userdetails.createBooking);
// Update a booking
Router.put('/bookings/:id', authMiddleware, hasRole('admin'), userdetails.updateBooking);
// Delete a booking
Router.delete('/bookings/:id', authMiddleware, hasRole('admin'), userdetails.deleteBooking);

// Transaction history routes
// Get all transactions
Router.get('/get-all-transactions/:id', authMiddleware, hasRole('admin'), paginate('PaymentTransaction'), userdetails.getAllTransactions);
// Get a transaction by ID
Router.get('/transactions/:id', authMiddleware, hasRole('admin'), userdetails.getTransactionById);
// Delete a transaction
Router.delete('/transactions/:id', authMiddleware, hasRole('admin'), userdetails.deleteTransaction);

// Review history routes
// Get all reviews
Router.get('/all-reviews/:id', authMiddleware, hasRole('admin'), paginate('Review'), userdetails.getAllReviews);
// Get a review by ID
Router.get('/reviews/:id', authMiddleware, hasRole('admin'), userdetails.getReviewById);
// Update a review
Router.put('/reviews/:id', authMiddleware, hasRole('admin'), userdetails.updateReview);
// Delete a review
Router.delete('/reviews/:id', authMiddleware, hasRole('admin'), userdetails.deleteReview);

// Block user routes
Router.get('/all-blocked-users/:id', authMiddleware, hasRole('admin'), paginate('User'), userdetails.getBlockedUserById);

// Get KYC status
Router.get('/all-users-kyc-status/:id', authMiddleware, hasRole('admin'), userdetails.getUserkycStatus);

// Activity routes
Router.get('/all-activity/:id', authMiddleware, hasRole('admin'), paginate('User'), userdetails.getAllActivities);

// Upload services 
Router.post('/upload-services', uploadMiddleWare.single("icon"), userdetails.uploadServices);

Router.post('/contact-us', userdetails.contactUs);

module.exports = (app) => {
    app.use(routes.API, Router);
};
