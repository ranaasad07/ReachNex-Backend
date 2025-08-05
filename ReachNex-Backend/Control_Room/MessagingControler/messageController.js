const mongoose = require("mongoose");
const { Messages } = require("../../Database_Modal/MessageModel");
const Conversation = require("../../Database_Modal/Conversation"); // ✅ Fixed

const { User } = require("../../Database_Modal/modals");

const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    const messages = await Messages.find({ conversation: conversationId })
      .populate("senderId", "fullName profilePicture username")
      .populate("receiverId", "fullName profilePicture")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("getMessages error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const text = req.body.text;
    const senderId = req.headers.senderid;
    const receiverId = req.headers.receiverid;
    let conversationId = req.headers.conversationid;
    // let { id: conversationId } = req.params;
    console.log("-=-=-", req.headers)
    let conversation;

    // ✅ If no conversationId provided, find or create
    if (!conversationId || conversationId === "null") {
      conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
        // isGroupChat: false
      });

      if (!conversation) {
        conversation = new Conversation({
          members: [senderId, receiverId],
        });
        await conversation.save();
      }

      conversationId = conversation._id;
    } else {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // ✅ Save the message
    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      conversation: conversationId,
    });

    await newMessage.save();

    // Fetch new unread count for that user
const unreadCount = await Messages.countDocuments({
  receiverId,
  isRead: false,
});

