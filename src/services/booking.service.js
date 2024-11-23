// services/booking.service.js
const bookingDao = require("../dao/booking.dao");
const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const BookingNotificationService=require("./bookingNotification.service");
const Booking=require("../models/booking.model");
const User=require("../models/user.model");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getWalletBalance = async function (userId) {
  try {
    const user = await bookingDao.getUserById(userId);
    if (!user) {
      return createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: "User not found",
      });
    }
    return createResponse.success({ balance: user.wallet.balance });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getBookingsAsClient = async function (userId, filters) {
  try {
    const bookings = await bookingDao.getBookingsAsClient(userId, filters);
    return createResponse.success(bookings);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.getBookingsAsExpert = async function (userId, filters) {
  try {
    const bookings = await bookingDao.getBookingsAsExpert(userId, filters);
    return createResponse.success(bookings);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.createRazorpayOrder = async function (userId, amount) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `${userId}_${Date.now()}`
    });

    const transaction = await bookingDao.createPaymentTransaction({
      user: userId,
      amount,
      type: "deposit",
      paymentMethod: "razorpay",
      razorpayDetails: {
        orderId: order.id
      }
    });

    return createResponse.success({ order, transactionId: transaction._id });
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};


exports.updateBookingStatus = async function (bookingId, status, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await bookingDao.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error("Booking not found");
    }
    const previousStatus=booking?.status;

    if (booking.expert._id.toString() !== userId) {
      throw new Error("Not authorized to update this booking");
    }

    if (status === 'accepted') {
      booking.status = 'accepted';
      await booking.save({ session });
      const endTime = new Date(booking.endTime);
            const now = new Date();
            if (endTime > now) {
                const delay = endTime.getTime() - now.getTime();
                setTimeout(async () => {
                    const updatedBooking = await bookingDao.getBookingById(bookingId);
                    if (updatedBooking && updatedBooking.status === 'accepted') {
                        updatedBooking.status = 'completed';
                        await updatedBooking.save();
                        await BookingNotificationService.notifyBookingStatusUpdate(
                            updatedBooking,
                            'accepted'
                        );
                    }
                }, delay);
            }

    } else if (status === 'rejected') {
      // Create refund transaction
      await bookingDao.createCoinTransaction({
        sender: booking.expert,
        receiver: booking.client,
        amount: booking.price,
        type: "refund",
        relatedBooking: booking._id,
        description: "Booking rejected - refund"
      }, session);

      // Update wallets
      await Promise.all([
        bookingDao.updateUserWallet(booking.expert, -booking.price, session),
        bookingDao.updateUserWallet(booking.client, booking.price, session)
      ]);

      booking.status = 'rejected';
      await booking.save({ session });
      await BookingNotificationService.notifyPaymentUpdate(booking, 'refund');
    }
    await BookingNotificationService.notifyBookingStatusUpdate(booking, previousStatus);
    await session.commitTransaction();
    return createResponse.success(booking);


  } catch (error) {
    await session.abortTransaction();
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getTransactionHistory = async function (userId, filters) {
  try {
    const transactions = await bookingDao.getFilteredTransactions(userId, filters);
    return createResponse.success(transactions);
  } catch (error) {
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};





exports.verifyPayment = async function (userId, paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId
    } = paymentData;

    // Get the transaction first
    const transaction = await bookingDao.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.user.toString() !== userId) {
      throw new Error("Unauthorized to verify this payment");
    }

    if (transaction.status !== 'pending') {
      throw new Error("Transaction is no longer pending");
    }

    // Verify payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      transaction.status = 'failed';
      await transaction.save({ session });
      throw new Error("Invalid payment signature");
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.razorpayDetails = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    };
    await transaction.save({ session });

    // Add amount to user's wallet
    await bookingDao.updateUserWallet(userId, transaction.amount, session);

    if (transaction.status === 'completed') {
      const booking = await bookingDao.getBookingById(transaction.relatedBooking);
      if (booking) {
          await BookingNotificationService.notifyPaymentUpdate(booking, 'payment');
      }
  }

    await session.commitTransaction();
    return createResponse.success({
      message: "Payment verified successfully",
      transaction
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};


exports.createBooking = async function (clientId, expertId, startTime, endTime, type) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get client and expert details
    const [client, expert] = await Promise.all([
      bookingDao.getUserById(clientId),
      bookingDao.getUserById(expertId)
    ]);

    if (!client || !expert) {
      throw new Error("User not found");
    }

    // 2. Validate expert's pricing
    if (!expert.pricing) {
      throw new Error("Expert has not set their pricing");
    }


    console.log("expert--> ",expert);
    // 3. Get pricing based on booking type
    let price;
    if (type === 'audio') {
      price = expert.pricing.audioCallPrice;
    } else if (type === 'video') {
      price = expert.pricing.videoCallPrice;
    } else if (type === 'message') {
      price = expert.pricing.messagePrice;
    } else {
      throw new Error("Invalid booking type");
    }

    if (!price) {
      throw new Error(`Expert hasn't set pricing for ${type} bookings`);
    }

    // 4. Check client's wallet balance
    if (!client.wallet || client.wallet.balance < price) {
      throw new Error("Insufficient balance");
    }

    // 5. Validate booking time
    const bookingStart = new Date(startTime);
    const bookingEnd = new Date(endTime);
    
    if (bookingStart >= bookingEnd) {
      throw new Error("Invalid booking time range");
    }

    const now = new Date();
    if (bookingStart <= now) {
      throw new Error("Booking cannot be in the past");
    }

    // 6. Calculate duration in minutes
    const duration = Math.round((bookingEnd - bookingStart) / (1000 * 60));

    // 7. Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      expert: expertId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: bookingEnd },
          endTime: { $gt: bookingStart }
        }
      ]
    });



    if (conflictingBooking) {
      throw new Error(errorMessageConstants.BOOKING_CONFLICT_MESSAGE);
    }

    // 8. Create booking
    const booking = await bookingDao.createBooking(
      clientId,
      expertId,
      startTime,
      endTime,
      type,
      price,
      duration
    );

    // 9. Create coin transaction for booking payment
    await bookingDao.createCoinTransaction({
      sender: clientId,
      receiver: expertId,
      amount: price,
      type: "booking_payment",
      relatedBooking: booking._id,
      description: `Payment for ${type} booking`
    }, session);

    // 10. Update wallets
    await Promise.all([
      bookingDao.updateUserWallet(clientId, -price, session),
      bookingDao.updateUserWallet(expertId, price, session)
    ]);

    // 11. Update expert's booking count
    await User.findByIdAndUpdate(expertId, { $inc: { noOfBooking: 1 } }, { session });

    const bookingStartTime = new Date(startTime);
    const reminderTime = new Date(bookingStartTime.getTime() - 15 * 60000); // 15 minutes before
    if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();
        setTimeout(async () => {
            await BookingNotificationService.notifyUpcomingBooking(booking);
        }, delay);
    }

    // Send immediate notification about booking creation
    await BookingNotificationService.notifyBookingCreated(booking);
    
    // If successful payment, notify about payment
    await BookingNotificationService.notifyPaymentUpdate(booking, 'payment');

    await session.commitTransaction();
    return createResponse.success(booking);

  } catch (error) {
    await session.abortTransaction();
    console.error("Error:", error);
    return createResponse.error({
      errorCode: 
        error.message === errorMessageConstants.BOOKING_CONFLICT_MESSAGE
          ? errorMessageConstants.BOOKING_CONFLICT
          : errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};


exports.initiateUPIPayment = async function(userId, amount, vpa) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await bookingDao.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const transaction = await bookingDao.createUPITransaction({
      user: userId,
      amount,
      type: "deposit",
      status: "pending",
      upiDetails: { vpa }
    }, session);

    // Generate UPI payment link using Razorpay
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      reference_id: transaction._id.toString(),
      description: "Add money to wallet",
      customer: {
        name: user.basicInfo?.firstName || "User",
        email: user.email,
        contact: user.phoneNo
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      upi_link: true,
      upi: {
        vpa: vpa
      }
    });

    await session.commitTransaction();
    return createResponse.success({ 
      transaction, 
      paymentLink: paymentLink.short_url 
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error initiating UPI payment:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    });
  } finally {
    session.endSession();
  }
};

