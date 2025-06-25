
  const {User} = require("../../Database_Modal/modals")
  
const updateDetails = async (req, res) => {
  const userId = req.userId;
  const { name, profession, location } = req.body;

  try {
    const updatedProfile = await User.findOneAndUpdate(
      { _id: userId },
      { name, profession, location },
      { new: true }
    );

    if (!updatedProfile) return res.status(404).json({ error: "Profile not found" });

    res.json(updatedProfile);
  } catch (err) {
    console.error("Details update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateDetails;
