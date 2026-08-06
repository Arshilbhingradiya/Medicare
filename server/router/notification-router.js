const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const notificationController = require("../controllers/notification-controller");

router.use(authMiddleware);

router.get("/", notificationController.getMyNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
