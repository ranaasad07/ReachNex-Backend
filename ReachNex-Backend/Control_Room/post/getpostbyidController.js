const { Post } = require("../../Database_Modal/postModal");

// ------------------------ GET SINGLE POST BY ID ------------------------
const getPostById = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ message: "Missing postId parameter" });
  }

  try {
    const post = await Post.findById(postId)
      .populate("userId", "fullName profilePicture")
      .populate("comments.userId", "fullName profilePicture")
      .populate("comments.replies.userId", "fullName profilePicture");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getPostById,
};
