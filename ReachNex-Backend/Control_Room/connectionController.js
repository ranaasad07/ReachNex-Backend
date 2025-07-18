const { User } = require("../Database_Modal/modals");

const getSuggestions = async (req, res) => {
  const userId = req.userId;

  try {
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // All users except current and except ones already followed
    const suggestions = await User.find({
      _id: { $ne: userId, $nin: currentUser.following },
    }).select("-password -Otp"); // Exclude sensitive data

    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSuggestions };
