const Notification = require("../models/notification-model");

// Create a notification (helper used internally)
const createNotification = async ({
  userId,
  role = "Patient",
  type = "system",
  title,
  message,
  meta = {},
}) => {
  try {
    if (!userId) return null;
    const notification = await Notification.create({
      userId,
      role,
      type,
      title,
      message,
      meta,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Get all notifications for the logged-in user
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(notifications || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Mark all notifications as read
const markAllRead = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    await Notification.updateMany({ userId, read: false }, { read: true });

    return res.status(200).json({ msg: "All notifications marked as read" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Delete a notification (removes it permanently so it won't reappear)
const deleteNotification = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    return res.status(200).json({ msg: "Notification removed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const count = await Notification.countDocuments({ userId, read: false });
    return res.status(200).json({ count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  getUnreadCount,
};
