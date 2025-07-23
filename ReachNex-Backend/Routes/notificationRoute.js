// === 📁 Routes/notificationRoute.js ===
// const express = require("express");
// const router = express.Router();
// const Notification = require("../Database_Modal/notificationModel");

// 📌 Get all notifications for a user
// router.get("/:userId", async (req, res) => {
//   try {
//     const notifications = await Notification.find({ recipientId: req.params.userId })
//       .sort({ createdAt: -1 });
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 📌 Mark notification as read
// router.put("/:id/read", async (req, res) => {
//   try {
//     await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
//     res.sendStatus(200);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 📌 Create notification (with optional Socket.io emit)
// router.post("/", async (req, res) => {
//   try {
//     const { recipientId, senderId, type, message, link } = req.body;

//     const notification = new Notification({
//       recipientId,
//       senderId,
//       type,
//       message,
//       link,
//     });

//     await notification.save();

//     // Emit notification if recipient is online
//     const onlineUsers = req.onlineUsers;
//     const socketId = onlineUsers.get(recipientId);
//     if (socketId) {
//       req.io.to(socketId).emit("notification", notification);
//     }

//     res.status(201).json(notification);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require("../Control_Room/notificationController");

// Retrieve all notifications for a user
router.get("/:userId", getNotifications);

// Mark a specific notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read for a user
router.put("/mark-all-read/:userId", markAllAsRead);

// Delete a specific notification
router.delete("/:id", deleteNotification);

// Delete/clear all notifications for a user
router.delete("/clear/:userId", clearAllNotifications);

module.exports = router;
