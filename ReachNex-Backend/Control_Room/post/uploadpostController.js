const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../Email_sending_file/sendEmail');
const { User } = require('../../Database_Modal/modals');
const {Post} = require("../../Database_Modal/postModal")


const uploadingPost = async (req, res) => {
  try {
    const { userId, mediaUrl, caption, mediaType } = req.body;

    const newPost = await Post.create({
      userId,
      mediaUrl,
      caption,
      mediaType,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id }
    });

    res.status(200).json({ message: 'Post uploaded successfully', post: newPost });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(400).json({ message: 'Could not upload post' });
  }
};

module.exports = {uploadingPost}