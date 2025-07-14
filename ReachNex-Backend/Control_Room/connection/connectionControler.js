// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');

//make connect butoon , accept button , reject, get all users , get pending invitations ,etc
const connectButton = async (req, res) => {
    try {
        const senderId = req.user.id; // Assuming you're using middleware to get authenticated user
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot connect with yourself." });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: "Receiver user not found." });
        }

        // If receiver already has the sender in pendingRequests, remove it (cancel request)
        const alreadySent = receiver.pendingRequests.includes(senderId);

        if (alreadySent) {
            receiver.pendingRequests = receiver.pendingRequests.filter(id => id.toString() !== senderId);
            await receiver.save();

            return res.status(200).json({ message: "Connection request canceled." });
        } else {
            receiver.pendingRequests.push(senderId);
            await receiver.save();

            return res.status(200).json({ message: "Connection request sent." });
        }

    } catch (error) {
        console.error("Connection error:", error);
        return res.status(500).json({ message: "Server error." });
    }
};

const acceptConnection = async (req, res) => {
    try {
        const receiverId = req.user.id; // Authenticated user (receiver)
        const { senderId } = req.body;  // ID of the user who sent the request

        if (receiverId === senderId) {
            return res.status(400).json({ message: "You cannot accept your own request." });
        }

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !sender) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the request exists
        const requestIndex = receiver.pendingRequests.indexOf(senderId);
        if (requestIndex === -1) {
            return res.status(400).json({ message: "No pending request from this user." });
        }

        // Add each user to the other's connections
        receiver.connections.push(senderId);
        sender.connections.push(receiverId);

        // Remove the pending request
        receiver.pendingRequests.splice(requestIndex, 1);

        await receiver.save();
        await sender.save();

        res.status(200).json({ message: "Connection accepted successfully." });
    } catch (error) {
        console.error("Accept connection error:", error);
        res.status(500).json({ message: "Server error while accepting connection." });
    }
};

const rejectConnection = async (req, res) => {
  try {
    const receiverId = req.user.id; // Authenticated user (receiver)
    const { senderId } = req.body;  // User who sent the request

    if (receiverId === senderId) {
      return res.status(400).json({ message: "Invalid operation." });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "Receiver user not found." });
    }

    // Check if the request exists
    const requestIndex = receiver.pendingRequests.indexOf(senderId);
    if (requestIndex === -1) {
      return res.status(400).json({ message: "No pending request from this user." });
    }

    // Remove the sender from pendingRequests
    receiver.pendingRequests.splice(requestIndex, 1);
    await receiver.save();

    res.status(200).json({ message: "Connection request rejected." });
  } catch (error) {
    console.error("Reject connection error:", error);
    res.status(500).json({ message: "Server error while rejecting connection." });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID

    const user = await User.findById(userId)
      .populate({
        path: 'pendingRequests',
        select: 'fullName username profilePicture email' // Add more fields if needed
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Pending connection requests fetched successfully.',
      pendingRequests: user.pendingRequests
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error while fetching pending requests.' });
  }
};

const getConnectionsList = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID

    const user = await User.findById(userId)
      .populate({
        path: 'connections',
        select: 'fullName username profilePicture email' // Add more fields if needed
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Connections list fetched successfully.',
      connections: user.connections
    });
  } catch (error) {
    console.error('Error fetching connections list:', error);
    res.status(500).json({ message: 'Server error while fetching connections list.' });
  }
};

const removeConnection = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user
    const { targetUserId } = req.body; // User to disconnect from

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot remove yourself as a connection." });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove each other from connections
    user.connections = user.connections.filter(id => id.toString() !== targetUserId);
    targetUser.connections = targetUser.connections.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    res.status(200).json({ message: "Connection removed successfully." });
  } catch (error) {
    console.error("Error removing connection:", error);
    res.status(500).json({ message: "Server error while removing connection." });
  }
};

const getAllUsersExcludingMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await User.find({ _id: { $ne: userId } })
      .select('fullName username profilePicture email'); // Add fields you want to show

    res.status(200).json({
      message: 'Users fetched successfully.',
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};


module.exports = {
    connectButton,
    acceptConnection ,
    rejectConnection ,
    getPendingRequests,
    getConnectionsList,
    removeConnection ,
    getAllUsersExcludingMe
}