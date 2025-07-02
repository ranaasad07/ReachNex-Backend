const express = require("express");
const { sendMessage, getMessages, getUsersForSidebar } = require("../Control_Room/MessagingControler/messageController");
const router = express.Router();

router.get("/message/userlist", getUsersForSidebar);
router.get("/message/:id", getMessages);
router.post("/message/send/:id", sendMessage);

module.exports = router;
