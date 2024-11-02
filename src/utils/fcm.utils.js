const admin = require("firebase-admin");
const Device = require("../models/device.model");
const Notification = require("../models/notification.model");

// Initialize Firebase Admin with your service account
const serviceAccount = require("../config/firebase-service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class FCMService {
  static async sendToDevice(fcmToken, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error("Error sending FCM notification:", error);
      if (error.code === "messaging/registration-token-not-registered") {
        // Remove invalid token
        await Device.deleteOne({ fcmToken });
      }
      throw error;
    }
  }

  static async sendToUser(userId, notificationData) {
    try {
      // Create notification record
      const notification = new Notification({
        recipient: userId,
        ...notificationData,
      });
      await notification.save();

      // Get all user devices
      const devices = await Device.find({ user: userId });
      
      const sendPromises = devices.map((device) =>
        this.sendToDevice(device.fcmToken, {
          title: notificationData.title,
          body: notificationData.body,
        }, {
          type: notificationData.type,
          notificationId: notification._id.toString(),
          ...notificationData.data,
        })
      );

      await Promise.allSettled(sendPromises);
      return notification;
    } catch (error) {
      console.error("Error sending notification to user:", error);
      throw error;
    }
  }

  static async sendToMultipleUsers(userIds, notificationData) {
    try {
      const sendPromises = userIds.map((userId) =>
        this.sendToUser(userId, notificationData)
      );
      return await Promise.allSettled(sendPromises);
    } catch (error) {
      console.error("Error sending notifications to multiple users:", error);
      throw error;
    }
  }
}

module.exports = FCMService;