const express = require("express");
const updateBanner = require("../Control_Room/profile/Banner");
const updateAvatar = require("../Control_Room/profile/changeProfilePic");
const updateDetails = require("../Control_Room/profile/editProfiledetails");
const getProfile = require("../Control_Room/profile/getProfileData");
const  requireAuth  = require("../Control_Room/auth");

const router = express.Router();

// router.use(requireAuth);

router.get("/", getProfile);                  
router.put("/banner",requireAuth,  updateBanner);          
router.put("/avatar",requireAuth,  updateAvatar);          
router.put("/details",requireAuth, updateDetails);

module.exports = router;
 