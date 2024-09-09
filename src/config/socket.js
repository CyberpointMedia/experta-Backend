// const { Server } = require("socket.io");
// const {
//   addNotification,
//   deleteNotifOnMsgDelete,
// } = require("../dao/chat.dao");
// const cors = require("cors");

// // Message event listeners
// configureMsgEvents = (socket) => {
//   socket.on("new_msg_sent", async (newMsg) => {
//     const { chat } = newMsg;
//     if (!chat) return;

//     await Promise.all(
//       chat.users.map(async (userId) => {
//         // Emit 'newMsg' to all other users except 'newMsg' sender
//         if (userId !== newMsg.sender._id) {
//           const { notifications } = await addNotification(newMsg._id, userId);
//           socket.to(userId).emit("new_msg_received", newMsg, notifications);
//         }
//       })
//     );
//   });

//   socket.on("msg_deleted", async (deletedMsgData) => {
//     const { deletedMsgId, senderId, chat } = deletedMsgData;
//     if (!deletedMsgId || !senderId || !chat) return;

//     // Emit a socket to delete 'deletedMsg' for all chat users
//     // except 'deletedMsg' sender
//     await Promise.all(
//       chat.users.map(async (user) => {
//         if (user._id !== senderId) {
//           await deleteNotifOnMsgDelete(deletedMsgId, user._id);
//           socket.to(user._id).emit("remove_deleted_msg", deletedMsgData);
//         }
//       })
//     );
//   });

//   socket.on("msg_updated", (updatedMsg) => {
//     const { sender, chat } = updatedMsg;
//     if (!sender || !chat) return;

//     chat.users.forEach((userId) => {
//       if (userId !== sender._id) {
//         socket.to(userId).emit("update_modified_msg", updatedMsg);
//       }
//     });
//   });
// };

// // Group event listeners
// const configureGroupEvents = (socket) => {
//   socket.on("new_grp_created", (newGroupData) => {
//     const { admin, newGroup } = newGroupData;
//     if (!admin || !newGroup) return;

//     newGroup.users.forEach((user) => {
//       if (user._id !== admin._id) {
//         socket.to(user._id).emit("display_new_grp");
//       }
//     });
//   });

//   socket.on("grp_updated", (updatedGroupData) => {
//     // 'updater' is the one who updated the grp (admin/non-admin)
//     const { updater, updatedGroup } = updatedGroupData;
//     if (!updater || !updatedGroup) return;
//     const { removedUser } = updatedGroup;

//     updatedGroup.users.forEach((user) => {
//       if (user._id !== updater._id) {
//         socket.to(user._id).emit("display_updated_grp", updatedGroupData);
//       }
//     });
//     if (removedUser) {
//       socket.to(removedUser._id).emit("display_updated_grp", updatedGroupData);
//     }
//   });

//   socket.on("grp_deleted", (deletedGroupData) => {
//     // 'admin' is the one who updated the grp
//     const { admin, deletedGroup } = deletedGroupData;
//     if (!admin || !deletedGroup) return;

//     deletedGroup.users.forEach((user) => {
//       if (user._id !== admin._id) {
//         socket.to(user._id).emit("remove_deleted_grp", deletedGroup);
//       }
//     });
//   });
// };

// // Typing event listeners
// const configureTypingEvents = (socket) => {
//   socket.on("typing", (chat, typingUser) => {
//     if (!chat || !typingUser) return;
//     chat.users?.forEach((user) => {
//       if (user?._id !== typingUser?._id) {
//         socket.to(user?._id).emit("display_typing", chat, typingUser);
//       }
//     });
//   });

//   socket.on("stop_typing", (chat, typingUser) => {
//     if (!chat || !typingUser) return;
//     chat.users?.forEach((user) => {
//       if (user?._id !== typingUser?._id) {
//         socket.to(user?._id).emit("hide_typing", chat, typingUser);
//       }
//     });
//   });
// };

