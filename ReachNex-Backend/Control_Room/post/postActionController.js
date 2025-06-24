const { Post } = require("../../Database_Modal/postModal");

// 👍 Like / Unlike a post (with socket emit)
const likePost = async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // ✅ Remove any nulls first
    post.likes = post.likes.filter(Boolean);

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyLiked) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await post.save();

    // ✅ Emit like update to all clients
    req.io.emit("likeUpdated", {
      postId: post._id,
      likes: post.likes,
    });

    res.status(200).json({ message: "Like updated", likes: post.likes });
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ message: "Server error in liking post" });
  }
};

// 💬 Add Comment (with socket emit)
const commentPost = async (req, res) => {
  const { postId, userId, text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // ✅ Emit comment to all clients
    req.io.emit("commentAdded", {
      postId: post._id,
      comment: newComment,
    });

    res.status(200).json({ message: "Comment added", comments: post.comments });
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ message: "Server error in commenting" });
  }
};

module.exports = {
  likePost,
  commentPost,
};
