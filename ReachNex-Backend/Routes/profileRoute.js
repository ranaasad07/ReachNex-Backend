const { changeProfilePic } = require("../Control_Room/profile/changeProfilePic")
const { getUsernames } = require("../Control_Room/profile/getProfileData")
const { userEditing } = require("../Control_Room/profile/editProfiledetails")

const express = require("express");
const router = express.Router();

router.get('/getusernames/:mail', getUsernames)
router.post('/updateProfilePic', changeProfilePic)
router.post('/userediting', userEditing);

module.exports = router;

