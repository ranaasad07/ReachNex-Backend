
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');
const { Post } = require("../../Database_Modal/postModal")

const changeProfilePic = async (req, res) => {
    try {
        const { email, profilePicture } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { profilePicture: profilePicture },
            { new: true }
        );

        if (updatedUser) {
            return res.status(200).json({ message: 'Profile picture changed', user: updatedUser });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }

    } catch (err) {
        console.error('Error updating profile picture:', err);
        return res.status(500).json({ message: 'Could not change profile picture' });
    }
};

module.exports = { changeProfilePic }