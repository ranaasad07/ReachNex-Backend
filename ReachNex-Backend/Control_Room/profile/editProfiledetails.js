const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');
const { Post } = require('../../Database_Modal/postModal')

const userEditing = async (req, res) => {
    try {
        const { email, bio, gender, showSuggestions } = req.body;

        const updateBio = await User.findOneAndUpdate(
            { email }, // filter by email
            {
                bio,
                gender,
                showSuggestions,
            },
            { new: true }
        );

        if (updateBio) {
            res.status(200).json(updateBio);
        } else {
            res.status(404).json({ message: 'User not found or update failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating bio', error: err.message });
    }
};

module.exports = {
    userEditing
}