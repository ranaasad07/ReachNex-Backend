


const { Post } = require('../../Database_Modal/postModal');

// const { User } = require('../../Database_Modal/modals');

const fetchAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture');

    res.status(200).json({ Posts: posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' }); 
  }
};

module.exports = {fetchAllPosts}
