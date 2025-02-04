// Add new notification types to notification.model.js first
const mongoose = require("mongoose");
const FCMService = require("../utils/fcm.utils");

class BookingNotificationService {
    static async notifyBookingCreated(booking) {
        try {
            // Notify expert about new booking request
            await FCMService.sendToUser(booking.expert, {
                type: "BOOKING_REQUEST",
                title: `📅New ${booking.type} Booking Request`,
                body: `A new ${booking.type} booking request has been received. Please review it.`,
                sender: booking.client,
                data: {
                    bookingId: booking._id.toString(),
                    type: booking.type,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    price: booking.price
                }
            });
        } catch (error) {
            console.error("Error sending booking creation notification:", error);
            // Don't throw - notifications shouldn't break the booking flow
        }
    }

    static async notifyBookingStatusUpdate(booking, previousStatus) {
        try {
            const messages = {
                accepted: {
                    title: "📅 Booking Accepted",
                    body: `Your ${booking.type} booking has been accepted by the expert`
                },
                rejected: {
                    title: "📅 Booking Rejected",
                    body: `Your ${booking.type} booking was declined. Your coins have been refunded.`
                },
                completed: {
                    title: "📅 Booking Completed",
                    body: `Your ${booking.type} session has been completed`
                },
                cancelled: {
                    title: "📅 Booking Cancelled",
                    body: `Your ${booking.type} booking has been cancelled`
                }
            };

            const message = messages[booking.status];
            if (!message) return;

            // Notify client about status change
            await FCMService.sendToUser(booking.client, {
                type: "BOOKING_STATUS",
                title: message.title,
                body: message.body,
                sender: booking.expert,
                data: {
                    bookingId: booking._id.toString(),
                    previousStatus,
                    currentStatus: booking.status,
                    type: booking.type
                }
            });

            // For completion, notify expert as well
            if (booking.status === 'completed') {
                await FCMService.sendToUser(booking.expert, {
                    type: "BOOKING_STATUS",
                    title: "Session Completed",
                    body: `Your ${booking.type} session has been completed`,
                    sender: booking.client,
                    data: {
                        bookingId: booking._id.toString(),
                        type: booking.type
                    }
                });
            }
        } catch (error) {
            console.error("Error sending booking status notification:", error);
        }
    }

    static async notifyUpcomingBooking(booking) {
        try {
            // Notify both parties 15 minutes before the booking
            const message = {
                type: "BOOKING_REMINDER",
                title: "📅 Upcoming Session",
                body: `Your ${booking.type} session starts in 15 minutes`,
                data: {
                    bookingId: booking._id.toString(),
                    type: booking.type,
                    startTime: booking.startTime
                }
            };

            // Send to both expert and client
            await Promise.all([
                FCMService.sendToUser(booking.expert, {
                    ...message,
                    sender: booking.client
                }),
                FCMService.sendToUser(booking.client, {
                    ...message,
                    sender: booking.expert
                })
            ]);
        } catch (error) {
            console.error("Error sending upcoming booking notification:", error);
        }
    }

    static async notifyPaymentUpdate(booking, transactionType) {
        try {
            const messages = {
                payment: {
                    title: "💳 Payment Received",
                    body: `Payment received for ${booking.type} booking`
                },
                refund: {
                    title: "💳 Refund Processed",
                    body: `Refund processed for cancelled ${booking.type} booking`
                }
            };

            const message = messages[transactionType];
            if (!message) return;

            // Notify client about payment update
            await FCMService.sendToUser(booking.client, {
                type: "BOOKING_PAYMENT",
                title: message.title,
                body: message.body,
                sender: booking.expert,
                data: {
                    bookingId: booking._id.toString(),
                    transactionType,
                    amount: booking.price
                }
            });

            // Also notify expert about payment
            if (transactionType === 'payment') {
                await FCMService.sendToUser(booking.expert, {
                    type: "BOOKING_PAYMENT",
                    title: "💳 Payment Received",
                    body: `You’ve successfully received payment for your ${booking.type} booking`,
                    sender: booking.client,
                    data: {
                        bookingId: booking._id.toString(),
                        transactionType,
                        amount: booking.price
                    }
                });
            }
        } catch (error) {
            console.error("Error sending payment notification:", error);
        }
    }
}

module.exports = BookingNotificationService;