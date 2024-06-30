// controllers/chat.controller.js
const Message = require("../models/chat.model");

exports.sendMessage = async (req, res) => {
    console.log("jjj");
    const { receiver, message } = req.body;
    console.log("receiv88888er", receiver, message)
    const mediaUrl = req.file ? req.file.location : null;
    const mediaType = req.file ? req.file.mimetype.split("/")[0] : null;

    const newMessage = new Message({
        sender: req.body.user._id,
        receiver,
        message,
        mediaUrl,
        mediaType,
    });

    await newMessage.save();
    res.json(newMessage);
};

exports.getMessages = async (req, res) => {
    const { userId } = req.params;
    const messages = await Message.find({
        $or: [
            { sender: req.body.user._id, receiver: userId },
            { sender: userId, receiver: req.body.user._id },
        ],
    }).sort({ createdAt: 1 });

    res.json(messages);
};


exports.getConversations = async (req, res) => {
    const userId = req.body.user._id;
    const conversations = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender: userId },
                    { receiver: userId },
                ],
            },
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$sender", userId] },
                        "$receiver",
                        "$sender"
                    ]
                },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] },
                            1,
                            0
                        ]
                    }
                },
                lastMessage: { $last: "$$ROOT" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: "$userDetails"
        },
        {
            $project: {
                _id: 1,
                unreadCount: 1,
                lastMessage: 1,
                "userDetails.online": 1,
                "userDetails._id": 1
            }
        }
    ]);
    res.json(conversations);
};
