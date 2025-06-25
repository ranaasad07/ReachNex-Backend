
const { User } = require("../../Database_Modal/modals");

const updateAvatar = async (req, res) => {
  const userId = req.userId;
  const imageUrl = req.body.image;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    const updatedProfile = await User.findOneAndUpdate(
       { _id: userId },
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found for user" });
    }

    res.json(updatedProfile);
  } catch (err) {
    console.error("Avatar update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateAvatar;
