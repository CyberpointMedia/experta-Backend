const BasicInfo = require('../models/basicInfo.model');
const Booking = require('../models/booking.model');
const { PaymentTransaction } = require("../models/transaction.model");
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Ticket = require('../models/ticket.model');
const Message = require('../models/ticketchats.model');
const createResponse = require('../utils/response');
const errorMessageConstants = require('../constants/error.messages');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {

    const { page, limit, skip } = req.pagination;
    // Fetch users and populate the `basicInfo` field
    const users = await User.find()
      .populate('basicInfo') // Populate the basicInfo field
      // .populate('pricing')   // Populate the pricing field
      // .populate('education') // Populate the education field (this is an array)
      // .populate('workExperience') // Populate the workExperience field (this is an array)
      // .populate('language') // Populate the language field
      // .populate('intereset') // Populate the intereset field
      // .populate('availability') // Populate the availability field (this is an array)
      // .populate('notifications') // Populate the notifications field (this is an array)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    // Check if users exist
    if (!users || users.length === 0) {
      return res.json(createResponse.success([], "No users found"));
    }

    // Return populated user data
    res.json(createResponse.success({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit
      }
    }));
  } catch (error) {
    console.error(error);  // Log error details for debugging

    // Return the error with appropriate code and message
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while fetching users'
    }));
  }
};

// Controller to get all BasicInfo
exports.getAllBasicInfo = async (req, res) => {
  try {
    const basicInfo = await BasicInfo.find()
      .populate('followers following posts reviews')  // Populating related fields
      .select('-__v');  // Excluding __v field from the response

    res.json(createResponse.success(basicInfo));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

//booking history controller
// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {

    const { page, limit, skip } = req.pagination;

    const bookings = await Booking.find()
      .populate('expert client')  // Populate expert and client references
      .skip(skip)                 // Skip based on pagination (page)
      .limit(limit)               // Limit results based on pagination (limit)
      .select('-__v')             // Exclude the __v field from the response
      .exec();

    const totalBookings = await Booking.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalBookings / limit);

    // Check if bookings exist
    if (!bookings || bookings.length === 0) {
      return res.json(createResponse.success([], "No bookings found"));
    }

    res.json(createResponse.success({
      bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookings,
        limit
      }
    }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id)
      .populate('expert client')
      .select('-__v');

    if (!booking) {
      return res.json(createResponse.invalid("Booking not found"));
    }

    res.json(createResponse.success(booking));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};


// Create a new booking
exports.createBooking = async (req, res) => {
  const { expert, client, startTime, endTime, duration, type, price } = req.body;

  if (!expert || !client || !startTime || !endTime || !duration || !type || !price) {
    return res.json(createResponse.invalid("Missing required fields"));
  }

  try {
    const newBooking = new Booking({
      expert,
      client,
      startTime,
      endTime,
      duration,
      type,
      price,
    });

    await newBooking.save();

    res.json(createResponse.success(newBooking));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status, startTime, endTime, price } = req.body;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.json(createResponse.invalid("Booking not found"));
    }
    // Update fields
    if (status) booking.status = status;
    if (startTime) booking.startTime = startTime;
    if (endTime) booking.endTime = endTime;
    if (price) booking.price = price;
    await booking.save();
    res.json(createResponse.success(booking));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.json(createResponse.invalid("Booking not found"));
    }

    await booking.remove();

    res.json(createResponse.success("Booking deleted successfully"));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

//transactions controller
// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;

    const transactions = await PaymentTransaction.find()
      .populate('user') // Populating user details
      .skip(skip)        // Skip based on pagination (page)
      .limit(limit)      // Limit results based on pagination (limit)
      .select('-__v')     // Exclude the __v field from the response
      .exec();

      // Get the total number of transactions to calculate the total pages
    const totalTransactions = await PaymentTransaction.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalTransactions / limit);

    // Check if transactions exist
    if (!transactions || transactions.length === 0) {
      return res.json(createResponse.success([], "No transactions found"));
    }

 // Return the transactions with pagination info
    res.json(createResponse.success({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        limit
      }
    }));
    } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Get a transaction by ID
exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await PaymentTransaction.findById(id)
      .populate('user')  // Populating the user associated with the transaction
      .select('-__v');

    if (!transaction) {
      return res.json(createResponse.invalid("Transaction not found"));
    }

    res.json(createResponse.success(transaction));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const { user, type, amount, status, paymentMethod, relatedBooking } = req.body;

  if (!user || !type || !amount || !status || !paymentMethod) {
    return res.json(createResponse.invalid("Missing required fields"));
  }

  try {
    const newTransaction = new PaymentTransaction({
      user,
      type,
      amount,
      status,
      paymentMethod,
      relatedBooking,
    });

    await newTransaction.save();

    res.json(createResponse.success(newTransaction));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { status, amount, paymentMethod, relatedBooking } = req.body;

  try {
    const transaction = await PaymentTransaction.findById(id);

    if (!transaction) {
      return res.json(createResponse.invalid("Transaction not found"));
    }

    // Update fields
    if (status) transaction.status = status;
    if (amount) transaction.amount = amount;
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (relatedBooking) transaction.relatedBooking = relatedBooking;

    await transaction.save();

    res.json(createResponse.success(transaction));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await PaymentTransaction.findById(id);

    if (!transaction) {
      return res.json(createResponse.invalid("Transaction not found"));
    }

    await transaction.remove();

    res.json(createResponse.success("Transaction deleted successfully"));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

//Reviews controller
// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    // Extract pagination info from the request object (set by the pagination middleware)
    const { page, limit, skip } = req.pagination;

    // Fetch reviews with pagination and populate the reviewer's details
    const reviews = await Review.find()
      .populate("reviewBy", "firstName lastName")  // Populate reviewer's info (firstName, lastName)
      .skip(skip)  // Skip the appropriate number of reviews based on pagination
      .limit(limit)  // Limit the number of reviews returned
      .select("-__v")  // Optionally exclude the __v field
      .exec();

    // Get the total number of reviews to calculate total pages
    const totalReviews = await Review.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalReviews / limit);

    // If no reviews found
    if (!reviews || reviews.length === 0) {
      return res.json(createResponse.success([], "No reviews found"));
    }

    // Return reviews with pagination info
    res.json(createResponse.success({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        limit
      }
    }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while fetching reviews',
    }));
  }
};

