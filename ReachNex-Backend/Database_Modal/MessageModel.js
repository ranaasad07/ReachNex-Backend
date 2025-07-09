const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  conversation:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Conversation",
    required:true
  },
  text: String,
  image: String
}, { timestamps: true });

const Messages = mongoose.model("Message", messageSchema);

module.exports = { Messages };