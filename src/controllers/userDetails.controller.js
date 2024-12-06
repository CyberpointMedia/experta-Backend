const BasicInfo = require('../models/basicInfo.model');
const Booking = require('../models/booking.model');
const { PaymentTransaction } = require("../models/transaction.model");
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Ticket = require('../models/ticket.model');
const Message = require('../models/ticketchats.model');
const BlockedUser = require('../models/blockUser.model');
const createResponse = require('../utils/response');
const errorMessageConstants = require('../constants/error.messages');
const mongoose = require('mongoose');

// Get all users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const { page, limit, skip } = req.pagination;
//     const { isVerified, isBlocked } = req.query;

//     const userFilter = { isDeleted: false };
//     if (isVerified !== undefined) {
//       filter.isVerified = isVerified === 'true';
//     }

//     const users = await User.find(filter)
//       .skip(skip)
//       .limit(limit)
//       .populate('basicInfo')
//       .populate({
//         path: 'block',
//         model: 'BlockedUser',
//         match: { isDeleted: false },
//         select: 'block blockExpiry',
//       })
//       // .populate('pricing') 
//       // .populate('education') 
//       // .populate('workExperience')
//       // .populate('language') 
//       // .populate('intereset')
//       // .populate('availability')
//       // .populate('notifications') 
//       .exec();

//     const verifiedCount = await User.countDocuments({ isDeleted: false, isVerified: true });
//     const unverifiedCount = await User.countDocuments({ isDeleted: false, isVerified: false });
//     const blockedCount = await BlockedUser.countDocuments({ block: true, isDeleted: false });
//     const unblockedCount = await BlockedUser.countDocuments({ block: false, isDeleted: false });

//     const totalUsers = await User.countDocuments({ isDeleted: false });
//     const totalPages = Math.ceil(totalUsers / limit);

//     if (!filteredUsers || filteredUsers.length === 0) {
//       return res.json(createResponse.success({
//         errorMessage: 'No users found',
//         counts: {
//           verified: verifiedCount,
//           unverified: unverifiedCount,
//           blocked: blockedCount,
//           unblocked: unblockedCount,
//         },
//         pagination: {
//           currentPage: page,
//           totalPages,
//           totalItems: totalUsers
//         }
//       }));
//     }
//     res.json(createResponse.success({
//       users,
//       counts: {
//         verified: verifiedCount,
//         unverified: unverifiedCount,
//         blocked: blockedCount,
//         unblocked: unblockedCount,
//       },
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalItems: totalUsers
//       }
//     }));
//   } catch (error) {
//     console.error(error);
//     res.json(createResponse.error({
//       errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
//       errorMessage: error.message || 'An error occurred while fetching users'
//     }));
//   }
// };

// Controller to get all BasicInfo
exports.getAllBasicInfo = async (req, res) => {
  try {
    const basicInfo = await BasicInfo.find({ isDeleted: false })
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
    const id = req.params.id;
    const {fullName} = req.query;
    console.log("id",id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(
        createResponse.error({
          errorCode: "INVALID_ID",
          errorMessage: "The provided ID is not valid",
        })
      );
    }

    const baseQuery = {
      isDeleted: false,
      $or: [{ client: id }, { expert: id }],
    };

    if (fullName) {
      const regexPattern = new RegExp(fullName, "i");
      baseQuery.$or.push(
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$expert.basicInfo.firstName", " ", "$expert.basicInfo.lastName"] },
              regex: regexPattern,
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$client.basicInfo.firstName", " ", "$client.basicInfo.lastName"] },
              regex: regexPattern,
            },
          },
        }
      );
    }

    const bookings = await Booking.find(baseQuery)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "expert",
      select: "-__v",
      populate: {
        path: "basicInfo",
        select: "firstName lastName", 
      },
    })

    .populate({
      path: "client",
      select: "-__v",
      populate: {
        path: "basicInfo",
        select: "firstName lastName",
      },
    })
      .select("-__v")
      .exec();
      const totalBookings = await Booking.countDocuments(baseQuery);
      const totalPages = Math.ceil(totalBookings / limit);
    if (!bookings || bookings.length === 0) {
      return res.json(createResponse.success({
        bookings,
        pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBookings,
        }, 
        message: "No bookings found"
      }));
    }
    res.json(createResponse.success({
      bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBookings
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
    const booking = await Booking.findOne({ _id: id, isDeleted: false })
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
    const booking = await Booking.findOne({ _id: id, isDeleted: false });
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
    const booking = await Booking.findOne({ _id: id, isDeleted: false });
    if (!booking) {
      return res.json(createResponse.invalid("Booking not found"));
    }

    booking.isDeleted = true;

    await booking.save();

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
    const { userId } = req.params;
    const {status}= req.params;

    if (!userId) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.BAD_REQUEST_ERROR_CODE,
        errorMessage: 'User ID is required',
      }));
    }
    const filter = {
      isDeleted: false,
      user: userId, 
    };

    if (status) {
      const allowedStatuses = ['completed', 'pending', 'failed'];
      if (!allowedStatuses.includes(status)) {
        return res.json(createResponse.error({
          errorCode: errorMessageConstants.BAD_REQUEST_ERROR_CODE,
          errorMessage: 'Invalid status value',
        }));
      }
      filter.status = status;
    }

    const transactions = await PaymentTransaction.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .populate('user')
      .select('-__v')
      .exec();

    const totalTransactions = await PaymentTransaction.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(totalTransactions / limit);

    res.json(createResponse.success({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTransactions
      }
    }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTransactions
      }
    }));
  }
};

