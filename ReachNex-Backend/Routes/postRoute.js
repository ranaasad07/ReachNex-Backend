//  Routes/postRoute.js

const express = require("express");
const router = express.Router();

const { uploadingPost } = require("../Control_Room/post/uploadpostController");
const { fetchAllPosts } = require("../Control_Room/post/getallpostController");
const { likePost, commentPost } = require("../Control_Room/post/postActionController");

//  Post Creation
router.post('/uploadPost', uploadingPost);

//  Get All Posts
router.get('/gettingAllPosts', fetchAllPosts);

//  Like / Unlike a Post
router.post("/likePost", likePost);

// Comment on a Post
router.post("/commentPost", commentPost);

module.exports = router;
