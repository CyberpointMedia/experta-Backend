const notificationController = require("../controllers/notification.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const routes = require("../constants/route.url");

module.exports = (app) => {
  const router = require("express").Router();

  router.post(
    "/register-device",
    authMiddleware,
    notificationController.registerDevice
  );
  router.post(
    "/unregister-device",
    authMiddleware,
    notificationController.unregisterDevice
  );
  router.get(
    "/notifications",
    authMiddleware,
    notificationController.getNotifications
  );
  router.get(
    "/notifications/:userId",
    authMiddleware,
    notificationController.getNotificationsByUserId
  );
  router.patch(
    "/notifications/:notificationId/read",
    authMiddleware,
    notificationController.markNotificationRead
  );
  router.patch(
    "/notifications/read-all",
    authMiddleware,
    notificationController.markAllNotificationsRead
  );

  app.use(routes.API, router);
};
