
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

    // Return only the fields needed by the frontend
    res.json({
      id: updatedProfile._id,
      username: updatedProfile.username,
      email: updatedProfile.email,
      fullName: updatedProfile.fullName,
      profilePicture: updatedProfile.profilePicture,
      // add other fields if needed
    });
  } catch (err) {
    console.error("Avatar update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateAvatar;
