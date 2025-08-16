// const { User } = require("../Database_Modal/modals");
// const { ConnectionRequest } = require("../Database_Modal/connectionRequestSchema");
// const sendNotification = require("../utils/sendNotification"); 



// const getSuggestions = async (req, res) => {
//   const userId = req.userId;

//   try {
//     const currentUser = await User.findById(userId);
//     if (!currentUser) return res.status(404).json({ error: "User not found" });

//     const sentRequests = await ConnectionRequest.find({ sender: userId }).select("receiver");
//     const receivedRequests = await ConnectionRequest.find({ receiver: userId }).select("sender");

//     const sentIds = sentRequests.map(r => r.receiver.toString());
//     const receivedIds = receivedRequests.map(r => r.sender.toString());
//     const followingIds = currentUser.following.map(id => id.toString());

//     const excludeIds = new Set([userId, ...sentIds, ...receivedIds, ...followingIds]);

//     const suggestions = await User.find({
//       _id: { $nin: Array.from(excludeIds) },
//     }).select("fullName email profilePicture"); 

//     res.status(200).json(suggestions);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// const getConnectionCount = async (req, res) => {
//   const userId = req.userId;
//   try {
//     const user = await User.findById(userId).select("following");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" }); // ✅ safe fallback
//     }

//     res.status(200).json({ count: user.following.length });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };






// // send Request 

// // const sendConnectionRequest = async (req, res) => {
// //   const { receiverId } = req.body;
// //   const senderId = req.userId;

// //   try {
// //     const exists = await ConnectionRequest.findOne({ sender: senderId, receiver: receiverId });
// //     if (exists) {
// //       return res.status(400).json({ error: "Request already sent" });
// //     }

// //     const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId });
// //     await newRequest.save();

// //     // ✅ Emit socket event globally (no online user check)
// //     const io = req.io;
// //     io.emit("new_request", { receiverId });

// //     res.status(201).json({ success: true, message: "Request sent" });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // }; 

// const sendConnectionRequest = async (req, res) => {
//   const { receiverId } = req.body;
//   const senderId = req.userId;

//   try {
//     // Check if request already exists
//     const exists = await ConnectionRequest.findOne({
//       sender: senderId,
//       receiver: receiverId,
//     });

//     if (exists) {
//       return res.status(400).json({ error: "Request already sent" });
//     }

//     // Save the new connection request
//     const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId });
//     await newRequest.save();

//     // Optional: Emit socket event to frontend (general broadcast or to specific room)
//     const io = req.io;
//     io.emit("new_request", { receiverId });

//     // ✅ Save notification to DB and emit if receiver is online
//     await sendNotification({
//       recipientId: receiverId,
//       senderId: senderId,
//       type: "connection-request",
//       message: "sent you a connection request",
//       link: `/profile/${senderId}`,
//       io,
//       onlineUsers: req.onlineUsers,
//     });

//     res.status(201).json({ success: true, message: "Connection request sent" });
//   } catch (err) {
//     console.error("❌ Error sending connection request:", err);
//     res.status(500).json({ error: err.message });
//   }
// };




// // getIncomingRequest 


// const getIncomingRequests = async (req, res) => {
//   const userId = req.userId;

//   try {
//     const requests = await ConnectionRequest.find({ receiver: userId })
//       .populate("sender", "fullName email profilePicture");

//     res.status(200).json(requests);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // acceptRequest

// const acceptRequest = async (req, res) => {
//   const { requestId } = req.body;
//   const receiverId = req.userId;

//   try {
//     // ✅ Get the request
//     const request = await ConnectionRequest.findById(requestId);
//     if (!request || request.receiver.toString() !== receiverId) {
//       return res.status(404).json({ error: "Connection request not found" });
//     }

//     const senderId = request.sender.toString();

//     // ✅ Add each other in 'following'
//     await User.findByIdAndUpdate(receiverId, { $addToSet: { following: senderId } });
//     await User.findByIdAndUpdate(senderId, { $addToSet: { following: receiverId } });

//     // ✅ Delete request
//     await ConnectionRequest.findByIdAndDelete(requestId);

//     // ✅ Emit event to sender’s room
//     req.io.to(senderId).emit("connectionAccepted", { receiverId: senderId });

//     res.status(200).json({ message: "Connection accepted" });
//   } catch (err) {
//     console.error("❌ Error in acceptRequest:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



// //rejectRequest

// const rejectRequest = async (req, res) => {
//   const receiverId = req.userId;
//   const { senderId } = req.body;

//   try {
//     await ConnectionRequest.findOneAndDelete({ sender: senderId, receiver: receiverId });
//     res.status(200).json({ message: "Request rejected" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // getPendingRequests
// const getPendingRequests = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const requests = await ConnectionRequest.find({ receiver: userId })
//       .populate("sender", "fullName email profilePicture")
//       .sort({ createdAt: -1 });

//     res.status(200).json(requests);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // connectionController.js
  
