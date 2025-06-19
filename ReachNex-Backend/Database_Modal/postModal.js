const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = {Post}