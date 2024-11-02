const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "POST_LIKE",
                "POST_COMMENT",
                "FOLLOW",
                "BOOKING_REQUEST",     
                "BOOKING_STATUS",      
                "BOOKING_REMINDER",    
                "BOOKING_PAYMENT",     
                "BOOKING_CANCELLED",   
                "CHAT_MESSAGE"
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
        },
        read: {
            type: Boolean,
            default: false,
        },
        clicked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);