const { Post } = require("../../Database_Modal/postModal");

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

    // 🔁 Re-fetch post to populate latest comment's user info
    const updatedPost = await Post.findById(postId).populate(
      "comments.userId",
      "username profilePicture"
    );

    const latestComment = updatedPost.comments[updatedPost.comments.length - 1];

    console.log("Comment Added:", latestComment);

    // 🔥 Emit to all sockets
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

module.exports = {
  likePost,
  commentPost,
};
