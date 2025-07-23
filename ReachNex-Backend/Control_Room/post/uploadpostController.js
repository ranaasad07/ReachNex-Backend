// const { User } = require('../../Database_Modal/modals');
// const { Post } = require("../../Database_Modal/postModal");

// const uploadingPost = async (req, res) => {
//   try {
//     const { userId, mediaUrl, caption } = req.body;

//     // ✅ Create the new post
//     const newPost = await Post.create({
//       userId,
//       mediaUrl,
//       caption,
//     });

//     // ✅ Push the post to the user's post list
//     await User.findByIdAndUpdate(userId, {
//       $push: { posts: newPost._id },
//     });

//     res.status(200).json({ message: "Post uploaded successfully", post: newPost });
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(400).json({ message: "Could not upload post" });
//   }
// };

// module.exports = { uploadingPost };


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



const { User } = require('../../Database_Modal/modals');
const { Post } = require("../../Database_Modal/postModal");
// import   {Connection} from "../../Database_Modal/connectionRequestSchema.js"// Assuming this exists
const { ConnectionRequest } = require("../../Database_Modal/connectionRequestSchema");

const sendNotification = require("../../utils/sendNotification");

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

    // ✅ Get all accepted connections of this user
    // const connections = await Connection.find({
    //   status: "accepted",
    //   $or: [{ sender: userId }, { receiver: userId }],
    // });
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const connectedUserIds = connections.map(conn =>
      conn.sender.toString() === userId ? conn.receiver : conn.sender
    );

    // ✅ Send notification to each connected user
    for (const recipientId of connectedUserIds) {
      await sendNotification({
        recipientId,
        senderId: userId,
        type: "new-post",
        message: "shared a new post",
        link: `/post/${newPost._id}`,
        io: req.io,
        onlineUsers: req.onlineUsers,
      });
    }

    res.status(200).json({ message: "Post uploaded successfully", post: newPost });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(400).json({ message: "Could not upload post" });
  }
};
// const uploadingPost = async (req, res) => {
//   try {
//     const { userId, mediaUrl, caption } = req.body;

//     const newPost = await Post.create({ userId, mediaUrl, caption });
//     await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

//     // Find accepted connections
//     const connections = await Connection.find({
//       status: "accepted",
//       $or: [{ sender: userId }, { receiver: userId }],
//     });
//     console.log("Accepted connections:", connections.length);

//     const connectedUserIds = connections.map(conn =>
//       conn.sender.toString() === userId ? conn.receiver.toString() : conn.sender.toString()
//     );

//     for (const recipientId of connectedUserIds) {
//       console.log("Sending notification to:", recipientId);
//       await sendNotification({
//         recipientId,
//         senderId: userId,
//         type: "new-post",
//         message: "shared a new post",
//         link: `/post/${newPost._id}`,
//         io: req.io,
//         onlineUsers: req.onlineUsers,
//       });
//     }

//     res.status(200).json({ message: "Post uploaded successfully", post: newPost });
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(400).json({ message: "Could not upload post" });
//   }
// };

module.exports = { uploadingPost };