// const userConnections = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId).populate("following");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ connections: user.following });
//   } catch (err) {
//     console.error("Error fetching connections:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const showConnection = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Count of following users
//     const followingCount = user.following?.length || 0;

//     res.status(200).json({ count: followingCount });
//   } catch (err) {
//     console.error("Connection count error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }



// module.exports = { getSuggestions, sendConnectionRequest, getIncomingRequests, acceptRequest, rejectRequest ,getConnectionCount, getPendingRequests, userConnections, showConnection };
const { User } = require("../Database_Modal/modals");
const { ConnectionRequest } = require("../Database_Modal/connectionRequestSchema");
const sendNotification = require("../utils/sendNotification");

// GET SUGGESTIONS
const getSuggestions = async (req, res) => {
  const userId = req.userId;

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const sentRequests = await ConnectionRequest.find({ sender: userId }).select("receiver");
    const receivedRequests = await ConnectionRequest.find({ receiver: userId }).select("sender");

    const sentIds = sentRequests.map(r => r.receiver.toString());
    const receivedIds = receivedRequests.map(r => r.sender.toString());
    const followingIds = currentUser.following.map(id => id.toString());

    const excludeIds = new Set([userId, ...sentIds, ...receivedIds, ...followingIds]);

    const suggestions = await User.find({
      _id: { $nin: Array.from(excludeIds) },
    }).select("fullName email profilePicture");

    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET CONNECTION COUNT
const getConnectionCount = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("following");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ count: user.following.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEND CONNECTION REQUEST
const sendConnectionRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  try {
    const exists = await ConnectionRequest.findOne({ sender: senderId, receiver: receiverId });
    if (exists) {
      return res.status(400).json({ error: "Request already sent" });
    }

    const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();

    const io = req.io;
    io.emit("new_request", { receiverId });

    await sendNotification({
      recipientId: receiverId,
      senderId: senderId,
      type: "connection-request",
      message: "sent you a connection request",
      link: `/profile/${senderId}`,
      io,
      onlineUsers: req.onlineUsers,
    });

    // ✅ Emit updated pending request count
    const pendingCount = await ConnectionRequest.countDocuments({ receiver: receiverId });
    const receiverSocketId = req.onlineUsers.get(receiverId.toString());
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("connectionRequestCountUpdate", {
        count: pendingCount,
      });
    }

    res.status(201).json({ success: true, message: "Connection request sent" });
  } catch (err) {
    console.error("❌ Error sending connection request:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET INCOMING REQUESTS
const getIncomingRequests = async (req, res) => {
  const userId = req.userId;

  try {
    const requests = await ConnectionRequest.find({ receiver: userId })
      .populate("sender", "fullName email profilePicture");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ACCEPT REQUEST
const acceptRequest = async (req, res) => {
  const { requestId } = req.body;
  const receiverId = req.userId;

  try {
    const request = await ConnectionRequest.findById(requestId);
    if (!request || request.receiver.toString() !== receiverId) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    const senderId = request.sender.toString();

    await User.findByIdAndUpdate(receiverId, { $addToSet: { following: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { following: receiverId } });

    await ConnectionRequest.findByIdAndDelete(requestId);

    req.io.to(senderId).emit("connectionAccepted", { receiverId: senderId });

    // ✅ Emit updated pending request count to receiver
    const pendingCount = await ConnectionRequest.countDocuments({ receiver: receiverId });
    const receiverSocketId = req.onlineUsers.get(receiverId.toString());
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("connectionRequestCountUpdate", {
        count: pendingCount,
      });
    }

    res.status(200).json({ message: "Connection accepted" });
  } catch (err) {
    console.error("❌ Error in acceptRequest:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// REJECT REQUEST
const rejectRequest = async (req, res) => {
  const receiverId = req.userId;
  const { senderId } = req.body;

  try {
    await ConnectionRequest.findOneAndDelete({ sender: senderId, receiver: receiverId });

    // ✅ Emit updated pending request count to receiver
    const pendingCount = await ConnectionRequest.countDocuments({ receiver: receiverId });
    const receiverSocketId = req.onlineUsers.get(receiverId.toString());
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("connectionRequestCountUpdate", {
        count: pendingCount,
      });
    }

    res.status(200).json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PENDING REQUESTS
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await ConnectionRequest.find({ receiver: userId })
      .populate("sender", "fullName email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER CONNECTIONS
const userConnections = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("following");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ connections: user.following });
  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SHOW CONNECTION COUNT (for profile)
const showConnection = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const followingCount = user.following?.length || 0;

    res.status(200).json({ count: followingCount });
  } catch (err) {
    console.error("Connection count error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ NEW: GET PENDING REQUEST COUNT
const getPendingRequestCount = async (req, res) => {
  const userId = req.userId;

  try {
    const count = await ConnectionRequest.countDocuments({ receiver: userId });
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting pending request count:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getSuggestions,
  sendConnectionRequest,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  getConnectionCount,
  getPendingRequests,
  userConnections,
  showConnection,
  getPendingRequestCount, // 👈 new export
};
