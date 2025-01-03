const ChatModel = require("../models/chat.model.js");

const asyncHandler = require("express-async-handler");
const MessageModel = require("../models/message.model.js");

const { deleteFile } = require("../utils/aws.utlis.js");

exports.createOrRetrieveChat = asyncHandler(async (req, res) => {
  const receiverUserId = req.body?.userId;
  const loggedInUserId = req.body.user._id;
  console.log("receiverUserId", req.body.user);

  if (!receiverUserId) {
    res.status(400);
    throw new Error("UserId not sent in request body");
  }

  // First check if a chat exists with the above users
  const existingChats = await ChatModel.find({
    $and: [
      { isGroupChat: false },
      { users: { $elemMatch: { $eq: receiverUserId } } },
      { users: { $elemMatch: { $eq: loggedInUserId } } },
      { isDeleted: false }
    ],
  })
    .populate({
      path: "users",
      select: "email phoneNo online basicInfo isVerified",
      populate: {
        path: "basicInfo",
        select: "firstName lastName displayName profilePic",
      },
    })
    .populate({
      path: "lastMessage",
      select: "fileUrl file_id file_name content readBy createdAt updatedAt",
      populate: {
        path: "sender",
        select: "email phoneNo online basicInfo",
        populate: {
          path: "basicInfo",
          select: "firstName lastName displayName profilePic",
        },
      },
    })
    .select("-groupAdmins")
    .lean()
    .sort({ updatedAt: "desc" });

  if (existingChats.length > 0) {
    const chats = existingChats[0];
    const formattedChats = {
      _id: chats._id,
      chatName: chats.chatName,
      users: chats.users.map((user) => ({
        _id: user._id,
        email: user.email,
        phoneNo: user.phoneNo,
        basicInfo: user.basicInfo,
        online: user.online,
      })),
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      __v: chats.__v,
      lastMessage: chats.lastMessage
        ? {
          _id: chats.lastMessage._id,
          fileUrl: chats.lastMessage.fileUrl,
          file_id: chats.lastMessage.file_id,
          file_name: chats.lastMessage.file_name,
          content: chats.lastMessage.content,
          readBy: chats.lastMessage.readBy,
          time: new Date(chats.lastMessage.createdAt).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          ),
          createdAt: chats.lastMessage.createdAt,
          updatedAt: chats.lastMessage.updatedAt,
          __v: chats.lastMessage.__v,
        }
        : null,
      unreadCounts: chats.unreadCounts || [],
    };
    res.status(200).json(formattedChats);
  } else {
    // If it doesn't exist, then create a new chat
    const createdChat = await ChatModel.create({
      chatName: "reciever",
      isGroupChat: false,
      users: [receiverUserId, loggedInUserId],
    });

    const chats = await ChatModel.findOne({ _id: createdChat._id, isDeleted: false })
      .populate({
        path: "users",
        select: "email phoneNo online basicInfo isVerified",
        populate: {
          path: "basicInfo",
          select: "firstName lastName displayName profilePic",
        },
      })
      .populate({
        path: "lastMessage",
        select: "fileUrl file_id file_name content readBy createdAt updatedAt",
        populate: {
          path: "sender",
          select: "email phoneNo online basicInfo",
          populate: {
            path: "basicInfo",
            select: "firstName lastName displayName profilePic",
          },
        },
      })
      .select("-groupAdmins")
      .lean()
      .sort({ updatedAt: "desc" });
    console.log("populatedChat", chats);
    const formattedChats = {
      _id: chats._id,
      chatName: chats.chatName,
      users: chats.users.map((user) => ({
        _id: user._id,
        email: user.email,
        phoneNo: user.phoneNo,
        basicInfo: user.basicInfo,
        online: user.online,
      })),
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      __v: chats.__v,
      lastMessage: chats.lastMessage
        ? {
          _id: chats.lastMessage._id,
          fileUrl: chats.lastMessage.fileUrl,
          file_id: chats.lastMessage.file_id,
          file_name: chats.lastMessage.file_name,
          content: chats.lastMessage.content,
          readBy: chats.lastMessage.readBy,
          time: new Date(chats.lastMessage.createdAt).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          ),
          createdAt: chats.lastMessage.createdAt,
          updatedAt: chats.lastMessage.updatedAt,
          __v: chats.lastMessage.__v,
        }
        : null,
      unreadCounts: chats.unreadCounts || [],
    };
    console.log("formattedChats", formattedChats);
    res.status(201).json(formattedChats);
    req.app.get("io").emit("new_chat_created", formattedChats);
    return;
  }
});

