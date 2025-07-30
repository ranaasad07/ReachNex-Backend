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


const getUnreadCountPerConversation = async (req, res) => {
  try {
    const userId = req.headers.userid;

    const unreadCounts = await Messages.aggregate([
      {
        $match: {
          receiverId: userId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$conversation",
          count: { $sum: 1 },
        },
      },
    ]);

    // Result: [ { _id: "conversationId", count: 2 }, ... ]
    res.status(200).json(unreadCounts);
  } catch (err) {
    console.error("getUnreadCountPerConversation error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = {
  getMessages,
  sendMessage,
  getUserConversations,
  createOrGetConversation,
  getOnlineUsers,
  getUnreadMessageCount, markMessageAsRead, getUnreadCountPerConversation
};
