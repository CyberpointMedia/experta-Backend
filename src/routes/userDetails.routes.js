// basicINfo.routes.js
const express = require('express');
const Router = express.Router();
const { getAllBasicInfo, getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking, getAllTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getAllReviews, getReviewById, createReview, updateReview, deleteReview, createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    assignTicket,
    closeTicket, 
    createMessage,  
    getMessagesByTicketId, 
    getMessagesBetweenUsers,
    getAllUsers
} = require('../controllers/userDetails.controller');
const { authMiddleware } = require("../middlewares/auth.middleware");
const {hasRole}=require("../middlewares/role.middleware")
const routes = require("../constants/route.url");

// Route to get all all-basic-info
Router.get('/all-basic-info',authMiddleware, hasRole('admin'), getAllBasicInfo);
//New Users routes
Router.get('/get-all-users',authMiddleware, hasRole('admin'), getAllUsers);

//Booking history routes
// Route to get all bookings
Router.get('/all-bookings',authMiddleware, hasRole('admin'), getAllBookings);  // Add the bookings route
// Get all bookings
Router.get('/bookings',authMiddleware, hasRole('admin'), authMiddleware, getAllBookings);
// Get a booking by ID
Router.get('/bookings/:id',authMiddleware, hasRole('admin'), getBookingById);
// Create a new booking
Router.post('/bookings',authMiddleware, hasRole('admin'), createBooking);
// Update a booking
Router.put('/bookings/:id',authMiddleware, hasRole('admin'), updateBooking);
// Delete a booking
Router.delete('/bookings/:id',authMiddleware, hasRole('admin'), deleteBooking);

//Transaction history routes
// Get all transactions
Router.get('/transactions', authMiddleware, hasRole('admin'), getAllTransactions);
// Get a transaction by ID
Router.get('/transactions/:id', authMiddleware, hasRole('admin'), getTransactionById);
// Create a new transaction
Router.post('/transactions', authMiddleware, hasRole('admin'), createTransaction);
// Update a transaction
Router.put('/transactions/:id', authMiddleware, hasRole('admin'), updateTransaction);
// Delete a transaction
Router.delete('/transactions/:id', authMiddleware, hasRole('admin'), deleteTransaction);

//review history routes
// Get all reviews
Router.get('/reviews', authMiddleware, hasRole('admin'), getAllReviews);
// Get a review by ID
Router.get('/reviews/:id', authMiddleware, hasRole('admin'), getReviewById);
// Create a new review
Router.post('/reviews', authMiddleware, hasRole('admin'), createReview);
// Update a review
Router.put('/reviews/:id', authMiddleware, hasRole('admin'), updateReview);
// Delete a review
Router.delete('/reviews/:id', authMiddleware, hasRole('admin'), deleteReview);

//ticket routes 
// Create a new ticket
Router.post('/ticket', authMiddleware, hasRole('admin'), createTicket);
// Get all tickets (Admin can access all, User can access only their tickets)
Router.get('/get-all-tickets',authMiddleware, hasRole('admin'), getAllTickets);
// Get a specific ticket by ID
Router.get('/get-ticket/:ticketId', authMiddleware, hasRole('admin'), getTicketById);
// Update a ticket (status, priority, description)
Router.put('/update-ticket/:ticketId', authMiddleware, hasRole('admin'), updateTicket);
// Assign a ticket to a user
Router.put('/ticket/assign/:ticketId', authMiddleware, hasRole('admin'), assignTicket);
// Close a ticket
Router.put('/ticket/close/:ticketId', authMiddleware, hasRole('admin'), closeTicket);

//ticket message routes
// Route to create a new message for a ticket
Router.post('/createTicketChat', authMiddleware, hasRole('admin'), createMessage);
// Route to get all messages for a specific ticket by ticketId
Router.get('/ticket/:ticketId', authMiddleware, hasRole('admin'), getMessagesByTicketId);
// Optional route to get all messages between two users (senderId and receiverId)
Router.get('/between/:senderId/:receiverId', authMiddleware, hasRole('admin'), getMessagesBetweenUsers);
 
// Export the routes as middleware to be used in app.js
module.exports = (app) => {
    app.use(routes.API, Router);  // Prefix your routes with `/api`
};