exports.fetchChats = asyncHandler(async (req, res) => {
  const loggedInUserId = req.body.user._id;

  const chats = await ChatModel.find({
    users: { $elemMatch: { $eq: loggedInUserId } },
    isDeleted: false
  })
    .populate({
      path: "users",
      select: "email phoneNo online basicInfo isVerified",
      populate: {
        path: "basicInfo",
        select: "firstName lastName displayName profilePic",
      },
    })
    .populate({
      path: "lastMessage",
      select: "fileUrl file_id file_name content readBy createdAt updatedAt",
      populate: {
        path: "sender",
        select: "email phoneNo online basicInfo",
        populate: {
          path: "basicInfo",
          select: "firstName lastName displayName profilePic",
        },
      },
    })
    .select("-groupAdmins")
    .lean()
    .sort({ updatedAt: "desc" });

  const formattedChats = chats.map((chat) => ({
    _id: chat._id,
    chatName: chat.chatName,
    users: chat.users.map((user) => ({
      _id: user._id,
      email: user.email,
      phoneNo: user.phoneNo,
      basicInfo: user.basicInfo,
      online: user.online,
    })),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    __v: chat.__v,
    lastMessage: chat.lastMessage
      ? {
        _id: chat.lastMessage._id,
        fileUrl: chat.lastMessage.fileUrl,
        file_id: chat.lastMessage.file_id,
        file_name: chat.lastMessage.file_name,
        content: chat.lastMessage.content,
        readBy: chat.lastMessage.readBy,
        time: new Date(chat.lastMessage.createdAt).toLocaleTimeString(
          "en-US",
          { hour: "2-digit", minute: "2-digit" }
        ),
        createdAt: chat.lastMessage.createdAt,
        updatedAt: chat.lastMessage.updatedAt,
        __v: chat.lastMessage.__v,
      }
      : null,
    unreadCounts: chat.unreadCounts || [],
  }));

  res.status(200).json(formattedChats);
});

exports.fetchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400);
    throw new Error("Invalid chatId for fetching messages");
  }
  const messages = await MessageModel.find({ chat: chatId, isDeleted: false })
    .populate({
      path: "sender",
      model: "User",
      select: "email phoneNo online basicInfo", // Select only required fields
      populate: {
        path: "basicInfo",
        select: "firstName lastName displayName profilePic", // Select only required fields
      },
    })
    .select("-chat.groupAdmins") // Remove any unnecessary fields
    .lean()
    .sort({ createdAt: "desc" });
  // Latest to oldest here, but oldest to latest in frontend
  // as it's 'd-flex flex-column-reverse' for msg list
  res.status(200).json(messages);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const attachment = req?.file;
  const { content, chatId, mediaDuration } = req.body;
  const loggedInUser = req.body.user._id;

  if ((!content && !attachment) || !chatId) {
    res.status(400);
    throw new Error("Invalid request params for sending a message");
  }

  let attachmentData;
  if (!attachment) {
    attachmentData = {
      fileUrl: null,
      file_id: null,
      file_name: null,
    };
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp)$/.test(attachment.originalname) // remove this condition
  ) {
    attachmentData = {
      fileUrl: attachment.location || "",
      file_id: attachment.key || "",
      file_name: attachment.originalname,
    };
  } else {
    // For any other file type, it's uploaded via uploadToS3 middleware
    attachmentData = {
      fileUrl: attachment.location || "",
      file_id: attachment.key || "",
      file_name:
        attachment.originalname +
        "===" +
        (mediaDuration !== "undefined"
          ? `${mediaDuration}+++${attachment.size}`
          : attachment.size),
    };
  }

  const createdMessage = await MessageModel.create({
    sender: loggedInUser,
    ...attachmentData,
    content: content || "",
    chat: chatId,
    readBy: [loggedInUser], // Mark as read by sender
  });

  if (!createdMessage) {
    res.status(404);
    throw new Error("Message not found");
  }
  const chat = await ChatModel.findOne({ _id: chatId, isDeleted: false });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  chat.unreadCounts.forEach((item) => {
    if (item.user.toString() !== loggedInUser.toString()) {
      item.count += 1;
    }
  });

  await chat.save();

  // Update the lastMessage of current chat with newly created message
  const updateChatPromise = ChatModel.findOneAndUpdate(
    { _id: chatId, isDeleted: false },
    {
      lastMessage: createdMessage._id,
    });

  const populatedMsgPromise = MessageModel.findOne({ _id: createdMessage._id, isDeleted: false })
    .populate({
      path: "sender",
      model: "User",
      select: "email phoneNo online basicInfo", // Select only required fields
      populate: {
        path: "basicInfo",
        select: "firstName lastName displayName profilePic", // Select only required fields
      },
    })
    .select("-chat.groupAdmins") // Remove any unnecessary fields
    .lean();
  // Parallel execution of independent promises
  const [updatedChat, populatedMessage] = await Promise.all([
    updateChatPromise,
    populatedMsgPromise,
  ]);

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found while updating lastMessage");
  }

  res.status(201).json(populatedMessage);
});

