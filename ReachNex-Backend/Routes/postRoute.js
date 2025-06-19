const { uploadingPost } = require("../Control_Room/post/uploadpostController")
const { fetchAllPosts } = require("../Control_Room/post/getallpostController")

const express = require("express");
const router = express.Router();

router.post('/uploadPost', uploadingPost);
router.get('/gettingAllPosts', fetchAllPosts);

module.exports = router;
