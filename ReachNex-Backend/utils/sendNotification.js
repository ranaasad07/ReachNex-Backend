// const Notification = require("../Database_Modal/notificationModel");

// const sendNotification = async ({ recipientId, senderId, type, message, link, io, onlineUsers }) => {
//   const notification = new Notification({ recipientId, senderId, type, message, link });
//   await notification.save();

//   const socketId = onlineUsers.get(recipientId.toString());
//   if (socketId) {
//     io.to(socketId).emit("notification", notification);
//   }

//   return notification;
// };

// module.exports = sendNotification;

const Notification = require("../Database_Modal/notificationModel");

const sendNotification = async ({ recipientId, senderId, type, message, link, io, onlineUsers }) => {
  const notification = new Notification({
    recipientId,
    senderId,
    type,
    message,
    link,
  });

  await notification.save();

  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit("notification", notification);
  }

  return notification;
};

module.exports = sendNotification;