const updateMessage = asyncHandler(async (req, res) => {
  const updatedAttachment = req.file;
  const { msgFileRemoved, mediaDuration, updatedContent, messageId } = req.body;
  const fileRemoved = msgFileRemoved === "true";

  if (!messageId) {
    res.status(404);
    throw new Error("Invalid Message Id");
  }
  const existingMessage = await MessageModel.findOne({_id:messageId, isDeleted: false});

  if (!existingMessage) {
    res.status(404);
    throw new Error("Message not found");
  }

  const { file_id, fileUrl, file_name } = existingMessage;
  let attachmentData = { fileUrl, file_id, file_name };

  if (!(updatedAttachment || (file_id && !fileRemoved)) && !updatedContent) {
    res.status(400);
    throw new Error(
      "A Message Must Contain Either a File or some Text Content"
    );
  }

  if (!updatedAttachment) {
    // Attachment already exists but deleted by user while updating
    if (file_id && fileRemoved) {
      deleteExistingAttachment(fileUrl, file_id);
      attachmentData = {
        fileUrl: null,
        file_id: null,
        file_name: null,
      };
    }
  } else if (
    /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp)$/.test(
      updatedAttachment.originalname
    )
  ) {
    // Updated attachment is of type : image/gif
    if (file_id) deleteExistingAttachment(fileUrl, file_id);

    // Upload updated attachment to cloudinary and then delete from server
    const uploadResponse = await cloudinary.uploader.upload(
      updatedAttachment.path
    );
    attachmentData = {
      fileUrl: uploadResponse.secure_url,
      file_id: uploadResponse.public_id,
      file_name: updatedAttachment.originalname,
    };
    deleteFile(updatedAttachment.path);
  } else {
    // For any other file type, it's uploaded via uploadToS3 middleware
    attachmentData = {
      fileUrl: updatedAttachment.location || "",
      file_id: updatedAttachment.key || "",
      file_name:
        updatedAttachment.originalname +
        "===" +
        (mediaDuration !== "undefined"
          ? `${mediaDuration}+++${updatedAttachment.size}`
          : updatedAttachment.size),
    };
    if (file_id) deleteExistingAttachment(fileUrl, file_id);
  }

  const updatedMessage = await MessageModel.findOneAndUpdate(
    {_id:messageId, isDeleted: false},
    { ...attachmentData, content: updatedContent || "" },
    { new: true }
  )
    .populate({
      path: "sender",
      model: "User",
      select: "name email profilePic",
    })
    .populate({
      path: "chat",
      model: "Chat",
      select: "-groupAdmins -cloudinary_id",
    });

  if (!updatedMessage) {
    res.status(404);
    throw new Error("Updated message not found");
  }
  res.status(200).json(updatedMessage);
});

const deleteMessages = asyncHandler(async (req, res) => {
  let { messageIds, isDeleteGroupRequest } = req.body;
  messageIds = JSON.parse(messageIds);

  if (!messageIds?.length) {
    res.status(400);
    throw new Error("Invalid messageIds for deleting message/s");
  }
  const resolvedMessage = "Successfully Deleted a Message";

  // Deleting each message attachment, message in parallel
  await Promise.all(
    messageIds.map(async (msgId) => {
      const existingMessage = await MessageModel.findOne({_id:msgId, isDeleted: false});

      if (!existingMessage) {
        res.status(404);
        throw new Error("Message to be deleted not found");
      }
      const { file_id, fileUrl } = existingMessage;

      if (file_id) deleteExistingAttachment(fileUrl, file_id);

      const deletedMessage = await MessageModel.findOneAndDelete({_id:msgId, isDeleted: false})
        .populate({
          path: "sender",
          model: "User",
          select: "name email",
        })
        .populate({
          path: "chat",
          model: "Chat",
        });

      // If deleted message is the last message of current chat
      if (
        !isDeleteGroupRequest &&
        JSON.stringify(msgId) ===
        JSON.stringify(deletedMessage.chat.lastMessage)
      ) {
        // Retrive the previous message
        const latestMessages = await MessageModel.find({
          chat: deletedMessage.chat._id,
          isDeleted: false,
        }).sort({ createdAt: "desc" }); // (latest to oldest)

        // If there's no previous message, don't update lastMessage
        if (latestMessages.length === 0) return resolvedMessage;

        // Since lastMessage was deleted, previousMessage is the latest
        const previousMessage = latestMessages[0];

        // Update the lastMessage of current chat with previous message
        const updatedChat = await ChatModel.findOneAndUpdate(
          { _id: deletedMessage.chat._id, isDeleted: false },
          { lastMessage: previousMessage._id },
          { new: true }
        );

        if (!updatedChat) {
          res.status(404);
          throw new Error("Chat not found while updating lastMessage");
        }
      }
      return resolvedMessage;
    })
  );
  res.status(200).json({ status: "Message/s Deleted Successfully" });
});

const accessAttachment = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const params = { Bucket: s3_bucket, Key: filename };
  const fileObj = await s3.getObject(params).promise();
  res.status(200).send(fileObj.Body);
});

exports.markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.body.user._id;

  // Mark all messages in the chat as read by this user
  await MessageModel.updateMany(
    { chat: chatId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  // Reset unread count for this user in this chat
  await ChatModel.findOneAndUpdate(
    {_id:chatId,isDeleted: false},
    {
      $set: {
        "unreadCounts.$[elem].count": 0,
      },
    },
    {
      arrayFilters: [{ "elem.user": userId }],
      new: true,
    }
  );

  res.status(200).json({ message: "Messages marked as read" });
});
