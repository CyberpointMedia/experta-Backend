const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const Device = require("../models/device.model");
const Notification = require("../models/notification.model");

exports.registerDevice = async (req, res) => {
  try {
    const { fcmToken, deviceInfo } = req.body;
    const userId = req.body.user._id;

    if (!fcmToken) {
      return res.json(createResponse.invalid("FCM token is required"));
    }

    const device = await Device.findOneAndUpdate(
      { user: userId, fcmToken , isDeleted: false},
      { 
        user: userId,
        fcmToken,
        deviceInfo,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(createResponse.success(device));
  } catch (error) {
    console.error("Error registering device:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.unregisterDevice = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.body.user._id;

    if (!fcmToken) {
      return res.json(createResponse.invalid("FCM token is required"));
    }

    await Device.deleteOne({ user: userId, fcmToken });
    res.json(createResponse.success({ message: "Device unregistered successfully" }));
  } catch (error) {
    console.error("Error unregistering device:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ recipient: userId , isDeleted: false})
      .populate("sender", "basicInfo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: userId });

    res.json(
      createResponse.success({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ isDeleted: false })
      .populate("sender", "basicInfo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ isDeleted: false });

    res.json(
      createResponse.success({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};



exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId , isDeleted: false},
      { read: true },
      { new: true }
    ).sort({ createdAt: -1 });

    if (!notification) {
      return res.json(
        createResponse.error({
          errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
          errorMessage: "Notification not found",
        })
      );
    }

    res.json(createResponse.success(notification));
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.body.user._id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.json(
      createResponse.success({ message: "All notifications marked as read" })
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.json(
      createResponse.error({
        errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
        errorMessage: error.message,
      })
    );
  }
};

exports.markNotificationReadByDashboardUser = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, isDeleted: false },
      { $set: { readByDashboardUser: userId } },
      { new: true }
    );

    if (!notification) {
      return res.json(createResponse.error({
        errorCode: errorMessageConstants.DATA_NOT_FOUND_ERROR_CODE,
        errorMessage: errorMessageConstants.DATA_NOT_FOUND,
      }));
    }

    res.json(createResponse.success(notification));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

exports.markAllNotificationsReadByDashboardUser = async (req, res) => {
  try {
    const userId = req.body.user._id;

    const result = await Notification.updateMany(
      { isDeleted: false , readByDashboardUser : null },
      { $set: { readByDashboardUser: userId } }
    );

    res.json(createResponse.success({
      message: 'All notifications marked as read by dashboard user',
      modifiedCount: result.nModified,
    }));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};