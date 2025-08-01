const { User } = require('../../Database_Modal/modals');
const { Post } = require("../../Database_Modal/postModal");

const uploadingPost = async (req, res) => {
  try {
    const { userId, mediaUrl, caption } = req.body;

    // ✅ Create the new post
    const newPost = await Post.create({
      userId,
      mediaUrl,
      caption,
    });

    // ✅ Push the post to the user's post list
    await User.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id },
    });

    res.status(200).json({ message: "Post uploaded successfully", post: newPost });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(400).json({ message: "Could not upload post" });
  }
};

module.exports = { uploadingPost };


// const getAllPost = async (req, res) => {
//   try {
//     const allPost = await Post.find({}).populate("userId", "username profilePic");

//     if (!allPost || allPost.length === 0) {
//       return res.status(404).json({ message: "No posts found" });
//     }

//     return res.status(200).json({
//       message: "All posts fetched successfully",
//       posts: allPost,
//     });
//   } catch (error) {
//     console.log("Get posts error:", error);
//     res.status(500).json({ message: "Something went wrong while fetching posts" });
//   }
// };

// module.exports = { getAllPost };