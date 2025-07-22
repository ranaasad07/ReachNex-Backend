// const { User } = require("../../Database_Modal/modals"); // User model import

// const getProfileByUsername = async (req, res) => {
//   const { username } = req.params;

//   try {
//     const user = await User.findOne({ username }).select(
//       "fullName username email profilePicture bannerImage connections location profession"
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json(user);
//   } catch (err) {
//     console.error("Error fetching profile:", err.message);
//     res.status(500).json({ message: "Error fetching profile", error: err.message });
//   }
// };

// module.exports = { getProfileByUsername };
