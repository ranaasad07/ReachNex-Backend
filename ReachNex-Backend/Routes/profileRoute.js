const express = require("express");
const updateBanner = require("../Control_Room/profile/Banner");
const updateAvatar = require("../Control_Room/profile/changeProfilePic");
const updateDetails = require("../Control_Room/profile/editProfiledetails");
// const {getProfileByUsername}  = require("../Control_Room/profile/getProfileData");   
// const { getSkills, addSkill, updateSkill, deleteSkill } = require('../Control_Room/profile/AddSkills')
const  requireAuth  = require("../Control_Room/auth");

const router = express.Router();

// router.use(requireAuth);

// router.get("/user/:username", getProfileByUsername);                 
router.put("/banner",requireAuth,  updateBanner);          
router.put("/avatar",requireAuth,  updateAvatar);          
router.put("/details",requireAuth, updateDetails);
// router.get('/getSkill',requireAuth,  getSkills);
// router.post('/addSkill',requireAuth,  addSkill);
// router.put('/updateSkill',requireAuth,  updateSkill);
// router.delete('/deleteSkill',requireAuth, deleteSkill);

module.exports = router;
 