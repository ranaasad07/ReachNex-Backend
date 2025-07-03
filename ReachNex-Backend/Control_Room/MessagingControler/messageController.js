const {Messages} = require("../../Database_Modal/MessageModel");
const {User} = require("../../Database_Modal/modals");

const getUsersForSidebar = async (req, res) => {
  try {
  
    const loggedUserId = req.headers.userid;
    const users = await User.find({ _id: { $ne: loggedUserId } }).select("-password");
    // console.log("=-=-=-users=",users)
    
    res.status(200).json(users);
  } catch (error) {
    console.log("getUsersForSidebar error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  try {
    console.log("=-=-=-hhghgh")
    const myId = req.headers.userid;
    // console.log("=-=-=-",myId)
    const { id: userToChatId } = req.params;
    const messages = await Messages.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("getMessages error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId =req.headers.userid;;

    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

     req.app.get("io").to(receiverId).emit("receiveMessage", newMessage);

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("sendMessage error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
};