// Emit real-time unread count
req.app.get("io").to(receiverId.toString()).emit("unreadMessageCount", unreadCount);


    // ✅ Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: text,
      },
    });

    

    // ✅ Emit through socket
    req.app.get("io").to(conversationId).emit("receiveMessage", newMessage);

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("sendMessage error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Send Message in a Conversation
const sendMessage_bkp = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: conversationId } = req.params;
    const senderId = req.headers.userid;
    console.log("=--==-=srnserId", senderId, "conversationId", conversationId)
    // ✅ Conversation find karo to get receiverId
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    console.log(conversation)
    const receiverId = conversation.members.find((memberId) => {
      // console.log("💬 Member ID:", memberId,"memberIdmemberId",memberId.toString());
      // console.log("🧑‍💻 Sender ID:", senderId);
      return memberId?.toString() !== senderId;
    });

    console.log("✅ Final Receiver ID:", receiverId);


    // ✅ Yeh senderId aur receiverId ab dono required hain
    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: text,
      },
    });

    // 👇 emit socket message
    req.app.get("io").to(conversationId).emit("receiveMessage", newMessage);

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("sendMessage error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Get All Conversations for Logged-in User
const getUserConversations = async (req, res) => {
  // try {
  //   const senderId = req.headers.senderid;
  //   const receiverId = req.headers.receiverid;
  //   // console.log(req.headers," req===========")

  //   // const conversations = await Conversation.find({ members: userId })
  //   //   .populate("members", "fullName profilePicture username isOnline")
  //   //   .sort({ updatedAt: -1 });

  //     const conversations = await Conversation.findOne({
  //       members: { $all: [senderId, receiverId] }, // ✅ dono hone chahiye members me
  //       // isGroupChat: false // Optional: agar sirf one-to-one chahiye
  //     });

  //     console.log(conversations,"=========Conversation")

  //   res.status(200).json(conversations);
  // } catch (error) {
  //   console.log("getUserConversations error:", error.message);
  //   res.status(500).json({ message: "Internal Server Error" });
  // }

  try {
    const senderId = req.headers.senderid;
    const receiverId = req.headers.receiverid;

    const messages = await Messages.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 }); // oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    console.log("getMessagesBetweenTwoUsers error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Create or Get Conversation Between Two Users
const createOrGetConversation = async (req, res) => {
  try {
    const senderId = req.headers.userid;
    const { receiverId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      isGroupChat: false,
      members: { $all: [senderId, receiverId], $size: 2 }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        members: [senderId, receiverId],
        isGroupChat: false,
      });

      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.log("createOrGetConversation error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getOnlineUsers = async (req, res) => {
  try {
    // const onlineUserIds = Array.from(req.onlineUsers.keys());

    const users = await User.find({}).select(
      "fullName profilePicture username isOnline"
    ).lean().exec();
    console.log("0--=-=-=-=", users)
    res.status(200).json({ users });
  } catch (err) {
    console.log("getOnlineUsers error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.headers.userid; // or `req.user.id` if using auth middleware

    if (!userId) {
      return res.status(400).json({ message: "User ID missing in headers" });
    }

    const count = await Messages.countDocuments({
      receiverId: userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.log("getUnreadMessageCount error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Mark individual message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    const updated = await Messages.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("markMessageAsRead error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// const getUnreadCountPerConversation = async (req, res) => {
//   try {
//     const userId = req.headers.userid;

//     const unreadCounts = await Messages.aggregate([
//       {
//         $match: {
//           receiverId: userId,
//           isRead: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$conversation",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // Result: [ { _id: "conversationId", count: 2 }, ... ]
//     res.status(200).json(unreadCounts);
//   } catch (err) {
//     console.error("getUnreadCountPerConversation error:", err.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const getUnreadCountPerConversation = async (req, res) => {
  try {
    const userId = req.headers.userid;

    if (!userId) {
      return res.status(400).json({ message: "Missing userid in headers" });
    }

    const messages = await Messages.find({
      receiverId: userId,
      isRead: false,
    });

    const unreadMap = {};

    messages.forEach((msg) => {
      const id1 = msg.senderId.toString();
      const id2 = msg.receiverId.toString();
      const conversationId = [id1, id2].sort().join("_");

      unreadMap[conversationId] = (unreadMap[conversationId] || 0) + 1;
    });

    const result = Object.entries(unreadMap).map(([conversationId, count]) => ({
      conversationId,
      count,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("getUnreadCountPerConversation error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Mark all unread messages in a conversation as read for a user
// const markConversationMessagesAsRead = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.headers.userid;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing" });
//     }

//     const result = await Messages.updateMany(
//       {
//         conversation: conversationId,
//         receiverId: userId,
//         isRead: false,
//       },
//       { isRead: true }
//     );

//     res.status(200).json({ modifiedCount: result.modifiedCount });
//   } catch (error) {
//     console.error("markConversationMessagesAsRead error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
// const markConversationMessagesAsRead = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.headers.userid;

//     console.log("Marking as read:", { conversationId, userId });

//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing" });
//     }

//     const result = await Messages.updateMany(
//       {
//         conversation: conversationId, // this line gives error
//         receiverId: userId,
//         isRead: false,
//       },
//       { isRead: true }
//     );

//     console.log("Update result:", result);

//     res.status(200).json({ modifiedCount: result.modifiedCount });
//   } catch (error) {
//     console.error("markConversationMessagesAsRead error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const markConversationMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params; // e.g., 'userA_userB'
    const userId = req.headers.userid;

    if (!userId || !conversationId) {
      return res.status(400).json({ message: "Missing userId or conversationId" });
    }

    // Split the room ID
    const [userA, userB] = conversationId.split("_");

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(userA) ||
      !mongoose.Types.ObjectId.isValid(userB) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid ObjectId(s)" });
    }

    // Find the actual conversation
    const conversation = await Conversation.findOne({
      members: {
        $all: [
          new mongoose.Types.ObjectId(userA),
          new mongoose.Types.ObjectId(userB),
        ],
      },
      isGroupChat: false,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Update unread messages for this user in this conversation
    const result = await Messages.updateMany(
      {
        conversation: conversation._id,
        receiverId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("🔥 Error marking messages as read:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports = {
  getMessages,
  sendMessage,
  getUserConversations,
  createOrGetConversation,
  getOnlineUsers,
  getUnreadMessageCount, markMessageAsRead, getUnreadCountPerConversation ,markConversationMessagesAsRead
};




// // // const { Messages } = require("../../Database_Modal/MessageModel");
// // // const Conversation = require("../../Database_Modal/Conversation");
// // // const { User } = require("../../Database_Modal/modals");

// // // // Get all messages in a conversation
// // // const getMessages = async (req, res) => {
// // //   try {
// // //     const { id: conversationId } = req.params;

// // //     const messages = await Messages.find({ conversation: conversationId })
// // //       .populate("senderId", "fullName profilePicture username")
// // //       .populate("receiverId", "fullName profilePicture")
// // //       .sort({ createdAt: 1 });

// // //     res.status(200).json(messages);
// // //   } catch (error) {
// // //     console.log("getMessages error:", error.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Send a message in a conversation (or create one if not exists)
// // // const sendMessage = async (req, res) => {
// // //   try {
// // //     const text = req.body.text;
// // //     const senderId = req.headers.senderid;
// // //     const receiverId = req.headers.receiverid;
// // //     let conversationId = req.headers.conversationid;
// // //     let conversation;

// // //     if (!conversationId || conversationId === "null") {
// // //       // Find or create conversation
// // //       conversation = await Conversation.findOne({
// // //         members: { $all: [senderId, receiverId] },
// // //       });

// // //       if (!conversation) {
// // //         conversation = new Conversation({ members: [senderId, receiverId] });
// // //         await conversation.save();
// // //       }

// // //       conversationId = conversation._id;
// // //     } else {
// // //       conversation = await Conversation.findById(conversationId);
// // //       if (!conversation) {
// // //         return res.status(404).json({ message: "Conversation not found" });
// // //       }
// // //     }

// // //     const newMessage = new Messages({
// // //       senderId,
// // //       receiverId,
// // //       text,
// // //       conversation: conversationId,
// // //     });

// // //     await newMessage.save();

// // //     // Update lastMessage in conversation
// // //     await Conversation.findByIdAndUpdate(conversationId, {
// // //       $set: { lastMessage: text },
// // //     });

// // //     // Get socket instance
// // //     const io = req.app.get("io");

// // //     // Emit socket event for receiver: update unread count
// // //     const unreadCount = await Messages.countDocuments({ receiverId, isRead: false });
// // //     io.to(receiverId.toString()).emit("unreadMessageCount", unreadCount);

// // //     // Emit the new message to the conversation room
// // //     io.to(conversationId.toString()).emit("receiveMessage", newMessage);

// // //     res.status(200).json(newMessage);
// // //   } catch (error) {
// // //     console.log("sendMessage error:", error.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Get all conversations for a user
// // // const getUserConversations = async (req, res) => {
// // //   try {
// // //     const userId = req.headers.userid;
// // //     if (!userId) return res.status(400).json({ message: "User ID missing in headers" });

// // //     const conversations = await Conversation.find({ members: userId })
// // //       .populate("members", "fullName profilePicture username isOnline")
// // //       .sort({ updatedAt: -1 });

// // //     res.status(200).json(conversations);
// // //   } catch (error) {
// // //     console.log("getUserConversations error:", error.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Create or get conversation between two users
// // // const createOrGetConversation = async (req, res) => {
// // //   try {
// // //     const senderId = req.headers.userid;
// // //     const { receiverId } = req.body;

// // //     let conversation = await Conversation.findOne({
// // //       isGroupChat: false,
// // //       members: { $all: [senderId, receiverId], $size: 2 },
// // //     });

// // //     if (!conversation) {
// // //       conversation = new Conversation({
// // //         members: [senderId, receiverId],
// // //         isGroupChat: false,
// // //       });
// // //       await conversation.save();
// // //     }

// // //     res.status(200).json(conversation);
// // //   } catch (error) {
// // //     console.log("createOrGetConversation error:", error.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Get online users
// // // const getOnlineUsers = async (req, res) => {
// // //   try {
// // //     const users = await User.find({})
// // //       .select("fullName profilePicture username isOnline")
// // //       .lean()
// // //       .exec();
// // //     res.status(200).json({ users });
// // //   } catch (err) {
// // //     console.log("getOnlineUsers error:", err.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Get unread message count for a user
// // // const getUnreadMessageCount = async (req, res) => {
// // //   try {
// // //     const userId = req.headers.userid;
// // //     if (!userId) return res.status(400).json({ message: "User ID missing in headers" });

// // //     const count = await Messages.countDocuments({
// // //       receiverId: userId,
// // //       isRead: false,
// // //     });

// // //     res.status(200).json({ unreadCount: count });
// // //   } catch (error) {
// // //     console.log("getUnreadMessageCount error:", error.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Mark individual message as read
// // // const markMessageAsRead = async (req, res) => {
// // //   try {
// // //     const { id: messageId } = req.params;

// // //     const updated = await Messages.findByIdAndUpdate(
// // //       messageId,
// // //       { isRead: true },
// // //       { new: true }
// // //     );

// // //     res.status(200).json(updated);
// // //   } catch (error) {
// // //     console.error("markMessageAsRead error:", error.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Get unread message count per conversation for a user
// // // const getUnreadCountPerConversation = async (req, res) => {
// // //   try {
// // //     const userId = req.headers.userid;
// // //     if (!userId) return res.status(400).json({ message: "Missing userid in headers" });

// // //     const messages = await Messages.find({
// // //       receiverId: userId,
// // //       isRead: false,
// // //     });

// // //     const unreadMap = {};
// // //     messages.forEach((msg) => {
// // //       const convId = msg.conversation.toString();
// // //       unreadMap[convId] = (unreadMap[convId] || 0) + 1;
// // //     });

// // //     const result = Object.entries(unreadMap).map(([conversationId, count]) => ({
// // //       conversationId,
// // //       count,
// // //     }));

// // //     res.status(200).json(result);
// // //   } catch (err) {
// // //     console.error("getUnreadCountPerConversation error:", err.message);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // // Mark all unread messages in a conversation as read for a user
// // // const markConversationMessagesAsRead = async (req, res) => {
// // //   try {
// // //     const { conversationId } = req.params;
// // //     const userId = req.headers.userid;

// // //     if (!userId) {
// // //       return res.status(400).json({ message: "User ID missing" });
// // //     }

// // //     const result = await Messages.updateMany(
// // //       {
// // //         conversation: conversationId,
// // //         receiverId: userId,
// // //         isRead: false,
// // //       },
// // //       { isRead: true }
// // //     );

// // //     // Emit event to conversation room: messages marked as read
// // //     const io = req.app.get("io");
// // //     io.to(conversationId.toString()).emit("messagesRead", {
// // //       conversationId,
// // //       userId,
// // //     });

// // //     res.status(200).json({ modifiedCount: result.modifiedCount });
// // //   } catch (error) {
// // //     console.error("markConversationMessagesAsRead error:", error);
// // //     res.status(500).json({ message: "Internal Server Error" });
// // //   }
// // // };

// // // module.exports = {
// // //   getMessages,
// // //   sendMessage,
// // //   getUserConversations,
// // //   createOrGetConversation,
// // //   getOnlineUsers,
// // //   getUnreadMessageCount,
// // //   markMessageAsRead,
// // //   getUnreadCountPerConversation,
// // //   markConversationMessagesAsRead,
// // // };
// const { Messages } = require("../../Database_Modal/MessageModel");
// const Conversation = require("../../Database_Modal/Conversation");
// const { User } = require("../../Database_Modal/modals");

// // Get all messages in a conversation
// const getMessages = async (req, res) => {
//   try {
//     const { id: conversationId } = req.params;

//     const messages = await Messages.find({ conversation: conversationId })
//       .populate("senderId", "fullName profilePicture username")
//       .populate("receiverId", "fullName profilePicture")
//       .sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("getMessages error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Send a message (create conversation if needed)
// const sendMessage = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const senderId = req.headers.senderid;
//     const receiverId = req.headers.receiverid;
//     let conversationId = req.headers.conversationid;

//     let conversation;

//     if (!conversationId || conversationId === "null") {
//       conversation = await Conversation.findOne({
//         members: { $all: [senderId, receiverId] },
//       });

//       if (!conversation) {
//         conversation = new Conversation({
//           members: [senderId, receiverId],
//           isGroupChat: false,
//         });
//         await conversation.save();
//       }

//       conversationId = conversation._id;
//     } else {
//       conversation = await Conversation.findById(conversationId);
//       if (!conversation) {
//         return res.status(404).json({ message: "Conversation not found" });
//       }
//     }

//     const newMessage = new Messages({
//       senderId,
//       receiverId,
//       text,
//       conversation: conversationId,
//     });

//     await newMessage.save();

//     // Update conversation lastMessage and updatedAt
//     await Conversation.findByIdAndUpdate(conversationId, {
//       $set: { lastMessage: text, updatedAt: new Date() },
//     });

//     // Emit unread count update to receiver
//     const unreadCount = await Messages.countDocuments({
//       receiverId,
//       isRead: false,
//     });

//     const io = req.app.get("io");
//     io.to(receiverId.toString()).emit("unreadMessageCount", unreadCount);

//     // Emit new message to conversation room
//     io.to(conversationId.toString()).emit("receiveMessage", newMessage);

//     res.status(200).json(newMessage);
//   } catch (error) {
//     console.error("sendMessage error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Get messages between two users (alternative getUserConversations)
// const getUserConversations = async (req, res) => {
//   try {
//     const senderId = req.headers.senderid;
//     const receiverId = req.headers.receiverid;

//     if (!senderId || !receiverId) {
//       return res.status(400).json({ message: "Sender or Receiver ID missing" });
//     }

//     const messages = await Messages.find({
//       $or: [
//         { senderId, receiverId },
//         { senderId: receiverId, receiverId: senderId },
//       ],
//     }).sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("getUserConversations error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Create or get conversation between two users
// const createOrGetConversation = async (req, res) => {
//   try {
//     const senderId = req.headers.userid;
//     const { receiverId } = req.body;

//     if (!senderId || !receiverId) {
//       return res.status(400).json({ message: "Sender or Receiver ID missing" });
//     }

//     let conversation = await Conversation.findOne({
//       isGroupChat: false,
//       members: { $all: [senderId, receiverId], $size: 2 },
//     });

//     if (!conversation) {
//       conversation = new Conversation({
//         members: [senderId, receiverId],
//         isGroupChat: false,
//       });
//       await conversation.save();
//     }

//     res.status(200).json(conversation);
//   } catch (error) {
//     console.error("createOrGetConversation error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Get all users (for online status)
// const getOnlineUsers = async (req, res) => {
//   try {
//     const users = await User.find({})
//       .select("fullName profilePicture username isOnline")
//       .lean()
//       .exec();
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("getOnlineUsers error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Get unread message count for a user
// const getUnreadMessageCount = async (req, res) => {
//   try {
//     const userId = req.headers.userid;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing in headers" });
//     }

//     const count = await Messages.countDocuments({
//       receiverId: userId,
//       isRead: false,
//     });

//     res.status(200).json({ unreadCount: count });
//   } catch (error) {
//     console.error("getUnreadMessageCount error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Mark individual message as read
// const markMessageAsRead = async (req, res) => {
//   try {
//     const { id: messageId } = req.params;

//     const updated = await Messages.findByIdAndUpdate(
//       messageId,
//       { isRead: true },
//       { new: true }
//     );

//     res.status(200).json(updated);
//   } catch (error) {
//     console.error("markMessageAsRead error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Get unread count per conversation for a user
// const getUnreadCountPerConversation = async (req, res) => {
//   try {
//     const userId = req.headers.userid;

//     if (!userId) {
//       return res.status(400).json({ message: "Missing userid in headers" });
//     }

//     const messages = await Messages.find({
//       receiverId: userId,
//       isRead: false,
//     });

//     const unreadMap = {};

//     messages.forEach((msg) => {
//       const convId = msg.conversation.toString();
//       unreadMap[convId] = (unreadMap[convId] || 0) + 1;
//     });

//     const result = Object.entries(unreadMap).map(([conversationId, count]) => ({
//       conversationId,
//       count,
//     }));

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("getUnreadCountPerConversation error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Mark all unread messages in a conversation as read for a user
// const markConversationMessagesAsRead = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.headers.userid;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing" });
//     }

//     const result = await Messages.updateMany(
//       {
//         conversation: conversationId,
//         receiverId: userId,
//         isRead: false,
//       },
//       { isRead: true }
//     );

//     // Emit event for messages read in the conversation
//     const io = req.app.get("io");
//     io.to(conversationId.toString()).emit("messagesRead", {
//       conversationId,
//       userId,
//     });

//     res.status(200).json({ modifiedCount: result.modifiedCount });
//   } catch (error) {
//     console.error("markConversationMessagesAsRead error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// module.exports = {
//   getMessages,
//   sendMessage,
//   getUserConversations,
//   createOrGetConversation,
//   getOnlineUsers,
//   getUnreadMessageCount,
//   markMessageAsRead,
//   getUnreadCountPerConversation,
//   markConversationMessagesAsRead,
// };
