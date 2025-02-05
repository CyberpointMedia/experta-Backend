
const { Server } = require("socket.io");
const { addNotification, deleteNotifOnMsgDelete } = require("../dao/chat.dao");

const UserModel = require("../models/user.model");
const ChatModel = require("../models/chat.model");
const MessageModel = require("../models/message.model");
const { ObjectId } = require("mongodb");
exports.configureSocketEvents = (server) => {
  const io = new Server(server, {
    pingTimeout: 120000,
    cors: {
      origin: "*", // Replace with your client URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    // Initialize user
    socket.on("init_user", async (userId) => {
      socket.userId = userId;
      socket.join(userId);
      onlineUsers.add(userId);
      await UserModel.findOneAndUpdate(
        {_id:userId,isDeleted:false},
        { online: true },
        { new: true }
      );
      // await user.save();
      socket.broadcast.emit("getUserOnline", { userId });

      //   onlineUsers.add(userId);
      io.emit("user_connected", userId);
      console.log("user initialized: ", userId);
    });

    // Initialize chat
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat : ${chatId}`);
    });

    socket.on("fetch_chats", async (userId) => {
      try {
        const chats = await ChatModel.find({
          users: { $elemMatch: { $eq: userId } },
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
            select:
              "fileUrl file_id file_name content readBy createdAt updatedAt",
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

        socket.emit("chats_fetched", formattedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
        socket.emit("chats_fetch_error", { message: "Failed to fetch chats" });
      }
    });

    socket.on("new_chat_created", (newChat) => {
      newChat.users.forEach((userId) => {
        socket.to(userId).emit("chat_list_updated", newChat);
      });
    });

    socket.on("msg_deleted", async (deletedMsgData) => {
      const { deletedMsgId, senderId, chat } = deletedMsgData;
      if (!deletedMsgId || !senderId || !chat) return;

      await Promise.all(
        chat.users.map(async (user) => {
          if (user._id !== senderId) {
            await deleteNotifOnMsgDelete(deletedMsgId, user._id);
            socket.to(user._id).emit("remove_deleted_msg", deletedMsgData);
          }
        })
      );
    });

    socket.on("msg_updated", (updatedMsg) => {
      const { sender, chat } = updatedMsg;
      if (!sender || !chat) return;

      chat.users.forEach((userId) => {
        if (userId !== sender._id) {
          socket.to(userId).emit("update_modified_msg", updatedMsg);
        }
      });
    });

    // Group events
    socket.on("new_grp_created", (newGroupData) => {
      const { admin, newGroup } = newGroupData;
      if (!admin || !newGroup) return;

      newGroup.users.forEach((user) => {
        if (user._id !== admin._id) {
          socket.to(user._id).emit("display_new_grp");
        }
      });
    });

    socket.on("grp_updated", (updatedGroupData) => {
      const { updater, updatedGroup } = updatedGroupData;
      if (!updater || !updatedGroup) return;
      const { removedUser } = updatedGroup;

      updatedGroup.users.forEach((user) => {
        if (user._id !== updater._id) {
          socket.to(user._id).emit("display_updated_grp", updatedGroupData);
        }
      });
      if (removedUser) {
        socket
          .to(removedUser._id)
          .emit("display_updated_grp", updatedGroupData);
      }
    });

    socket.on("grp_deleted", (deletedGroupData) => {
      const { admin, deletedGroup } = deletedGroupData;
      if (!admin || !deletedGroup) return;

      deletedGroup.users.forEach((user) => {
        if (user._id !== admin._id) {
          socket.to(user._id).emit("remove_deleted_grp", deletedGroup);
        }
      });
    });

    socket.on("typing", (userId, typingUserId) => {
      // if (!userId || !typingUserId) return;
      console.log("userId, typingUserId--> ",userId, typingUserId);
        socket.emit("display_typing", userId, typingUserId);
        console.log("userId, typingUserId2--> ",userId, typingUserId);
    });

    socket.on("stop_typing", (userId, typingUserId) => {
      if (!userId || !typingUserId) return;
          socket.emit("hide_typing", userId, typingUserId);
    });

  socket.on("new_msg_sent", async (chat,sender,content,readBy,createdAt) => {
    // const { chat } = newMsg;
    console.log("chat,sender,content,readBy,createdAt",chat,sender,content,readBy,createdAt);
    if (!chat) {
      console.error("Invalid chat object received:", chat);
      return;
    }

    const chatUser = await ChatModel.findOne({ _id: chat, isDeleted: false });
    if (!chatUser) return;

    // Iterate through chat users and process individually
    for (const userId of chatUser.users) {
      const senderId = new ObjectId(sender._id);
      const areEqual = userId.equals(senderId);

      if (!areEqual) {
        const stringId = userId.toString();
        socket.to(stringId).emit("new_msg_received",chat,sender,content,readBy,createdAt);

        try {
          // Update unread count
          let updatedChat = await ChatModel.findOneAndUpdate(
            { _id: chat, "unreadCounts.user": userId , isDeleted: false },
            { $inc: { "unreadCounts.$.count": 1 } },
            { new: true, upsert: true }
          );
          console.log("updatedChat22211--> ", updatedChat);

          if (!updatedChat) {
            updatedChat = await ChatModel.findOneAndUpdate(
              { _id: chat, isDeleted: false},
              { $push: { unreadCounts: { user: userId, count: 1 } } },
              { new: true }
            );
            console.log("updatedChat2--> ", updatedChat);
          }

          if (updatedChat) {
            const userUnreadCountObj = updatedChat.unreadCounts.find(
              (count) => count.user.toString() === stringId
            );
            console.log("updatedChat3--> ", updatedChat);
            if (userUnreadCountObj) {
              console.log("updatedChat4--> ", updatedChat);
              socket.to(stringId).emit("update_unread_count", {
                chatId: chat,
                unreadCount: userUnreadCountObj.count,
              });
            }
          }
        } catch (error) {
          console.error("Error updating unread count:", error);
        }
      }
    }
  });

    socket.on("mark_messages_read", async ({ chatId, userId }) => {
      try {
        await MessageModel.updateMany(
          { chat: chatId, readBy: { $ne: userId , isDeleted: false } },
          { $addToSet: { readBy: userId } }
        );

        let updatedChat = await ChatModel.findOneAndUpdate(
          { _id: chatId, "unreadCounts.user": userId , isDeleted: false },
          { $set: { "unreadCounts.$.count": 0 } },
          { new: true }
        );

        if (!updatedChat) {
          updatedChat = await ChatModel.findOneAndUpdate(
            {_id:chatId, isDeleted: false},
            { $push: { unreadCounts: { user: userId, count: 0 } } },
            { new: true }
          );
        }

        if (updatedChat) {
          // Notify other users that messages have been read
          socket.to(chatId).emit("messages_marked_read", { chatId, userId });

          // Emit updated unread count to the user who marked messages as read
          socket.emit("update_unread_count", { chatId, unreadCount: 0 });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Disconnect event
    socket.on("disconnect", async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await UserModel.findOneAndUpdate(
          { _id: socket.userId, isDeleted: false },
          { online: false }
        );
        socket.broadcast.emit("getUserOffline", { userId: socket?.userId });
        io.emit("user_disconnected", socket.userId);
      }
      console.log("user disconnected");
    });
  });
};
