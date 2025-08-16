const express = require("express");
const {
  getMessages,
  sendMessage,
  getUserConversations,
  createOrGetConversation,
  getOnlineUsers,
  getUnreadMessageCount  ,markMessageAsRead ,getUnreadCountPerConversation ,markConversationMessagesAsRead
} = require("../Control_Room/MessagingControler/messageController.js");

const router = express.Router();

router.get("/getConversation", getUserConversations);
router.post("/conversations", createOrGetConversation);
router.get("/getmessages/:id", getMessages);
router.post("/messages", sendMessage);
// router.post("/messages/:id", sendMessage);
router.get("/online-users", getOnlineUsers);

router.get("/message/unread-count", getUnreadMessageCount);
router.put("/message/:id/read", markMessageAsRead);
router.get("/message/unread-per-conversation", getUnreadCountPerConversation);
// In your router
// router.put("/conversation/:conversationId/read", markConversationMessagesAsRead);
router.put("/message/conversation/:conversationId/read", markConversationMessagesAsRead);



module.exports = router;
