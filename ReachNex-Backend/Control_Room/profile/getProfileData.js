const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');
// const { Post } = require('../../Database_Modal/postModal');

const getUsernames = async (req, res) => {
  try {
    const { mail } = req.params;

    const findUser = await User.findOne({ email: mail }); // ✅ Correct query

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      username: findUser.username,
      fullName: findUser.fullName,
      profilePic: findUser.profilePicture,
      gender: findUser.gender,
      bio: findUser.bio,
      showSuggestions: findUser.showSuggestions
    });


  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    getUsernames
}