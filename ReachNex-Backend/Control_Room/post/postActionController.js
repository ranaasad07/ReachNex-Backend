const { Post } = require("../../Database_Modal/postModal");

// ------------------------ LIKE POST ------------------------
const likePost = async (req, res) => {
  const { postId, userId } = req.body;
  console.log("Like Request:", req.body);

  if (!postId || !userId)
    return res.status(400).json({ message: "Missing data" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    console.log("Like Updated:", post.likes);
    req.io.emit("likeUpdated", { postId: post._id, likes: post.likes });

    res.status(200).json({ likes: post.likes });
  } catch (err) {
    console.error("Like Server Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ------------------------ COMMENT POST ------------------------
const commentPost = async (req, res) => {
  const { postId, userId, text } = req.body;
  console.log("Comment Request:", req.body);

  if (!postId || !userId || !text)
    return res.status(400).json({ message: "Missing data" });

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

    const updatedPost = await Post.findById(postId).populate(
      "comments.userId",
      "username profilePicture"
    );

    const latestComment = updatedPost.comments[updatedPost.comments.length - 1];

    console.log("Comment Added:", latestComment);

    req.io.emit("commentAdded", {
      postId: post._id,
      comment: latestComment,
    });

    res.status(200).json({ message: "Comment added", comment: latestComment });
  } catch (err) {
    console.error("Comment Server Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ------------------------ REPLY TO COMMENT ------------------------
const replyComment = async (req, res) => {
  const { postId, commentId, userId, text } = req.body;
  console.log("Reply Request:", req.body);

  if (!postId || !commentId || !userId || !text)
    return res.status(400).json({ message: "Missing data" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      userId,
      text,
      createdAt: new Date(),
    };

    comment.replies = comment.replies || [];
    comment.replies.push(newReply);

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("comments.userId", "username profilePicture")
      .populate("comments.replies.userId", "username profilePicture");

    const updatedComment = updatedPost.comments.find(
      (c) => c._id.toString() === commentId
    );

    const latestReply = updatedComment.replies[updatedComment.replies.length - 1];

    req.io.emit("replyAdded", {
      postId,
      commentId,
      reply: latestReply,
    });

    res.status(200).json({ message: "Reply added", reply: latestReply });
  } catch (err) {
    console.error("Reply Server Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ------------------------ EXPORT ------------------------
module.exports = {
  likePost,
  commentPost,
  replyComment,
};
