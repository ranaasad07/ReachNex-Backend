const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversationSchema = new Schema({
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String
  },
  groupAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
