
// const Profile = require('../../Database_Modal/profile')



const getProfile = async (req, res) => {
  try {
    const user = await Profile.findById(req.user._id).select(
      "name profession location profileImage bannerImage connections"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};


module.exports = getProfile; 
