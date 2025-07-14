const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    // required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: '' 
  },
  Otp: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  bio:{
   type :String
  },
  gender:{
    type:String
  },
  showSuggestions:{
    type :Boolean,
    default:false
  },
  profession: String,
  location: String,
  bannerImage: String, 
  experience: [
  {
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    description: String
  }
],


   skills: {
    type: [String],
    default: [],
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  connections:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingrequsests:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
  type: Boolean,
  default: false
}

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = { User };
