const express = require("express");
const updateBanner = require("../Control_Room/profile/Banner");
const updateAvatar = require("../Control_Room/profile/changeProfilePic");
const updateDetails = require("../Control_Room/profile/editProfiledetails");
const  requireAuth  = require("../Control_Room/auth");

const router = express.Router();

router.get("/getuserbyusername/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


           
router.put("/banner",requireAuth,  updateBanner);          
router.put("/avatar",requireAuth,  updateAvatar);          
router.put("/details",requireAuth, updateDetails);

module.exports = router;
 