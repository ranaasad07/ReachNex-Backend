const { Post } = require('../../Database_Modal/postModal');
const { User } = require('../../Database_Modal/modals'); // make sure this is imported

const fetchAllPosts = async (req, res) => {
  try {
    let posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName profilePicture username') // post user
      .populate('comments.userId', 'fullName profilePicture'); // comment user

    // ✅ Manually populate reply.userId for each reply
    posts = await Promise.all(
      posts.map(async (post) => {
        const populatedComments = await Promise.all(
          post.comments.map(async (comment) => {
            const populatedReplies = await Promise.all(
              comment.replies.map(async (reply) => {
                const user = await User.findById(reply.userId).select('fullName profilePicture');
                return {
                  ...reply.toObject(),
                  userId: user,
                };
              })
            );
            return {
              ...comment.toObject(),
              replies: populatedReplies,
            };
          })
        );

        return {
          ...post.toObject(),
          comments: populatedComments,
        };
      })
    );

    res.status(200).json({ Posts: posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};


module.exports = { fetchAllPosts };
