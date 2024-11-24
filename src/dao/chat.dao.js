// Just a regular method, NOT a route handler

const UserModel = require("../models/user.model");
module.exports.addNotification = async (notificationId, userId) => {
  let userData = { notifications: [] };
  try {
    if (!notificationId || !userId) {
      throw new Error("Invalid params for adding notification");
    }
    userData = await UserModel.findOneAndUpdate(
      {_id: userId, isDeleted: false},
      { $push: { notifications: notificationId } },
      { new: true }
    )
      .select("notifications")
      .populate({
        path: "notifications",
        model: "Message",
        populate: [
          {
            path: "sender",
            model: "User",
            select: "email phoneNo",
          },
          {
            path: "chat",
            model: "Chat",
            select: "-groupAdmins",
            populate: {
              path: "users",
              model: "User",
              select: "-notifications",
            },
          },
        ],
      });

    if (!userData) {
      throw new Error("User not found while adding notification");
    }
  } catch (error) {
    console.log(error.message);
  }
  return userData;
};

// Just a regular method, NOT a route handler
module.exports.deleteNotifOnMsgDelete = async (notificationId, userId) => {
  try {
    if (!notificationId || !userId) {
      throw new Error("Invalid params for deleting notification");
    }
    const userData = await UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $pull: { notifications: notificationId } },
      { new: true }
    );
    if (!userData) {
      throw new Error("User not found while deleting notification");
    }
    return userData;
  } catch (error) {
    console.log(error.message);
  }
};