// Add UPI verification endpoint
exports.verifyUPIPayment = async function(userId, transactionId, utrNumber) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await bookingDao.getTransactionById(transactionId);
    if (!transaction || transaction.user.toString() !== userId) {
      throw new Error("Invalid transaction");
    }

    await bookingDao.updateUPITransaction(transactionId, {
      ...transaction.upiDetails,
      utrNumber
    }, session);

    await bookingDao.updateUserWallet(userId, transaction.amount, session);

    await session.commitTransaction();
    
    await BookingNotificationService.notifyPaymentUpdate({
      user: userId,
      type: 'upi_success',
      price: transaction.amount
    }, 'payment');

    return createResponse.success({ message: "UPI payment verified" });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


exports.initiateWithdrawal = async function (userId, amount, paymentDetails) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate user and check wallet balance
    const user = await bookingDao.getUserWithBalance(userId, session);
    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.wallet || user.wallet.balance < amount) {
      throw new Error("Insufficient wallet balance.");
    }

    // Validate payment details
    if (!paymentDetails || (!paymentDetails.vpa && !paymentDetails.accountNumber)) {
      throw new Error("Invalid payment details.");
    }

    // Check withdrawal limits
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const withdrawalSummary = await bookingDao.getWithdrawalsSummary(
      userId,
      startOfDay,
      endOfDay
    );

    const DAILY_WITHDRAWAL_LIMIT = 50000;
    const DAILY_WITHDRAWAL_COUNT = 3;

    if (withdrawalSummary.totalAmount + amount > DAILY_WITHDRAWAL_LIMIT) {
      throw new Error("Daily withdrawal limit exceeded.");
    }

    if (withdrawalSummary.count >= DAILY_WITHDRAWAL_COUNT) {
      throw new Error("Maximum daily withdrawal count reached.");
    }

    // Create a withdrawal transaction
    const transactionData = {
      user: userId,
      amount,
      type: "withdrawal",
      status: "pending",
      paymentMethod: paymentDetails.vpa ? "upi" : "bank",
      paymentDetails,
    };

    const transaction = await bookingDao.createPayoutTransaction(transactionData, session);

    // Create a fund account for the user
    const fundAccountData = {
      account_type: paymentDetails.vpa ? "vpa" : "bank_account",
      ...(paymentDetails.vpa
        ? { vpa: { address: paymentDetails.vpa } }
        : {
            bank_account: {
              name: paymentDetails.accountName,
              ifsc: paymentDetails.ifsc,
              account_number: paymentDetails.accountNumber,
            },
          }),
      contact: {
        name: user.basicInfo?.firstName || "User",
        email: user.email,
        contact: user.phoneNo,
        type: "self",
      },
    };

    const fundAccount = await razorpay.fundAccount.create(fundAccountData);

    // Create a payout using the fund account
    const payoutData = {
      account_number: "Your_Razorpay_Account_Number", // Razorpay's virtual account number
      fund_account_id: fundAccount.id,
      amount: amount * 100, // Razorpay expects amounts in paise
      currency: "INR",
      mode: paymentDetails.vpa ? "UPI" : "IMPS",
      purpose: "withdrawal",
      queue_if_low_balance: true,
      reference_id: transaction._id.toString(),
      narration: "Withdrawal Payout",
    };

    const payout = await razorpay.payouts.create(payoutData);

    // Update the transaction with Razorpay payout ID
    await bookingDao.updateTransactionStatus(
      transaction._id,
      { "razorpayDetails.payoutId": payout.id, status: "in_progress" },
      session
    );

    // Deduct the amount from the user's wallet
    await bookingDao.updateUserWalletForWithdrawal(userId, amount, session);

    await session.commitTransaction();

    return createResponse.success({
      message: "Withdrawal initiated successfully.",
      transaction,
      payout,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error initiating withdrawal:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getWithdrawalStatus = async function (userId, withdrawalId) {
  try {
    const transaction = await bookingDao.getUserWithdrawalTransaction(userId, withdrawalId);

    if (!transaction) {
      throw new Error("Withdrawal transaction not found.");
    }

    if (transaction.razorpayDetails?.payoutId) {
      const payout = await razorpay.payouts.fetch(transaction.razorpayDetails.payoutId);

      if (payout.status !== transaction.razorpayDetails.status) {
        const updateData = {
          "razorpayDetails.status": payout.status,
        };

        if (payout.status === "processed") {
          updateData.status = "completed";
        } else if (payout.status === "failed") {
          updateData.status = "failed";

          // Refund the amount to the user's wallet
          await bookingDao.refundFailedWithdrawal(userId, transaction.amount);
        }

        await bookingDao.updateTransactionStatus(transaction._id, updateData);
      }
    }

    return createResponse.success(transaction);
  } catch (error) {
    console.error("Error checking withdrawal status:", error);
    return createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    });
  }
};

exports.checkWithdrawalStatus = async function (withdrawalId) {
  try {
    const transaction = await transactionDao.getWithdrawalTransactionById(withdrawalId);
    if (!transaction) {
      throw new Error("Withdrawal transaction not found");
    }

    const payoutId = transaction?.razorpayDetails?.payoutId;
    if (!payoutId) {
      throw new Error("Razorpay payout ID not found");
    }

    const payoutStatus = await razorpay.payouts.fetch(payoutId);

    // Update transaction if status has changed
    if (payoutStatus.status !== transaction.razorpayDetails.status) {
      const updatedTransaction = await transactionDao.updateWithdrawalTransaction(
        transaction._id,
        { "razorpayDetails.status": payoutStatus.status }
      );

      if (payoutStatus.status === "processed") {
        updatedTransaction.status = "completed";
      } else if (payoutStatus.status === "failed") {
        await transactionDao.updateUserWalletBalance(
          transaction.user,
          transaction.amount
        );
        updatedTransaction.status = "failed";
      }

      return { success: true, transaction: updatedTransaction };
    }

    return { success: true, transaction };
  } catch (error) {
    throw new Error(error.message || "Failed to check withdrawal status");
  }
};
