const express = require("express");
const router = express.Router();
const auth = require("../Control_Room/auth");
const { getSuggestions } = require("../Control_Room/connectionController");

router.get("/suggestions", auth, getSuggestions);

module.exports = router;
