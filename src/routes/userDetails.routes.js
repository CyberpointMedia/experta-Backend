// userDetails.routes.js
const express = require('express');
const Router = express.Router();
const { getAllBasicInfo, getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking, getAllTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getAllReviews, getReviewById, createReview, updateReview, deleteReview, createTicket,
    getAllTickets,
    getAllActiveTickets,
    getAllClosedTickets,
    getTicketById,
    updateTicket,
    assignTicket,
    closeTicket, 
    createMessage,  
    getMessagesByTicketId, 
    getMessagesBetweenUsers,
    getBlockedUserById,
    getAllBlockedUsers,
    editBlockedUser,
    deleteBlockedUser
} = require('../controllers/userDetails.controller');
const { authMiddleware } = require("../middlewares/auth.middleware");
const {hasRole}=require("../middlewares/role.middleware");
const { paginate } = require('../middlewares/paginate.middleware');
const routes = require("../constants/route.url");
// Route to get all all-basic-info
Router.get('/all-basic-info',authMiddleware, hasRole('admin'), getAllBasicInfo);
//New Users routes
// Router.get('/get-all-users',authMiddleware, hasRole('admin'),paginate('User'), getAllUsers);

//Booking history routes
// Route to get all bookings
Router.get('/all-bookings/:id',authMiddleware, hasRole('admin'),paginate('Booking'), getAllBookings); 

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
Router.get('/get-all-transactions/:id', authMiddleware, hasRole('admin'),paginate('PaymentTransaction'), getAllTransactions);
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
Router.get('/all-reviews/:id', authMiddleware, hasRole('admin'), paginate('Review'), getAllReviews);
// Get a review by ID
Router.get('/reviews/:id', authMiddleware, hasRole('admin'), getReviewById);
// Update a review
Router.put('/reviews/:id', authMiddleware, hasRole('admin'), updateReview);
// Delete a review
Router.delete('/reviews/:id', authMiddleware, hasRole('admin'), deleteReview);

//block user routes
Router.get('/all-blocked-users/:id', authMiddleware, hasRole('admin'),paginate('User'), getBlockedUserById);

//add the industry 


//ticket routes 
// Create a new ticket
Router.post('/ticket', authMiddleware, hasRole('admin'), createTicket);
// Get all tickets (Admin can access all, User can access only their tickets)
Router.get('/get-all-tickets',authMiddleware, hasRole('admin'), paginate('Ticket') , getAllTickets);
// Get all active tickets
Router.get('/get-all-active-tickets',authMiddleware, paginate('Ticket') , getAllActiveTickets);
//get all closed api 
Router.get('/get-all-closed-tickets',authMiddleware, paginate('Ticket') , getAllClosedTickets);
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

module.exports = (app) => {
    app.use(routes.API, Router); 
};
