const express = require("express");
const router = express.Router();

const { uploadingPost } = require("../Control_Room/post/uploadpostController");
const { fetchAllPosts } = require("../Control_Room/post/getallpostController");
const { getPostById } = require("../Control_Room/post/getpostbyidController");

const {
  likePost,
  commentPost,
  replyComment, // ✅ Yeh line zaroori hai
} = require("../Control_Room/post/postActionController");

// 📤 Create New Post
router.post('/uploadPost', uploadingPost);

// 📥 Get All Posts
router.get('/gettingAllPosts', fetchAllPosts);

// 👍 Like / Unlike Post
router.post("/likePost", likePost);

// 💬 Comment on a Post
router.post("/commentPost", commentPost);

// 🧵 Reply to a Comment
router.post("/replyComment", replyComment); // ✅ Final route



router.get("/posts/:postId", getPostById);
// ✅ Correct export
module.exports = router;
