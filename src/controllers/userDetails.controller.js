const BasicInfo = require('../models/basicInfo.model');
const Booking = require('../models/booking.model');
const { PaymentTransaction } = require("../models/transaction.model");
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Ticket = require('../models/ticket.model');
const BlockedUser = require('../models/blockUser.model');
const Post = require('../models/post.model');
const createResponse = require('../utils/response');
const errorMessageConstants = require('../constants/error.messages');
const mongoose = require('mongoose');
const kycService = require('../services/kyc.service');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Service = require('../models/service.model');
const {transporter} = require('../utils/sendMail');
const ContactUs = require('../models/contactUs.model');
const Notification = require('../models/notification.model');

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
    const {username} = req.query;
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

    if (username) {
      const regexPattern = new RegExp(username, "i");
      baseQuery.$or.push(
      {
        $expr: {
        $regexMatch: {
          input: "$expert.basicInfo.username",
          regex: regexPattern,
        },
        },
      },
      {
        $expr: {
        $regexMatch: {
          input: "$client.basicInfo.username",
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
      select: "username",
      populate: {
        path: "reviews",
        select: "rating review",
      },
      },
    })
    .populate({
      path: "client",
      select: "-__v",
      populate: {
      path: "basicInfo",
      select: "username",
      populate: {
        path: "reviews",
        select: "rating review",
      },
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
    const userId = req.params.id;
    const {status , search}= req.query;
    
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
    if (search) {
      filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
      { 'razorpayDetails.paymentId': { $regex: search, $options: 'i' } },
      ];
    }


    const transactions = await PaymentTransaction.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('user')
      .select('-__v')
      .exec();

    const totalTransactions = await PaymentTransaction.countDocuments(filter);
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

//user kyc status controller
exports.getUserkycStatus = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }

  try {
    const kycStatusResponse = await kycService.getKycStatus(userId);
    const { userData, kycStatus } = kycStatusResponse;
    res.json(createResponse.success({ userData, kycStatus }));
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

//activity 
exports.getAllActivities = async (req, res) => {
  const userId = req.params.id;
  const { page, limit, skip } = req.pagination;
  const { search } = req.query;
  if (!userId) {
    res.send(createResponse.invalid(errorMessageConstants.REQUIRED_ID));
    return;
  }

  try {
    const userFilter = { isDeleted: false, 'comments.user': new mongoose.Types.ObjectId(userId) };

 

    const posts = await Post.find(userFilter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'postedBy',
        model: 'User',
        select: 'email',
        populate: {
          path: 'basicInfo',
          model: 'BasicInfo',
          select: 'firstName lastName username profilePic'
        }
      })
      .select('-__v');

      if (search) {
        const regexPattern = new RegExp(search, "i");
        userFilter['postedBy.basicInfo.username'] = { $regex: regexPattern };
      }

    if (!posts.length) {
      return res.json(createResponse.invalid("No posts found"));
    }

    posts.forEach(post => {
      post.comments = post.comments.filter(comment => comment.user._id.toString() === userId);
    });

    const review = await Review.find({ isDeleted: false, reviewBy: userId });

    const totalPosts = await Post.countDocuments(userFilter);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json(createResponse.success({
      posts,
      review,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts
      }
    }));
  } catch (error) {
    console.log(error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

//uplaod services 
exports.uploadServices = async (req, res) => {
  try {
    const { name, level } = req.body;
    const file = req.file;

    if (!name || !level || !file) {
      return res.status(422).json({
        errorCode: errorMessageConstants.BAD_REQUEST_ERROR_CODE,
        errorMessage: 'Name, level, and file are required',
      });
    }

    // Assuming the middleware uploads the file and sets the file URL in req.file.location
    const icon = file.location;

    // Save to database (assuming you have a Service model)
    const newService = new Service({
      name,
      level,
      icon,
    });

    await newService.save();

    res.status(201).json({
      success: true,
      message: 'Service uploaded successfully',
      data: newService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

//Reviews controller
// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const userId = req.params.id;
    const { search } = req.query;

    const filter = { isDeleted: false, reviewBy: userId };

    const reviews = await Review.find(filter)
      .populate("reviewBy", "firstName lastName")  
      .skip(skip)  
      .limit(limit)  
      .select("-__v")  
      .exec();

      if (search) {
        const regexPattern = new RegExp(search, "i");
        filter['reviewerName'] = { $regex: regexPattern };
      }

      const totalReviews = await Review.countDocuments(filter);
      const totalPages = Math.ceil(totalReviews / limit);
    if (!reviews || reviews.length === 0) {
      return res.json(createResponse.success({
      reviews: [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalReviews
      },
      message: "No reviews found"
      }));
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

//block user controller
// Get BlockedUser by ID
exports.getBlockedUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit , skip  } = req.pagination; 
    const {search}= req.query;
    console.log("id",id);
    // Validate the provided user ID
    const filter = { isDeleted: false, _id: id };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(
        createResponse.error({
          errorCode: "INVALID_ID",
          errorMessage: "The provided ID is not valid",
        })
      );
    }

    const user = await User.findOne(filter)
      .populate({
      path: 'blockedUsers',
      options: { skip, limit },
      populate: {
        path: 'basicInfo',
      },
      })
      .exec();

    if (search) {
      const regexPattern = new RegExp(search, "i");
      user.blockedUsers = user.blockedUsers.filter(blockedUser => regexPattern.test(blockedUser.basicInfo.username));
    }

    if (!user) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.NOT_FOUND_CODE,
        errorMessage: 'User not found',
      }));
    }

    const totalBlockedUsers = user.blockedUsers.length;
    const totalPages = Math.ceil(totalBlockedUsers / limit);

    res.json(createResponse.success({
      blockedUsers: user.blockedUsers,
      blockTiming: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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



//contact-us controller 
exports.contactUs = async (req, res) => {
  const { phone, email, message } = req.body;

  if (!phone || !email || !message) {
    return res.json(createResponse.invalid('Name, email, and message are required'));
  }

  try {
    // Send email to support
    const contactUsData = new ContactUs({ phone, email, message });
    await contactUsData.save();
    // Assuming you have a sendEmail function
    const mailData = {
      from: email,
      to: 'ekansh@cyberpointmedia.com',
      subject: 'Contact us message',
      text: message,
    };

    transporter.sendMail(mailData, (error) => {
      if (error) {
        console.error(error);
        return res.json(createResponse.error({
          errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
          errorMessage: 'An error occurred while sending the email',
        }));
      }
      res.json(createResponse.success('Your message has been sent successfully'));
    });
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: 'An error occurred while processing your request',
    }));
  }
};

