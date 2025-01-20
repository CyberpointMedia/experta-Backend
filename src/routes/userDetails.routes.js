// userDetails.routes.js
const express = require('express');
const Router = express.Router();
const { getAllBasicInfo,
    getAllBookings, 
    getBookingById, 
    createBooking, 
    updateBooking, 
    deleteBooking, 
    getAllTransactions, 
    getTransactionById, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction, 
    getAllReviews, 
    getReviewById, 
    createReview, 
    updateReview, 
    deleteReview,
    getBlockedUserById,
    getAllBlockedUsers,
    editBlockedUser,
    deleteBlockedUser,
    getUserkycStatus,
    getAllActivities,
    uploadServices,
} = require('../controllers/userDetails.controller');
const { authMiddleware } = require("../middlewares/auth.middleware");
const uploadMiddleWare = require("../middlewares/file.middleware");
const { hasRole } = require("../middlewares/role.middleware");
const { paginate } = require('../middlewares/paginate.middleware');
const routes = require("../constants/route.url");
// Route to get all all-basic-info
Router.get('/all-basic-info', authMiddleware, hasRole('admin'), getAllBasicInfo);
//New Users routes
// Router.get('/get-all-users',authMiddleware, hasRole('admin'),paginate('User'), getAllUsers);

//Booking history routes
// Route to get all bookings
Router.get('/all-bookings/:id', authMiddleware, hasRole('admin'), paginate('Booking'), getAllBookings);

// Get a booking by ID
Router.get('/bookings/:id', authMiddleware, hasRole('admin'), getBookingById);
// Create a new booking
Router.post('/bookings', authMiddleware, hasRole('admin'), createBooking);
// Update a booking
Router.put('/bookings/:id', authMiddleware, hasRole('admin'), updateBooking);
// Delete a booking
Router.delete('/bookings/:id', authMiddleware, hasRole('admin'), deleteBooking);

//Transaction history routes
// Get all transactions
Router.get('/get-all-transactions/:id', authMiddleware, hasRole('admin'), paginate('PaymentTransaction'), getAllTransactions);
// Get a transaction by ID
Router.get('/transactions/:id', authMiddleware, hasRole('admin'), getTransactionById);
// Delete a transaction
Router.delete('/transactions/:id', authMiddleware, hasRole('admin'), deleteTransaction);

//review history routes
// Get all reviews
Router.get('/all-reviews/:id', authMiddleware, hasRole('admin'), paginate('Review'), getAllReviews);
// Get a review by ID
Router.get('/reviews/:id', authMiddleware, hasRole('admin'), getReviewById);
// Update a review
Router.put('/reviews/:id', authMiddleware, hasRole('admin'), updateReview);
// Delete a review
Router.delete('/reviews/:id', authMiddleware, hasRole('admin'), deleteReview);

//block user routes
Router.get('/all-blocked-users/:id', authMiddleware, hasRole('admin'), paginate('User'), getBlockedUserById);

//get kyc status
Router.get('/all-users-kyc-status/:id', authMiddleware, hasRole('admin'), getUserkycStatus);

//activity routes
Router.get('/all-activity/:id', authMiddleware, hasRole('admin'), paginate('User'), getAllActivities);

//uplaod services 
Router.post('/upload-services', uploadMiddleWare.single("icon"), uploadServices);

module.exports = (app) => {
    app.use(routes.API, Router);
};