// // Disconnect event listeners
// const configureDisconnectEvents = (socket) => {
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });

//   socket.off("init_user", (userId) => {
//     console.log("User socket disconnected");
//     socket.leave(userId);
//   });
// };

// exports.configureSocketEvents = (server) => {
//     console.log("server", server);
//   // Sockets setup
//   const io = new Server(server, {
//     pingTimeout: 120000,
//     cors: {
//       origin: "http://localhost:3000", // Replace with your client URL
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     // Initialize user
//     socket.on("init_user", (userId) => {
//       socket.join(userId);
//       socket.emit(`user_connected`);
//       console.log("user initialized: ", userId);
//     });

//     // Initialize chat
//     socket.on("join_chat", (chatId) => {
//       socket.join(chatId);
//       console.log(`User joined chat : ${chatId}`);
//     });

//     configureMsgEvents(socket);
//     configureGroupEvents(socket);
//     configureTypingEvents(socket);
//     configureDisconnectEvents(socket);
//   });
// };

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
        const user = await UserModel.findByIdAndUpdate(
          userId,
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

    // Message events
    // socket.on("new_msg_sent", async (newMsg) => {
    //   const { chat } = newMsg;
    //   if (!chat) return;

    //   await Promise.all(
    //     chat.users.map(async (userId) => {
    //       if (userId !== newMsg.sender.id) {
    //         // const { notifications } = await addNotification(newMsg.id, userId);
    //         socket.to(userId).emit("new_msg_received", newMsg);
    //       }
    //     })
    //   );
    // });

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

    // Typing events
    socket.on("typing", (chat, typingUser) => {
      if (!chat || !typingUser) return;
      chat.users?.forEach((user) => {
        if (user?._id !== typingUser?._id) {
          socket.to(user?._id).emit("display_typing", chat, typingUser);
        }
      });
    });

    socket.on("stop_typing", (chat, typingUser) => {
      if (!chat || !typingUser) return;
      chat.users?.forEach((user) => {
        if (user?._id !== typingUser?._id) {
          socket.to(user?._id).emit("hide_typing", chat, typingUser);
        }
      });
    });

    socket.on("new_msg_sent", async (newMsg) => {
      const { chat } = newMsg;
      if (!chat) {
        console.error("Invalid chat object received:", chat);
        return;
      }
      const chatUser = await ChatModel.findById(chat);
        if (!chatUser) return;
          await Promise.all(
            chatUser.users.map(async (userId) => {
            const senderId=  new ObjectId(newMsg.sender._id);
           const areEqual  = userId.equals(senderId);
              if (!areEqual) {
                socket.to(userId).emit("new_msg_received", newMsg);

                // Emit updated unread count
                try {
                  const updatedChat = await ChatModel.findById(chat._id);
                  if (updatedChat) {
                    const userUnreadCountObj = updatedChat.unreadCounts.find(
                      (count) => count.user.toString() === userId.toString()
                    );
                    if (userUnreadCountObj) {
                      const unreadCount = userUnreadCountObj.count;
                      socket.to(userId).emit("update_unread_count", {
                        chatId: chat._id,
                        unreadCount,
                      });
                    }
                  }
                } catch (error) {
                  console.error("Error updating unread count:", error);
                }
              }
            })
          );
    });

    socket.on("mark_messages_read", async ({ chatId, userId }) => {
      await MessageModel.updateMany(
        { chat: chatId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );

      // Reset unread count for this user in this chat
      await ChatModel.findByIdAndUpdate(
        chatId,
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
      socket.to(chatId).emit("messages_marked_read", { chatId, userId });
    });

    // Disconnect event
    socket.on("disconnect", async () => {
      if (socket.userId) {
         onlineUsers.delete(socket.userId);
          await UserModel.findByIdAndUpdate(socket.userId, { online: false });
        socket.broadcast.emit("getUserOffline", { userId: socket?.userId });
        io.emit("user_disconnected", socket.userId);
      }
      console.log("user disconnected");
    });
  });
};
