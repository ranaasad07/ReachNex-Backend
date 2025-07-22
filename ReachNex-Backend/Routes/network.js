const express = require("express");
const router = express.Router();
const auth = require("../Control_Room/auth");
const { getSuggestions, sendConnectionRequest, getIncomingRequests, acceptRequest, rejectRequest, getConnectionCount, getPendingRequests, userConnections } = require("../Control_Room/connectionController");

router.get("/suggestions", auth, getSuggestions);
router.post("/send", auth, sendConnectionRequest);
router.get("/requests", auth, getIncomingRequests);
router.post("/accept", auth, acceptRequest);
router.post("/reject", auth, rejectRequest);
router.get("/user/connections", auth, getConnectionCount);
router.get("/pending", auth, getPendingRequests);
router.get("/connections/:userId", auth , userConnections)

module.exports = router;
