const { User } = require("../../Database_Modal/modals");


const updateBanner = async (req, res) => {
  const userId = req.userId;
  const imageUrl = req.body.image;

  if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bannerImage: imageUrl },
      { new: true }
    ).select("-password");
    // console.log("Updated user:", updatedUser);
// console.log("userId received:", userId);
// console.log("imageUrl received:", imageUrl);

    console.log(updatedUser);
//     console.log("User ID:", userId);
// console.log("Type of ID:", typeof userId);

    res.json(updatedUser);

  } catch (err) {
    console.error("Banner update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateBanner;