// Get a review by ID
exports.getReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findById(id)
      .populate("reviewBy", "firstName lastName") // Populate the reviewer's info
      .select("-__v");

    if (!review) {
      return res.json(createResponse.invalid("Review not found"));
    }

    res.json(createResponse.success(review));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  const { reviewBy, rating, review } = req.body;

  if (!reviewBy || !rating || !review) {
    return res.json(createResponse.invalid("Missing required fields"));
  }

  try {
    const newReview = new Review({
      reviewBy,
      rating,
      review,
    });

    await newReview.save();

    res.json(createResponse.success(newReview));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  try {
    const reviewToUpdate = await Review.findById(id);

    if (!reviewToUpdate) {
      return res.json(createResponse.invalid("Review not found"));
    }

    // Update fields
    if (rating) reviewToUpdate.rating = rating;
    if (review) reviewToUpdate.review = review;

    await reviewToUpdate.save();

    res.json(createResponse.success(reviewToUpdate));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id);

    if (!review) {
      return res.json(createResponse.invalid("Review not found"));
    }

    await review.remove();

    res.json(createResponse.success("Review deleted successfully"));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

//ticket history controller
// Create a new ticket
exports.createTicket = async (req, res) => {
  const { subject, description, fileUrl, priority } = req.body;
  const userId = req.body.user._id;  // Assuming user info is in `req.user` from authMiddleware

  try {
    const newTicket = new Ticket({
      userId,
      subject,
      description,
      fileUrl,
      priority,
    });

    const ticket = await newTicket.save();
    res.json(createResponse.success('Ticket created successfully', ticket));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Get all tickets (Admin or User can access their own tickets)
exports.getAllTickets = async (req, res) => {
  const userId = req.body.user._id;  // The logged-in user ID
  const { page, limit, skip } = req.pagination; 
  try {
    // Admin can see all tickets; Users only their own
    const tickets = await Ticket.find({
      $or: [{ userId }, { assignId: userId }]  // Either user-created or assigned to the user
    }).populate('userId assignId')
    .skip(skip)  // Skip the appropriate number of tickets for pagination
    .limit(limit)  // Limit the number of tickets per page
    .exec();

    // Get the total number of tickets for pagination
    const totalTickets = await Ticket.countDocuments({
      $or: [{ userId }, { assignId: userId }]
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalTickets / limit);

    res.json(createResponse.success({
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalTickets,
        limit
      }
    }));
    } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Get a specific ticket by ID
exports.getTicketById = async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.body.user._id;  // Assuming user info is in `req.body.user` from authMiddleware

  try {
    const ticket = await Ticket.findById(ticketId).populate('userId assignId');
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    // Ensure the ticket belongs to the logged-in user (either created or assigned to them)
    if (ticket.userId.toString() !== userId && ticket.assignId.toString() !== userId) {
      return res.status(403).json(createResponse.error({
        errorCode: 403,
        errorMessage: 'You are not authorized to view this ticket',
      }));
    }

    res.json(createResponse.success('Ticket fetched successfully', ticket));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Update a ticket (e.g., change status, priority)
exports.updateTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { status, priority, description } = req.body;
  const userId = req.body.user._id;  // Assuming user info is in `req.body.user` from authMiddleware

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    // Ensure the logged-in user is either the ticket creator or assigned user
    if (ticket.userId.toString() !== userId && ticket.assignId.toString() !== userId) {
      return res.status(403).json(createResponse.error({
        errorCode: 403,
        errorMessage: 'You are not authorized to update this ticket',
      }));
    }

    // Update only provided fields
    ticket.status = status || ticket.status;
    ticket.priority = priority || ticket.priority;
    ticket.description = description || ticket.description;

    await ticket.save();
    res.json(createResponse.success('Ticket updated successfully', ticket));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Assign a ticket to a user
exports.assignTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { assignId } = req.body;  // User to whom the ticket will be assigned
  const userId = req.body.user._id;  // Assuming user info is in `req.body.user` from authMiddleware

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    const assignedUser = await User.findById(assignId);
    if (!assignedUser) {
      return res.json(createResponse.invalid('User to assign not found'));
    }

    // Ensure that the logged-in user has permission to assign tickets
    if (ticket.userId.toString() !== userId) {
      return res.status(403).json(createResponse.error({
        errorCode: 403,
        errorMessage: 'You are not authorized to assign this ticket',
      }));
    }

    ticket.assignId = assignId;
    await ticket.save();
    res.json(createResponse.success('Ticket assigned successfully', ticket));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Close a ticket
exports.closeTicket = async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.body.user._id;  // Assuming user info is in `req.body.user` from authMiddleware

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    // Ensure the logged-in user is either the ticket creator or assigned user
    if (ticket.userId.toString() !== userId && ticket.assignId.toString() !== userId) {
      return res.status(403).json(createResponse.error({
        errorCode: 403,
        errorMessage: 'You are not authorized to close this ticket',
      }));
    }

    ticket.status = 'closed';
    await ticket.save();
    res.json(createResponse.success('Ticket closed successfully', ticket));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

//ticket chat controller
// Create a new message for a ticket
exports.createMessage = async (req, res) => {
  const { ticketId, receiverId, message, attachments } = req.body;
  const senderId = req.body.user._id;  // Assuming user info is in `req.body.user` from authMiddleware

  try {
    // Ensure the ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    // Ensure the receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.json(createResponse.invalid('Receiver not found'));
    }

    // Create the message
    const newMessage = new Message({
      ticketId,
      senderId,
      receiverId,
      message,
      attachments,
    });

    const savedMessage = await newMessage.save();
    res.json(createResponse.success('Message created successfully', savedMessage));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Get all messages related to a specific ticket
exports.getMessagesByTicketId = async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Find all messages related to the given ticket
    const messages = await Message.find({ ticketId })
      .populate('senderId receiverId')  // Populating sender and receiver details
      .sort({ timestamp: 1 });  // Sorting by timestamp (oldest first)

    if (messages.length === 0) {
      return res.json(createResponse.invalid('No messages found for this ticket'));
    }

    res.json(createResponse.success('Messages fetched successfully', messages));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

// Get all messages between a sender and receiver (Optional, if needed)
exports.getMessagesBetweenUsers = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ],
    })
      .populate('senderId receiverId')
      .sort({ timestamp: 1 });  // Sorting by timestamp (oldest first)

    if (messages.length === 0) {
      return res.json(createResponse.invalid('No messages found between the users'));
    }

    res.json(createResponse.success('Messages fetched successfully', messages));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: 500,
      errorMessage: error.message,
    }));
  }
};