// Get a transaction by ID
exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await PaymentTransaction.findOne({ _id: id, isDeleted: false })
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
    const transaction = await PaymentTransaction.findOne({ _id: id, isDeleted: false });

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
    const transaction = await PaymentTransaction.findOne({ _id: id, isDeleted: false });

    if (!transaction) {
      return res.json(createResponse.invalid("Transaction not found"));
    }
    transaction.isDeleted = true;
    await transaction.save();

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
    console.log("Inside getAllReviews controller");
    // Extract pagination info from the request object (set by the pagination middleware)
    const { page, limit, skip } = req.pagination;

    // Fetch reviews with pagination and populate the reviewer's details
    const reviews = await Review.find({ isDeleted: false })
      .populate("reviewBy", "firstName lastName")  // Populate reviewer's info (firstName, lastName)
      .skip(skip)  // Skip the appropriate number of reviews based on pagination
      .limit(limit)  // Limit the number of reviews returned
      .select("-__v")  // Optionally exclude the __v field
      .exec();

    // Get the total number of reviews to calculate total pages
    const totalReviews = await Review.countDocuments({ isDeleted: false });

    // Calculate total pages
    const totalPages = Math.ceil(totalReviews / limit);

    // If no reviews found
    if (!reviews || reviews.length === 0) {
      return res.json(createResponse.success([], "No reviews found"));
    }

    res.json(createResponse.success({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalReviews
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

// Get a review by ID
exports.getReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findOne({ _id: id, isDeleted: false })
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
    const reviewToUpdate = await Review.findOne({ _id: id, isDeleted: false });

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
    const review = await Review.findOne({ _id: id, isDeleted: false });

    if (!review) {
      return res.json(createResponse.invalid("Review not found"));
    }
    review.isDeleted = true;
    await review.save();

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
  const { page, limit, skip } = req.pagination;
  const userId = req.body.user._id;

  try {
    const tickets = await Ticket.find({
      isDeleted: false,
      $or: [{ userId }, { assignId: userId }]
    })
      .skip(skip)
      .limit(limit)
      .populate('userId assignId')
      .exec();

    const totalTickets = await Ticket.countDocuments({
      isDeleted: false,
      $or: [{ userId }, { assignId: userId }]
    });
    const totalPages = Math.ceil(totalTickets / limit);
    if (!tickets || tickets.length === 0) {
      return res.json(createResponse.success([], "No tickets found"));
    }
    res.json(createResponse.success({
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTickets
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

// Get all active tickets (Admin or User can access their own tickets)
exports.getAllActiveTickets = async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const userId = req.body.user._id;

  try {
    const tickets = await Ticket.find({
      isDeleted: false,
      status: "open",
      $or: [{ userId }, { assignId: userId }]
    })
      .skip(skip)
      .limit(limit)
      .populate('userId assignId')
      .exec();

    const totalTickets = await Ticket.countDocuments({
      isDeleted: false,
      status: "open",
      $or: [{ userId }, { assignId: userId }]
    });
    console.log("totalTickets", totalTickets);
    const totalPages = Math.ceil(totalTickets / limit);
    if (!tickets || tickets.length === 0) {
      return res.json(createResponse.success([], "No active tickets found"));
    }
    res.json(createResponse.success({
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTickets
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

// Get all closed tickets (Admin or User can access their own tickets)
exports.getAllClosedTickets = async (req, res) => {
  const { page, limit, skip } = req.pagination;
  const userId = req.body.user._id;

  try {
    const tickets = await Ticket.find({
      isDeleted: false,
      status: "closed",
      $or: [{ userId }, { assignId: userId }]
    })
      .skip(skip)
      .limit(limit)
      .populate('userId assignId')
      .exec();

    const totalTickets = await Ticket.countDocuments({
      isDeleted: false,
      status: "closed",
      $or: [{ userId }, { assignId: userId }]
    });
    const totalPages = Math.ceil(totalTickets / limit);
    if (!tickets || tickets.length === 0) {
      return res.json(createResponse.success([], "No closed tickets found"));
    }
    res.json(createResponse.success({
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTickets
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
    const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false })
      .populate('userId assignId');
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    // Ensure the ticket belongs to the logged-in user (either created or assigned to them)
    if (ticket.userId._id.toString() !== userId && ticket.assignId._id.toString() !== userId) {
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
    const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
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
    const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
    if (!ticket) {
      return res.json(createResponse.invalid('Ticket not found'));
    }

    const assignedUser = await User.findOne({ _id: assignId, isDeleted: false });
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

    ticket.assignId = assignedUser._id;
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
    const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
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
    ticket.isDeleted = true;
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
    const receiver = await User.findOne({ _id: receiverId, isDeleted: false });
    if (!receiver) {
      return res.json(createResponse.invalid('Receiver not found'));
    }

    const existingTicket = await Ticket.findOne({ _id: ticketId, isDeleted: false });

    if (existingTicket) {
      const newMessage = new Message({
        ticketId,
        senderId,
        receiverId,
        message,
        attachments,
      });

      await newMessage.save();

      return res.json(createResponse.success('Message appended to existing ticket', newMessage));
    } else {
      const newTicket = new Ticket({
        userId: senderId,
        subject: `Message for ticket ${ticketId}`,
        description: message,
        fileUrl: attachments || [],
        priority: 'low',
        messages: [{
          senderId,
          receiverId,
          message,
          attachments,
        }],
      });

      const savedTicket = await newTicket.save();
      return res.json(createResponse.success('New ticket created with message', savedTicket));
    }
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
    const messages = await Message.find({ _id: ticketId, isDeleted: false })
      .populate('senderId receiverId')
      .sort({ timestamp: 1 });

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
      isDeleted: false,
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

//block user controller
// Get BlockedUser by ID
exports.getBlockedUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const blockedUser = await BlockedUser.findOne({ _id: id, isDeleted: false }).populate('user');
    if (!blockedUser) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.NOT_FOUND_CODE,
        errorMessage: 'Blocked user not found',
      }));
    }
    res.json(createResponse.success(blockedUser));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while fetching the blocked user',
    }));
  }
};

// Get All BlockedUsers
exports.getAllBlockedUsers = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const blockedUsers = await BlockedUser.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .populate('user')
      .exec();

    const totalBlockedUsers = await BlockedUser.countDocuments();
    const totalPages = Math.ceil(totalBlockedUsers / limit);

    if (!blockedUsers || blockedUsers.length === 0) {
      return res.json(createResponse.success([], "No blocked users found"));
    }

    res.json(createResponse.success({
      blockedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBlockedUsers,
      },
    }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while fetching blocked users',
    }));
  }
};

// Edit BlockedUser
exports.editBlockedUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const blockedUser = await BlockedUser.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { block },
      { new: true }
    );

    if (!blockedUser) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.NOT_FOUND_CODE,
        errorMessage: 'Blocked user not found',
      }));
    }

    res.json(createResponse.success(blockedUser, 'Blocked user updated successfully'));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while updating the blocked user',
    }));
  }
};

// Delete BlockedUser
exports.deleteBlockedUser = async (req, res) => {
  try {
    const { id } = req.params;

    const blockedUser = await BlockedUser.findOne({ _id: id, isDeleted: false });

    blockedUser.isDeleted = true;
    await blockedUser.save();

    if (!blockedUser) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.NOT_FOUND_CODE,
        errorMessage: 'Blocked user not found',
      }));
    }

    res.json(createResponse.success(null, 'Blocked user deleted successfully'));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message || 'An error occurred while deleting the blocked user',
    }));
  }
};




