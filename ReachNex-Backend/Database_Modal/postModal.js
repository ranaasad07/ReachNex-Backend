const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mediaUrl: String,
  caption: String,

  // 👍 Likes
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 💬 Comments
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true }); // auto adds createdAt & updatedAt

const Post = mongoose.model("Post", postSchema);
module.exports = { Post };
