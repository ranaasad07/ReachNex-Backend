const { User } = require("../../Database_Modal/modals");


const profileUser = async (req, res) => {
  const {id} = req.params;
  try {
    const user = await User.findById(id); // Recommended

    if (!user) return res.status(400).json({ message: 'User not founded' });

    res.json({user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
 
module.exports = {
  profileUser
}