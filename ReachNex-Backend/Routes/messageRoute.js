const express = require("express");
const {
  getMessages,
  sendMessage,
  getUserConversations,
  createOrGetConversation,
  getOnlineUsers,
} = require("../Control_Room/MessagingControler/messageController.js");

const router = express.Router();

router.get("/getConversation", getUserConversations);
router.post("/conversations", createOrGetConversation);
router.get("/getmessages/:id", getMessages);
router.post("/messages", sendMessage);
// router.post("/messages/:id", sendMessage);
router.get("/online-users", getOnlineUsers);

module.exports = router;
