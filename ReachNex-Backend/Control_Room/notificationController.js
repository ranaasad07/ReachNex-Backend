const Notification = require("../Database_Modal/notificationModel");

// ✅ Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mark ALL notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a single notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Clear all notifications for a user
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipientId: req.params.userId });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
