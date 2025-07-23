const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = { ConnectionRequest };
